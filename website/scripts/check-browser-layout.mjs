import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const OUT = path.join(ROOT, "out");
const ARTIFACTS = path.resolve(process.env.LAYOUT_ARTIFACT_DIR ?? path.join(ROOT, "test-results/figure-layout"));
const ORIGIN = "http://127.0.0.1:8127";
const WIDTHS = [320, 390, 768, 1024, 1440, 1920];
const TEXT_WIDTHS = [320, 390, 768, 1024, 1280, 1440, 1920];
const filter = process.argv.find(arg => arg.startsWith("--figure="))?.slice("--figure=".length);
const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".txt": "text/plain", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };

async function discover(directory = OUT) {
  const pages = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !["_next", "assets"].includes(entry.name)) pages.push(...await discover(path.join(directory, entry.name)));
    if (!entry.isFile() || entry.name !== "index.html") continue;
    const file = path.join(directory, entry.name);
    const html = await readFile(file, "utf8");
    const figures = [...html.matchAll(/\bdata-figure="([^"]+)"/gu)].map(match => match[1]);
    const included = figures.filter(id => !filter || id === filter);
    if (included.length) pages.push({ route: "/" + path.relative(OUT, directory).split(path.sep).filter(Boolean).join("/") + "/", figures: included });
  }
  return pages;
}

// Serve the actual production export without opening a port or contacting an
// external site. A fresh browser context still parses CSS, loads fonts, runs
// hydration and lays out every view normally.
async function serveExport(context, missing) {
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== ORIGIN) return route.abort();
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (!path.extname(relative)) relative = path.join(relative, "index.html");
    const file = path.resolve(OUT, relative);
    if (!file.startsWith(OUT + path.sep)) return route.abort();
    try {
      await route.fulfill({ status: 200, contentType: MIME[path.extname(file)] ?? "application/octet-stream", body: await readFile(file) });
    } catch {
      missing.add(url.pathname);
      await route.fulfill({ status: 404, body: "Not found" });
    }
  });
}

function inspectFigure(figure) {
  const rect = element => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height };
  };
  const frame = figure.firstElementChild;
  const bounds = rect(frame);
  const issues = [];
  const shown = element => {
    if (!element.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }) || element.closest('[hidden], math, script, style')) return false;
    // Visually hidden text remains in the layout tree even when CSS clips its
    // entire box. Range rectangles from that hidden copy are not visible ink.
    for (let ancestor = element; ancestor && ancestor !== frame.parentElement; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const clip = /^rect\(([^)]+)\)$/u.exec(style.clip)?.[1].split(/[,\s]+/u).map(Number.parseFloat);
      if (clip?.length === 4 && /absolute|fixed/u.test(style.position) && (clip[1] <= clip[3] || clip[2] <= clip[0])) return false;
    }
    return true;
  };
  const scrollContainer = element => {
    for (let parent = element.parentElement; parent && parent !== frame; parent = parent.parentElement) {
      if (/auto|scroll/u.test(getComputedStyle(parent).overflowX) && parent.scrollWidth > parent.clientWidth + 1) return parent;
    }
    return null;
  };
  const inFrame = (box, element) => {
    const scroll = scrollContainer(element);
    const horizontal = scroll || box.left >= bounds.left - 2 && box.right <= bounds.right + 2;
    return horizontal && box.top >= bounds.top - 2 && box.bottom <= bounds.bottom + 2;
  };
  const marks = [...frame.querySelectorAll('[data-wrap], span[style*="--ax"]')].filter(shown);
  const assertWholeWords = element => {
    const words = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = words.nextNode(); node; node = words.nextNode()) {
      if (!shown(node.parentElement) || node.parentElement.closest('svg, math')) continue;
      for (const match of node.textContent.matchAll(/[A-Za-z]{4,}/gu)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const lines = new Set([...range.getClientRects()].filter(box => box.width > 0).map(box => Math.round(box.top)));
        if (lines.size > 1) issues.push({ kind: "label-word-split", text: match[0] });
      }
    }
  };
  for (const mark of marks) {
    const box = rect(mark);
    if (mark.textContent.trim() && box.width < 1) issues.push({ kind: "collapsed-label", text: mark.textContent.trim(), box, maxWidth: getComputedStyle(mark).maxWidth });
    if (box.width > 0 && !inFrame(box, mark)) issues.push({ kind: "label-outside-frame", text: mark.textContent.trim(), box });
  }
  for (const region of [...frame.querySelectorAll('[data-figure-scroll], [role="region"], [data-research-formula="display"]')].filter(shown)) {
    if (!/auto|scroll/u.test(getComputedStyle(region).overflowX) || region.scrollWidth <= region.clientWidth + 1) continue;
    if (region.tabIndex < 0) issues.push({ kind: "scroll-region-not-keyboard-accessible", label: region.getAttribute("aria-label") });
    const box = rect(region);
    if (box.left < bounds.left - 2 || box.right > bounds.right + 2) issues.push({ kind: "scroll-viewport-outside-frame", label: region.getAttribute("aria-label"), box });
  }
  const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!node.textContent.trim() || !shown(element) || element.closest('svg, math')) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const fragment of range.getClientRects()) {
      if (fragment.width < 0.5 || fragment.height < 0.5) continue;
      const box = { left: fragment.left, right: fragment.right, top: fragment.top, bottom: fragment.bottom, width: fragment.width, height: fragment.height };
      if (!inFrame(box, element)) issues.push({ kind: "text-outside-frame", text: node.textContent.trim(), box });
    }
  }
  // Math is rendered as SVG, so its enclosing inline box needs its own check.
  for (const formula of [...frame.querySelectorAll('[data-research-formula="inline"]')].filter(shown)) {
    // The SVG canvas includes transparent safety gutters, so the check measures
    // its glyph group: only ink counts as mathematical content.
    const ink = formula.querySelector('svg[data-research-svg] g');
    const box = rect(ink ?? formula);
    if (!inFrame(box, formula)) issues.push({ kind: "formula-outside-frame", text: formula.getAttribute("aria-label") ?? formula.textContent.trim(), box });
    if (!ink) continue;
    const inkBox = rect(ink);
    for (let ancestor = formula; ancestor && ancestor !== frame.parentElement; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const clipping = rect(ancestor);
      const isHorizontalScroll = /auto|scroll/u.test(style.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 1;
      // Long expressions may deliberately scroll. An expression whose ink fits
      // in its own box should not lose a glyph merely to its negative margins.
      const canRevealInk = isHorizontalScroll && (ancestor !== formula || inkBox.width > ancestor.clientWidth + 1);
      // Once a containing viewport can expose the content, a still-outer frame
      // does not permanently clip its currently offscreen coordinates.
      if (canRevealInk) break;
      if (/auto|scroll|hidden|clip/u.test(style.overflowX) && !canRevealInk && (inkBox.left < clipping.left - 0.5 || inkBox.right > clipping.right + 0.5)) {
        issues.push({ kind: "formula-ink-clipped", text: formula.querySelector('annotation')?.textContent, ink: inkBox, clipping });
        break;
      }
    }
  }
  let ranking;
  if (figure.dataset.figure === "ranking-reversal") {
    const heads = [...frame.querySelectorAll('[data-ranking-heading], [data-wrap]')].filter(element => /True validity|Observed score/u.test(element.textContent));
    const title = frame.querySelector('p');
    const boxes = heads.map(rect);
    const titleBox = rect(title);
    if (heads.length !== 2) issues.push({ kind: "missing-ranking-headings" });
    heads.forEach((head, index) => {
      assertWholeWords(head);
      const box = boxes[index];
      if (box.width < parseFloat(getComputedStyle(head).fontSize) * 2 || box.top < titleBox.bottom) issues.push({ kind: "unreadable-ranking-heading", text: head.textContent.trim(), box });
      const scroll = scrollContainer(head);
      if (scroll && scroll.tabIndex < 0) issues.push({ kind: "ranking-scroll-not-keyboard-accessible" });
    });
    if (boxes.length === 2) {
      const [a, b] = boxes;
      if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) issues.push({ kind: "ranking-heading-overlap", boxes });
    }
    ranking = { heads: heads.map((head, index) => ({ text: head.textContent.trim(), box: boxes[index], position: getComputedStyle(head).position })), title: titleBox };
  }
  if (figure.dataset.figure === "bridge-leakage") {
    const bands = [...frame.querySelectorAll('[class*="_infoBand"]')].filter(shown);
    if (bands.length !== 3) issues.push({ kind: "missing-information-bands" });
    bands.forEach(assertWholeWords);
  }
  if (figure.dataset.figure === "regret-scenarios") {
    const labels = [...frame.querySelectorAll('[class*="_laneLabel"]')].filter(shown);
    if (!labels.length) issues.push({ kind: "missing-regret-labels" });
    for (const label of labels) {
      const regret = label.parentElement.querySelector('[class*="_laneRegret"]');
      if (!regret) { issues.push({ kind: "missing-regret-value" }); continue; }
      const a = rect(label);
      const b = rect(regret);
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) issues.push({ kind: "regret-label-overlap", label: label.textContent.trim(), regret: regret.textContent.trim(), boxes: [a, b] });
    }
  }
  if (figure.dataset.figure === "dependence-flow-shares") {
    const axes = [...frame.querySelectorAll('[class*="_shareAxis"]')].filter(shown);
    if (axes.length !== 2) issues.push({ kind: "missing-share-axis-labels" });
    for (const axis of axes) {
      const svg = axis.querySelector('svg[data-research-svg]');
      const ink = svg?.querySelector('g');
      const fontSize = parseFloat(getComputedStyle(axis).fontSize);
      if (!svg || !ink || rect(svg).width < fontSize / 4 || rect(svg).width > fontSize * 3 || rect(ink).width < 1 || rect(ink).height < 1) issues.push({ kind: "share-axis-not-rendered", text: axis.querySelector('annotation')?.textContent, svg: svg && rect(svg), ink: ink && rect(ink) });
    }
  }
  // A magnified strip: its window runs down through the axis row above the
  // strip, so no tick label of that axis may sit in the window, and the
  // hairlines that join the two must reach the strip's full width.
  // Its parts fade in as the figure enters, so they are found by layout alone.
  const laidOut = element => !element.closest('[hidden]');
  for (const link of [...frame.querySelectorAll('[data-lens-link]')].filter(laidOut)) {
    const windows = [...frame.querySelectorAll('[data-lens-window]')].filter(laidOut).map(rect);
    const axis = link.previousElementSibling?.querySelector('[class$="_axis"]');
    if (!windows.length || !axis) { issues.push({ kind: "missing-lens-geometry" }); continue; }
    const [left, right] = [Math.min(...windows.map(box => box.left)), Math.max(...windows.map(box => box.right))];
    for (const tick of [...axis.querySelectorAll('[class*="_tickX"]')].filter(shown)) {
      const box = rect(tick);
      if (box.left < right + 2 && box.right > left - 2) issues.push({ kind: "tick-label-in-lens-window", text: tick.textContent.trim(), box, window: { left, right } });
    }
    const strip = rect(link);
    const below = link.nextElementSibling ? rect(link.nextElementSibling) : null;
    if (!below || Math.abs(strip.left - below.left) > 1 || Math.abs(strip.right - below.right) > 1) issues.push({ kind: "lens-link-misaligned", strip, below });
  }
  if (figure.dataset.figure === "heston-candidates") {
    const bars = frame.querySelector('[class*="_bars"]');
    const axis = bars?.querySelector('[class$="_axis"]');
    const labels = [...(bars?.querySelectorAll('[class*="_barLabel"]') ?? [])].filter(shown);
    if (!axis || labels.length !== 5) issues.push({ kind: "missing-candidate-bar-geometry" });
    for (const label of labels) {
      const row = label.parentElement;
      const value = row.querySelector('[class*="_value"]');
      const track = row.querySelector('[class*="_track"]');
      if (!value || !track || !axis) continue;
      const a = rect(label);
      const b = rect(value);
      const line = rect(axis);
      const plot = rect(track);
      if (a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5) issues.push({ kind: "bar-label-value-overlap", label: label.textContent.trim(), boxes: [a, b] });
      if (Math.abs(line.left - plot.left) > 1 || Math.abs(line.right - plot.right) > 1) issues.push({ kind: "bar-axis-track-misaligned", axis: line, track: plot });
    }
  }
  return { bounds, issues, ranking, wrappedLabels: marks.length };
}

// Manuscript tables and displayed equations: a table heading takes at most two
// lines and stays clear of the table's zoom control at either end of its scroll;
// every equation on a page starts on one axis, whatever its length; and every
// equation number stands at its column's right edge, clear of the expression
// once the equation is in full view.
function inspectManuscript() {
  const issues = [];
  const lineCount = element => {
    const tops = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.data.trim() || node.parentElement.closest("math, svg")) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) {
        if (box.width > 0 && !tops.some(top => Math.abs(top - box.top) < box.height / 2)) tops.push(box.top);
      }
    }
    return tops.length;
  };
  for (const heading of document.querySelectorAll("[data-research-table] thead th")) {
    const lines = lineCount(heading);
    if (lines > 2) issues.push({ kind: "table-heading-over-two-lines", heading: heading.textContent.trim(), lines });
  }
  for (const frame of document.querySelectorAll("[data-table-frame]")) {
    const control = frame.querySelector("[data-table-zoom]");
    const region = frame.querySelector('[role="region"]');
    if (!control || control.hidden) continue;
    for (const atScrollEnd of [false, true]) {
      region.scrollLeft = atScrollEnd ? region.scrollWidth : 0;
      const zone = control.getBoundingClientRect();
      for (const heading of frame.querySelectorAll("thead th")) {
        // Visible ink only: heading text and drawn formulas, not the clipped assistive MathML.
        const boxes = [...heading.querySelectorAll("svg")].map(svg => svg.getBoundingClientRect());
        const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
        for (let node = walker.nextNode(); node; node = walker.nextNode()) {
          if (!node.textContent.trim() || node.parentElement.closest("math")) continue;
          const text = document.createRange();
          text.selectNodeContents(node);
          boxes.push(...text.getClientRects());
        }
        const covered = boxes.some(box => box.width > 0 && box.right > zone.left && box.left < zone.right && box.bottom > zone.top && box.top < zone.bottom);
        if (covered) issues.push({ kind: "table-heading-under-zoom-control", heading: heading.textContent.trim(), atScrollEnd });
      }
    }
    region.scrollLeft = 0;
  }
  const starts = new Map();
  const edges = [];
  for (const equation of document.querySelectorAll('[data-research-block-type="equation"]')) {
    // A tabular display keeps the drawing's gutter around its table, so it is measured as a drawing.
    const drawing = equation.querySelector("[data-display-table], svg[data-research-svg]");
    const column = equation.getBoundingClientRect();
    // The ink starts past the drawing's transparent gutter, 0.375em at the drawing's own
    // size, which a fitted equation sets smaller.
    const gutter = 0.375 * parseFloat(getComputedStyle(drawing).fontSize);
    const start = drawing.getBoundingClientRect().left + gutter - column.left;
    const axis = Math.round(start * 2) / 2;
    starts.set(axis, (starts.get(axis) ?? 0) + 1);
    edges.push(start);
    const number = equation.querySelector("[data-equation-number]");
    if (!number) continue;
    const text = document.createRange();
    text.selectNodeContents(number);
    const gap = column.right - text.getBoundingClientRect().right;
    if (Math.abs(gap) > 1) issues.push({ kind: "equation-number-off-right-edge", number: number.textContent, gap });
    equation.scrollLeft = equation.scrollWidth;
    if (drawing.getBoundingClientRect().right > text.getBoundingClientRect().left) issues.push({ kind: "equation-number-overlaps-expression", number: number.textContent });
    equation.scrollLeft = 0;
  }
  if (edges.length && Math.max(...edges) - Math.min(...edges) > 0.5) issues.push({ kind: "equations-start-on-different-axes", starts: [...starts] });

  // A display that is one array is set as a formal table: every cell of a row
  // sits on the row's baseline, rows stand at least one line of mathematics
  // apart, no cell draws a vertical rule, the row that heads the columns stands
  // over a rule, a numbered table is centred on the math axis beside its number,
  // and when it scrolls, row labels that leave room for the values stay in view.
  for (const table of document.querySelectorAll("[data-display-table]")) {
    const region = table.closest('[data-research-block-type="equation"]');
    const size = parseFloat(getComputedStyle(table).fontSize);
    const rows = [...table.children];
    // Each cell opens with a strut 0.25em deep, so the row's baseline lies 0.25em above its foot.
    const baselines = rows.map(row => [...row.children].map(cell => cell.firstElementChild.getBoundingClientRect().bottom - 0.25 * size));
    baselines.forEach((line, index) => {
      if (Math.max(...line) - Math.min(...line) > 0.5) issues.push({ kind: "display-table-row-off-baseline", row: index, baselines: line });
      if (index && line[0] - baselines[index - 1][0] < 1.7348 * size - 0.5) issues.push({ kind: "display-table-rows-closer-than-a-line", row: index, pitch: line[0] - baselines[index - 1][0] });
    });
    for (const cell of table.querySelectorAll(":scope > * > *")) {
      const style = getComputedStyle(cell);
      if (parseFloat(style.borderLeftWidth) || parseFloat(style.borderRightWidth)) issues.push({ kind: "display-table-vertical-rule" });
    }
    const heading = table.querySelector(':scope > [data-rule="header"] > *');
    if (heading && parseFloat(getComputedStyle(heading).borderBottomWidth) < 1) issues.push({ kind: "display-table-heading-without-rule" });
    const number = region.querySelector("[data-equation-number]");
    if (number?.textContent) {
      const face = document.createElement("canvas").getContext("2d");
      const style = getComputedStyle(number);
      face.font = `1000px ${style.fontFamily}`;
      const text = document.createRange();
      text.selectNodeContents(number);
      const baseline = text.getBoundingClientRect().bottom - face.measureText("x").fontBoundingBoxDescent / 1000 * parseFloat(style.fontSize);
      const box = table.getBoundingClientRect();
      const offset = (box.top + box.bottom) / 2 - (baseline - 0.25 * size);
      if (Math.abs(offset) > 1) issues.push({ kind: "display-table-off-math-axis", number: number.textContent, offset });
    }
    const label = rows[0]?.firstElementChild;
    const scrolls = region.scrollWidth > region.clientWidth + 1;
    if (scrolls && label.getBoundingClientRect().width <= 0.45 * region.clientWidth && !region.hasAttribute("data-pinned")) issues.push({ kind: "display-table-labels-not-pinned" });
    if (region.hasAttribute("data-pinned")) {
      const start = label.getBoundingClientRect().left;
      region.scrollLeft = region.scrollWidth;
      const end = label.getBoundingClientRect().left;
      region.scrollLeft = 0;
      if (Math.abs(end - start) > 0.5) issues.push({ kind: "display-table-labels-leave-view", start, end });
    }
  }

  // Mathematics keeps the page's rhythm. A line of prose is taller than the
  // reading leading only where an inline expression itself reaches past the
  // line; every display stands in the same white space, from its expression to
  // the descenders of the line above, to the x-height of the line below, and to
  // a neighboring display.
  const prose = document.querySelector('[data-research-block-type="paragraph"]');
  if (!prose) return issues;
  const style = getComputedStyle(prose);
  const size = parseFloat(style.fontSize);
  const leading = parseFloat(style.lineHeight);
  const face = document.createElement("canvas").getContext("2d");
  face.font = `1000px ${style.fontFamily}`;
  const metric = (glyph, name) => face.measureText(glyph)[name] / 1000 * size;
  const ascent = metric("x", "fontBoundingBoxAscent");
  const descent = metric("x", "fontBoundingBoxDescent");
  const strutAbove = ascent + (leading - ascent - descent) / 2;
  const strutBelow = descent + (leading - ascent - descent) / 2;
  const xHeight = metric("x", "actualBoundingBoxAscent");
  const descender = metric("p", "actualBoundingBoxDescent");
  const baselines = element => {
    const found = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.data.trim() || node.parentElement.closest("math, svg, [data-research-formula]")) continue;
      if (Math.abs(parseFloat(getComputedStyle(node.parentElement).fontSize) - size) > 0.5) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) if (box.width > 0) found.push(box.bottom - descent);
    }
    return found.sort((a, b) => a - b).reduce((lines, baseline) => (!lines.length || baseline - lines.at(-1) > 3 ? [...lines, baseline] : lines), []);
  };
  // A drawing's box less the gutters its canvas keeps around the expression; a
  // tabular display keeps the same gutter around its table.
  const expression = formula => {
    const box = formula.querySelector("[data-display-table], svg[data-research-svg]").getBoundingClientRect();
    const gutter = parseFloat(getComputedStyle(formula).getPropertyValue("--math-gutter")) * parseFloat(getComputedStyle(formula).fontSize);
    return { top: box.top + gutter, bottom: box.bottom - gutter };
  };
  for (const paragraph of document.querySelectorAll('p[data-research-block-type="paragraph"]')) {
    const formulas = [...paragraph.querySelectorAll('[data-research-formula="inline"]')].filter(formula => formula.querySelector("svg"));
    if (!formulas.length) continue;
    const lines = baselines(paragraph);
    const boxes = formulas.map(expression);
    for (let index = 1; index < lines.length; index += 1) {
      const [above, below] = [lines[index - 1], lines[index]];
      if (below - above <= leading + 0.5) continue;
      const reaches = boxes.some(box => (box.bottom > above + strutBelow + 0.5 && box.top < below) || (box.top < below - strutAbove - 0.5 && box.bottom > above));
      if (!reaches) issues.push({ kind: "prose-line-stretched-by-formula-canvas", block: paragraph.dataset.researchBlock, pitch: below - above, leading });
    }
  }
  // Text is measured from its line boxes: the descenders of a line sit above its
  // box's lower edge by the strut's depth less the descender, and its x-height
  // below the upper edge by the strut's height less the x-height. A line that a
  // tall inline expression enlarges keeps the same white space from its edge.
  const whites = [];
  for (const block of document.querySelectorAll('[data-research-block-type="equation"]')) {
    const own = expression(block.querySelector('[data-research-formula="display"]'));
    const previous = block.previousElementSibling;
    const next = block.nextElementSibling;
    if (previous?.matches('p[data-research-block-type="paragraph"]')) {
      whites.push({ side: "above", block: block.dataset.researchBlock, white: own.top - (previous.getBoundingClientRect().bottom - strutBelow + descender) });
    } else if (previous?.matches('[data-research-block-type="equation"]')) {
      whites.push({ side: "between", block: block.dataset.researchBlock, white: own.top - expression(previous.querySelector('[data-research-formula="display"]')).bottom });
    }
    if (next?.matches('p[data-research-block-type="paragraph"]')) {
      whites.push({ side: "below", block: block.dataset.researchBlock, white: next.getBoundingClientRect().top + strutAbove - xHeight - own.bottom });
    }
  }
  if (whites.length) {
    const values = whites.map(entry => entry.white);
    if (Math.max(...values) - Math.min(...values) > 2) {
      const typical = values.sort((a, b) => a - b)[Math.floor(values.length / 2)];
      issues.push({ kind: "display-white-space-uneven", typical, outliers: whites.filter(entry => Math.abs(entry.white - typical) > 1) });
    }
  }
  return issues;
}

// Text that breaks or aligns like a mistake, on every page at every width:
// a list marker whose number and period part, that is wider than its column or
// that touches its text; numbers of one list that do not share their right edge
// and their gap to the text; punctuation pushed to the next line by the formula,
// link or marker it closes against; a word, a number, a number range or a part
// of a written-out address split mid-token; a contents entry whose wrapped title
// returns under its number; and a Return to Text or footer link that wraps.
function inspectText() {
  const issues = [];
  const visibility = new Map();
  const shown = element => {
    if (visibility.has(element)) return visibility.get(element);
    let result = element.checkVisibility({ checkVisibilityCSS: true }) && !element.closest("math, [hidden], script, style, noscript, template");
    for (let node = element; result && node && node !== document.body; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.clipPath === "inset(50%)" || /^rect\(0px,? 0px,? 0px,? 0px\)$/u.test(style.clip)) result = false;
    }
    visibility.set(element, result);
    return result;
  };
  const sameLine = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.3 * Math.min(a.height, b.height);
  const lineCount = rects => rects.reduce((lines, rect) => lines.some(line => sameLine(line, rect)) ? lines : [...lines, rect], []).length;
  const textRects = (node, start, end) => {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    return [...range.getClientRects()].filter(rect => rect.width > 0.5);
  };
  const contentRects = element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return [...range.getClientRects()].filter(rect => rect.width > 0.5);
  };
  const where = element => {
    const owner = element.closest("[id]");
    return `${element.tagName.toLowerCase()}${owner ? ` in #${owner.id}` : ""}`;
  };
  // The first visible glyph or formula of an element after a given descendant.
  const firstInk = (root, skip) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (skip?.contains(node)) continue;
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches('[data-research-formula="inline"]') && shown(node)) return node.getBoundingClientRect();
        continue;
      }
      if (node.parentElement.closest('[data-research-formula="inline"]') || !shown(node.parentElement)) continue;
      const offset = node.data.search(/\S/u);
      if (offset >= 0) return textRects(node, offset, offset + 1)[0];
    }
    return null;
  };

  const lists = new Map();
  const markers = [
    ...[...document.querySelectorAll("[data-list-item]")].map(item => ({ item, marker: item.firstElementChild })),
    ...[...document.querySelectorAll('[role="doc-endnotes"] li, [role="doc-endnotes"] #fn-author')].map(item => ({ item, marker: item.querySelector(':scope > span[aria-hidden="true"]') })),
  ];
  for (const { item, marker } of markers) {
    if (!marker || !shown(item)) continue;
    const ink = contentRects(marker);
    const text = firstInk(item, marker);
    if (!ink.length || !text) continue;
    const label = marker.textContent.trim();
    const left = Math.min(...ink.map(rect => rect.left));
    const right = Math.max(...ink.map(rect => rect.right));
    const column = item.getBoundingClientRect().left;
    if (lineCount(ink) > 1) issues.push({ kind: "list-marker-split", marker: label, item: where(item) });
    if (left < column - 0.5) issues.push({ kind: "list-marker-wider-than-column", marker: label, overhang: +(column - left).toFixed(2), item: where(item) });
    if (text.left - right < 2) issues.push({ kind: "list-marker-touches-text", marker: label, gap: +(text.left - right).toFixed(2), item: where(item) });
    if (!/^\d+\.?$/u.test(label)) continue;
    if (!lists.has(item.parentElement)) lists.set(item.parentElement, []);
    lists.get(item.parentElement).push({ label, right, gap: text.left - right, start: text.left });
  }
  for (const entries of lists.values()) {
    // Items whose text starts on one edge form one list.
    const groups = [];
    for (const entry of entries) {
      const group = groups.find(candidate => Math.abs(candidate[0].start - entry.start) < 0.75);
      if (group) group.push(entry); else groups.push([entry]);
    }
    for (const group of groups.filter(candidate => candidate.length > 1)) {
      const spread = values => Math.max(...values) - Math.min(...values);
      if (spread(group.map(entry => entry.right)) > 0.75) issues.push({ kind: "list-numbers-not-right-aligned", markers: group.map(entry => `${entry.label}@${entry.right.toFixed(1)}`).join(" ") });
      if (spread(group.map(entry => entry.gap)) > 0.75) issues.push({ kind: "list-marker-gaps-differ", markers: group.map(entry => `${entry.label}:${entry.gap.toFixed(1)}`).join(" ") });
    }
  }

  // Punctuation closing against a formula, a link or a marker shares its line.
  const BLOCK = "p, li, td, th, dd, dt, figcaption, h1, h2, h3, h4, blockquote";
  for (const element of document.querySelectorAll('[data-research-formula="inline"], a, [data-list-item] > :first-child')) {
    if (!shown(element) || element.parentElement.closest("[data-research-formula]")) continue;
    const block = element.parentElement.closest(BLOCK);
    if (!block) continue;
    const before = (element.matches('[data-research-formula="inline"]') ? [element.getBoundingClientRect()] : contentRects(element)).at(-1);
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    walker.currentNode = element;
    let next = walker.nextNode();
    while (next && element.contains(next)) next = walker.nextNode();
    if (!before || !next || !shown(next.parentElement) || next.parentElement.closest("math") || !/^[,.;:!?)\]}’”%…]/u.test(next.data)) continue;
    const after = textRects(next, 0, 1)[0];
    if (after && !sameLine(before, after) && after.top > before.top) issues.push({ kind: "punctuation-starts-line", mark: next.data[0], after: where(element) });
  }

  // Words, numbers, number ranges and address parts hold one line.
  const TOKEN = /[\p{L}\p{N}][\p{L}\p{N}\p{M}'’]*(?:[.,][\p{L}\p{N}]+)*%?|\d[\d.,]*[-–]\d[\d.,]*/gu;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.data.trim() || !shown(node.parentElement)) continue;
    for (const match of node.data.matchAll(TOKEN)) {
      if (match[0].length < 2) continue;
      if (lineCount(textRects(node, match.index, match.index + match[0].length)) > 1) issues.push({ kind: "token-split", text: match[0], in: where(node.parentElement) });
    }
  }

  // A numbered contents entry hangs its number.
  for (const link of document.querySelectorAll('nav[aria-label="Article contents"] a[data-numbered]')) {
    if (!shown(link)) continue;
    const [number, title] = link.children;
    const titleLines = contentRects(title);
    if (lineCount(titleLines) < 2) continue;
    const starts = titleLines.map(rect => rect.left);
    if (Math.max(...starts) - Math.min(...starts) > 0.75 || Math.max(...contentRects(number).map(rect => rect.right)) > Math.min(...starts)) issues.push({ kind: "contents-number-not-hanging", entry: link.textContent.trim() });
  }

  // Return links hold one line.
  for (const link of document.querySelectorAll('[role="doc-backlink"], footer a')) {
    if (shown(link) && lineCount(contentRects(link)) > 1) issues.push({ kind: "return-link-wraps", text: link.textContent.trim() });
  }

  // Whole words set the narrowest width of their tracks, so a page never scrolls sideways.
  if (document.documentElement.scrollWidth > innerWidth + 1) issues.push({ kind: "page-scrolls-sideways", scrollWidth: document.documentElement.scrollWidth });
  return issues;
}

// A box shows a scrollbar, or an inline formula's fade, only when its content is
// genuinely wider or taller than its room. The components fit anything that
// overshoots by a little: MathFit sets an equation or formula slightly smaller,
// ZoomStage closes up a table's columns and sets a staged figure whole, and each
// figure comparison and panorama takes its room until that is a tenth short. So
// an overflow, where there is one, is at least a near-miss threshold: 16px, or
// 8% of the room when that is less. Classic scrollbars take room here, as they
// do on Windows, so a scrollbar that forces the other axis to scroll is caught.
const SCROLL_WIDTHS = [[320, 640], [390, 844], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
const NEAR_MISS_PX = 16;
const NEAR_MISS_SHARE = 0.08;

function inspectScrollers({ scope, nearMissPx, nearMissShare }) {
  const root = scope ? document.querySelector(scope) : document.body;
  const owner = element => {
    const figure = element.closest("[data-figure]");
    if (figure) return `figure ${figure.dataset.figure}`;
    const table = element.closest("[data-table-frame]");
    if (table) return `table ${(table.querySelector("[data-table-title]")?.textContent ?? "untitled").trim().slice(0, 60)}`;
    const equation = element.closest('[data-research-block-type="equation"]');
    if (equation) return `equation ${equation.querySelector("[data-equation-number]")?.textContent || equation.id}`;
    if (element.matches("[data-research-formula]")) return `formula ${element.querySelector("annotation")?.textContent.slice(0, 80)}`;
    return [element.tagName.toLowerCase(), ...[...element.classList].map(name => name.replace(/^[\w-]{6}_/u, ""))].join(".");
  };
  const issues = [];
  for (const element of scope ? [root, ...root.querySelectorAll("*")] : root.querySelectorAll("*")) {
    const style = getComputedStyle(element);
    const axes = [
      ["x", style.overflowX, element.scrollWidth - element.clientWidth, element.clientWidth],
      ["y", style.overflowY, element.scrollHeight - element.clientHeight, element.clientHeight],
    ].filter(([, mode]) => /auto|scroll/u.test(mode));
    if (!axes.length || !element.checkVisibility({ checkVisibilityCSS: true }) || !element.getClientRects().length) continue;
    // A box that shows neither a scrollbar nor a fade, such as the contents rail, shows no overflow.
    if (style.scrollbarWidth === "none" && !element.matches("[data-research-formula]")) continue;
    for (const [axis, , overflow, room] of axes) {
      if (overflow > 0 && overflow < Math.min(nearMissPx, nearMissShare * room)) issues.push({ kind: "scroll-near-miss", axis, overflow, room, container: owner(element) });
    }
    // A figure's comparison scrolls sideways only.
    if (element.matches("[data-figure-scroll]") && element.scrollHeight > element.clientHeight) issues.push({ kind: "figure-scroll-vertical-overflow", overflow: element.scrollHeight - element.clientHeight, container: owner(element) });
  }
  return issues;
}

async function discoverPages(directory = OUT) {
  const routes = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !["_next", "assets", "architecture", "_not-found", "404"].includes(entry.name)) routes.push(...await discoverPages(path.join(directory, entry.name)));
    if (entry.isFile() && entry.name === "index.html") routes.push("/" + path.relative(OUT, directory).split(path.sep).filter(Boolean).join("/") + (directory === OUT ? "" : "/"));
  }
  return routes;
}

async function discoverManuscripts(directory = OUT) {
  const routes = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !["_next", "assets"].includes(entry.name)) routes.push(...await discoverManuscripts(path.join(directory, entry.name)));
    if (!entry.isFile() || entry.name !== "index.html") continue;
    if (/data-research-table|data-research-block-type="equation"/u.test(await readFile(path.join(directory, entry.name), "utf8"))) {
      routes.push("/" + path.relative(OUT, directory).split(path.sep).filter(Boolean).join("/") + "/");
    }
  }
  return routes;
}

await mkdir(ARTIFACTS, { recursive: true });
const pages = await discover();
const unique = new Set(pages.flatMap(page => page.figures));
assert.ok(filter ? unique.has(filter) : unique.size >= 30, `Expected ${filter ?? "at least 30 figures"}; found ${unique.size}. Build the site first.`);
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
const records = [];
const home = [];
const noScript = [];
const longNumbers = [];
const manuscripts = [];
const texts = [];
const scrolls = [];
const missing = new Set();
try {
  for (const width of WIDTHS) {
    for (const textScale of [1, 2]) {
      const enlargedFigures = width === 1440 ? ["ranking-reversal", "heston-candidates"] : ["ranking-reversal"];
      const activePages = textScale === 2 ? pages.filter(page => page.figures.some(id => enlargedFigures.includes(id))) : pages;
      for (const entry of activePages) {
        const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
        await serveExport(context, missing);
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", error => errors.push(error.message));
        try {
          await page.goto(ORIGIN + entry.route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          if (textScale === 2) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          for (const id of entry.figures.filter(id => textScale === 1 || enlargedFigures.includes(id))) {
            const figure = page.locator(`[data-figure="${id}"]`);
            await figure.scrollIntoViewIfNeeded();
            const buttons = figure.locator('[data-fig-view]');
            const views = await buttons.evaluateAll(items => items.map(item => item.dataset.figView));
            for (const view of views.length ? views : ["default"]) {
              if (view !== "default") {
                await figure.locator(`[data-fig-view="${view}"]`).click();
                assert.equal(await figure.getAttribute("data-view"), view, `${id}: view control did not activate ${view}`);
              }
              const result = await figure.evaluate(inspectFigure);
              const record = { route: entry.route, id, view, width, textScale, ...result, pageErrors: [...errors] };
              records.push(record);
              if (result.issues.length || id === "ranking-reversal" || id === "heston-candidates" && textScale === 2) {
                const name = `${id}-${view}-${width}-${textScale}x`;
                await figure.screenshot({ path: path.join(ARTIFACTS, name + ".png") });
                record.screenshot = name + ".png";
              }
              const scrollers = figure.locator('[role="region"][tabindex="0"]');
              for (let index = 0; index < await scrollers.count(); index += 1) {
                const scroller = scrollers.nth(index);
                if (!await scroller.isVisible() || !await scroller.evaluate(el => /auto|scroll/u.test(getComputedStyle(el).overflowX) && el.scrollWidth > el.clientWidth + 1)) continue;
                await scroller.evaluate(el => { el.scrollLeft = 0; });
                await scroller.focus();
                await page.keyboard.press("ArrowRight");
                await page.waitForTimeout(180);
                if (!await scroller.evaluate(el => el.scrollLeft > 0)) record.issues.push({ kind: "keyboard-scroll-did-not-move", region: index });
                await scroller.evaluate(el => { el.scrollLeft = el.scrollWidth; });
                if (!await scroller.evaluate(el => Math.abs(el.scrollWidth - el.clientWidth - el.scrollLeft) < 2)) record.issues.push({ kind: "scroll-end-unreachable", region: index });
                await figure.screenshot({ path: path.join(ARTIFACTS, `${id}-${view}-${width}-${textScale}x-right-${index}.png`) });
                const right = await figure.evaluate(inspectFigure);
                record.issues.push(...right.issues.map(issue => ({ ...issue, atScrollEnd: true })));
                await scroller.evaluate(el => { el.scrollLeft = 0; });
              }
            }
          }
        } finally {
          await context.close();
        }
      }
    }
  }
  if (!filter) {
    const manuscriptRoutes = await discoverManuscripts();
    assert.ok(manuscriptRoutes.length >= 7, `Expected at least 7 manuscripts with tables or equations; found ${manuscriptRoutes.length}.`);
    for (const width of WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        for (const route of manuscriptRoutes) {
          await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          // MathFit fits displays and pins table labels in the pass that shows the zoom
          // controls; its first measurements land within two frames.
          await page.waitForFunction(() => !document.querySelector("[data-figure-zoom][hidden], [data-table-zoom][hidden]"));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))));
          manuscripts.push({ route, width, issues: await page.evaluate(inspectManuscript) });
        }
      } finally { await context.close(); }
    }
    const pageRoutes = await discoverPages();
    assert.ok(pageRoutes.length >= 28, `Expected at least 28 pages; found ${pageRoutes.length}.`);
    for (const width of TEXT_WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        for (const route of pageRoutes) {
          await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          texts.push({ route, width, issues: await page.evaluate(inspectText) });
        }
      } finally { await context.close(); }
    }
    for (const width of [320, 390]) {
      for (const textScale of [1, 2]) {
        const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
        await serveExport(context, missing);
        try {
          const page = await context.newPage();
          await page.goto(ORIGIN + "/", { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          if (textScale === 2) await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
          const result = await page.locator('#hero-name').evaluate((heading, scale) => {
            const hero = heading.closest('section').getBoundingClientRect();
            const issues = [];
            if (heading.textContent !== "Theodore Ouyang") issues.push("hero-name-changed");
            if (document.documentElement.scrollWidth > innerWidth + 1) issues.push("page-horizontal-overflow");
            for (const word of heading.children) {
              const range = document.createRange();
              range.selectNodeContents(word);
              const rects = [...range.getClientRects()].filter(rect => rect.width > 0 && rect.height > 0);
              const lines = new Set(rects.map(rect => Math.round(rect.top)));
              if (scale === 1 && lines.size !== 1) issues.push("normal-name-line-wrapped");
              if (rects.some(rect => rect.left < hero.left - 1 || rect.right > hero.right + 1 || rect.top < hero.top - 1 || rect.bottom > hero.bottom + 1)) issues.push("hero-name-clipped");
            }
            return { issues, text: heading.textContent, scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth };
          }, textScale);
          const screenshot = `home-${width}-${textScale}x.png`;
          await page.locator('section[aria-labelledby="hero-name"]').screenshot({ path: path.join(ARTIFACTS, screenshot) });
          home.push({ width, textScale, ...result, screenshot });
        } finally { await context.close(); }
      }
    }
    {
      const context = await browser.newContext({ viewport: { width: 320, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        const route = "/certified-valuation-of-arithmetic-asian-options/";
        await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        const exact = ".000000012711979137";
        const value = page.locator('[data-research-number]').filter({ hasText: exact });
        assert.equal(await value.count(), 1, "The long-number regression target must remain unique.");
        // The number stands in a table cell; the table's region is the scroller that reveals it.
        const number = value.locator('xpath=ancestor::*[@role="region"][1]');
        const issues = [];
        if (await value.textContent() !== exact) issues.push("long-number-text-changed");
        const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
        if (dimensions.scrollWidth > dimensions.viewport + 1) issues.push("long-number-page-overflow");
        if (!await number.evaluate(element => element.tabIndex >= 0 && /auto|scroll/u.test(getComputedStyle(element).overflowX) && element.scrollWidth > element.clientWidth + 1)) issues.push("long-number-scroll-not-keyboard-accessible");
        await number.scrollIntoViewIfNeeded();
        await number.focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForTimeout(180);
        if (!await number.evaluate(element => element.scrollLeft > 0)) issues.push("long-number-keyboard-scroll-did-not-move");
        await number.evaluate(element => { element.scrollLeft = element.scrollWidth; });
        if (!await number.evaluate(element => Math.abs(element.scrollWidth - element.clientWidth - element.scrollLeft) < 2)) issues.push("long-number-scroll-end-unreachable");
        const screenshot = "asian-long-number-320-2x.png";
        await number.locator('..').screenshot({ path: path.join(ARTIFACTS, screenshot) });
        longNumbers.push({ route, width: 320, textScale: 2, text: await value.textContent(), ...dimensions, issues, screenshot });
      } finally { await context.close(); }
    }
    for (const route of ["/certified-valuation-of-arithmetic-asian-options/", "/experience/mangrove-restoration-and-the-limits-of-compensatory-mitigation/"]) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1100 }, javaScriptEnabled: false, serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
        const contents = page.getByRole('navigation', { name: 'Article contents' });
        const links = contents.locator('a');
        const count = await links.count();
        const hidden = [];
        for (let index = 0; index < count; index += 1) if (!await links.nth(index).isVisible()) hidden.push(await links.nth(index).textContent());
        noScript.push({ route, links: count, hidden, issues: count > 0 && hidden.length === 0 ? [] : ["article-contents-hidden-without-javascript"] });
      } finally { await context.close(); }
    }
    const scrollRoutes = await discoverPages();
    assert.ok(scrollRoutes.length >= 25, `Expected at least 25 pages; found ${scrollRoutes.length}.`);
    const scrollBrowser = await chromium.launch({ headless: true, ignoreDefaultArgs: ["--hide-scrollbars"], ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH } : {}) });
    const rule = { nearMissPx: NEAR_MISS_PX, nearMissShare: NEAR_MISS_SHARE };
    try {
      const jobs = SCROLL_WIDTHS.flatMap(size => scrollRoutes.map(route => [size, route]));
      await Promise.all(Array.from({ length: 3 }, async () => {
        for (let job = jobs.shift(); job; job = jobs.shift()) {
          const [[width, height], route] = job;
          const context = await scrollBrowser.newContext({ viewport: { width, height }, reducedMotion: "reduce", serviceWorkers: "block" });
          await serveExport(context, missing);
          try {
            const page = await context.newPage();
            await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
            await page.evaluate(() => document.fonts.ready);
            // The zoom stage shows its controls in the same pass as the fitters start;
            // their first measurements land within two frames.
            await page.waitForFunction(() => !document.querySelector("[data-figure-zoom][hidden], [data-table-zoom][hidden]"));
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))));
            const issues = await page.evaluate(inspectScrollers, { ...rule, scope: null });
            const controls = page.locator("[data-figure-zoom], [data-table-zoom]");
            for (let index = 0; index < await controls.count(); index += 1) {
              const control = controls.nth(index);
              if (!await control.isVisible()) continue;
              const label = await control.evaluate(element => element.closest("[data-figure]")?.dataset.figure ?? element.closest("[data-table-frame]")?.querySelector("[data-table-title]")?.textContent.slice(0, 60) ?? "table");
              await control.click();
              await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
              issues.push(...(await page.evaluate(inspectScrollers, { ...rule, scope: "dialog[open]" })).map(issue => ({ ...issue, stage: label })));
              await page.keyboard.press("Escape");
              await page.waitForFunction(() => !document.querySelector("dialog[open]"));
            }
            scrolls.push({ route, width, height, issues });
          } finally { await context.close(); }
        }
      }));
    } finally { await scrollBrowser.close(); }
  }
} finally {
  await browser.close();
}
const failures = records.filter(record => record.issues.length || record.pageErrors.length);
const otherFailures = [...manuscripts, ...texts, ...home, ...longNumbers, ...noScript, ...scrolls].filter(record => record.issues.length);
const report = { figures: unique.size, widths: WIDTHS, cases: records.length, missingAssets: [...missing], failures: failures.length + otherFailures.length, records, manuscripts, texts, home, longNumbers, noScript, scrolls };
await writeFile(path.join(ARTIFACTS, "results.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ figures: unique.size, cases: records.length, failures: failures.map(({ id, view, width, textScale, issues, pageErrors }) => ({ id, view, width, textScale, issues, pageErrors })), otherFailures, missingAssets: [...missing], artifacts: ARTIFACTS }, null, 2));
assert.equal(missing.size, 0, "The static export is missing requested assets.");
assert.equal(failures.length, 0, "Browser layout regression found collapsed labels, frame escapes, or broken interactions. Inspect results.json and screenshots.");
assert.equal(otherFailures.length, 0, "Manuscript tables or equation numbers, text breaks and list markers, homepage text resizing, long-number scrolling, no-JavaScript navigation, or scroll near-misses regressed.");
