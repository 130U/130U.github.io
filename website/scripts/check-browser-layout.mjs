import assert from "node:assert/strict";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
// The rule that sets a display's formulas side by side as rows, one formula to a row.
const { researchDisplayRows } = await import(pathToFileURL(path.join(ROOT, "app", "lib", "content", "research-math.ts")).href);
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
  const marks = [...frame.querySelectorAll('span[style*="--ax"]')].filter(shown);
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
    // A number of five or more digits after its point stands in digit groups
    // (docs/design.md, Article figures): no run of shown text holds five such
    // digits together.
    if (/\.\d{5,}/u.test(node.textContent)) issues.push({ kind: "figure-number-ungrouped", text: node.textContent.trim().slice(0, 60) });
  }
  // Each digit group stands a thin space, a sixth of an em, after the digits before it.
  for (const group of [...frame.querySelectorAll('[data-digit-group]')].filter(shown)) {
    const style = getComputedStyle(group);
    if (Math.abs(parseFloat(style.marginInlineStart) - parseFloat(style.fontSize) / 6) > 0.25) issues.push({ kind: "figure-digit-group-unspaced", text: group.parentElement.textContent.trim().slice(0, 60), gap: style.marginInlineStart });
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
    const heads = [...frame.querySelectorAll('[data-ranking-heading]')].filter(element => /True validity|Observed score/u.test(element.textContent));
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
  // The reading budget: a caption is set a step below the prose (the reading
  // size is 1rem). Each legend entry, as every short text, holds one line
  // (inspectShortText).
  const caption = figure.querySelector(":scope > figcaption");
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  if (caption && parseFloat(getComputedStyle(caption).fontSize) > 0.9 * rem) issues.push({ kind: "caption-at-reading-size", fontSize: getComputedStyle(caption).fontSize });
  // A figure's own paragraphs keep its spacing on every page: a heading row
  // stands clear of what it heads, and a bracket starts on its first step.
  for (const head of [...frame.querySelectorAll('[class*="_panelTitle"], [class*="_tierAxis"], [class*="_ladderHead"]')].filter(shown)) {
    if (parseFloat(getComputedStyle(head).marginBottom) < 8) issues.push({ kind: "figure-heading-touches-content", text: head.textContent.trim() });
  }
  for (const note of [...frame.querySelectorAll('[class*="_sequenceNote"]')].filter(shown)) {
    if (parseFloat(getComputedStyle(note).marginTop) !== 0) issues.push({ kind: "bracket-off-its-steps", text: note.textContent.trim() });
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
  // A label stands clear of the grid lines and reference rules, or is knocked
  // out of them: a line that runs within a pixel of its glyphs must lie inside
  // an opaque box that holds the text (its background, widened by a box-shadow
  // in the same color), with a pixel to spare on either side of the line.
  const LINE = /_(gridX|gridY|rule|hline|vline|zero)$/u;
  const lines = [...frame.querySelectorAll("span, div")]
    .filter(element => [...element.classList].some(name => LINE.test(name)) && laidOut(element) && shown(element))
    .map(element => ({ element, box: rect(element), name: [...element.classList].find(name => LINE.test(name)).replace(/^.*_/u, "") }))
    .filter(({ box }) => box.width > 0 || box.height > 0);
  const opaque = color => { const alpha = /rgba?\(([^)]+)\)/u.exec(color)?.[1].split(",")[3]; return /^rgb/u.test(color) && (alpha === undefined || Number(alpha) === 1); };
  const knockout = (host, line) => {
    for (let element = host; element && element !== frame && !element.contains(line); element = element.parentElement) {
      const style = getComputedStyle(element);
      if (!opaque(style.backgroundColor)) continue;
      const box = rect(element);
      for (const shadow of style.boxShadow === "none" ? [] : style.boxShadow.split(/,(?![^(]*\))/u)) {
        if (/inset/u.test(shadow) || !shadow.includes(style.backgroundColor)) continue;
        const [x = 0, y = 0, , spread = 0] = shadow.replace(/rgba?\([^)]*\)/u, "").trim().split(/\s+/u).map(Number.parseFloat);
        box.left = Math.min(box.left, box.left + x - spread);
        box.right = Math.max(box.right, box.right + x + spread);
        box.top = Math.min(box.top, box.top + y - spread);
        box.bottom = Math.max(box.bottom, box.bottom + y + spread);
      }
      return box;
    }
    return null;
  };
  const glyphs = [];
  const labelWalker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
  for (let node = labelWalker.nextNode(); node; node = labelWalker.nextNode()) {
    const element = node.parentElement;
    if (!node.textContent.trim() || !shown(element) || element.closest("svg, math")) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const box of range.getClientRects()) if (box.width > 0.5 && box.height > 0.5) glyphs.push({ host: element, text: node.textContent.trim(), box });
  }
  for (const formula of [...frame.querySelectorAll('[data-research-formula="inline"]')].filter(shown)) {
    const ink = formula.querySelector("svg[data-research-svg] g");
    if (ink) glyphs.push({ host: formula, text: formula.querySelector("annotation")?.textContent ?? "formula", box: rect(ink) });
  }
  const crossed = new Set();
  for (const glyph of glyphs) {
    for (const line of lines) {
      const a = glyph.box;
      const b = line.box;
      if (!(a.left < b.right + 1 && b.left < a.right + 1 && a.top < b.bottom + 1 && b.top < a.bottom + 1)) continue;
      const cover = knockout(glyph.host, line.element);
      const vertical = b.height > b.width;
      const held = cover && cover.top <= a.top + 0.5 && cover.bottom >= a.bottom - 0.5 && cover.left <= a.left + 0.5 && cover.right >= a.right - 0.5
        && (vertical ? b.left >= cover.left + 1 && b.right <= cover.right - 1 : b.top >= cover.top + 1 && b.bottom <= cover.bottom - 1);
      const key = `${glyph.text}|${line.name}|${Math.round(vertical ? b.left : b.top)}`;
      if (held || crossed.has(key)) continue;
      crossed.add(key);
      issues.push({ kind: "label-crossed-by-line", text: glyph.text.slice(0, 60), line: line.name, knockout: Boolean(cover), glyph: a, at: vertical ? b.left : b.top });
    }
  }
  // A numbered step hangs its number: a title that wraps continues under its
  // first word, never under the number.
  for (const step of [...frame.querySelectorAll('[class*="_sequenceStep"], [class*="_ladderNode"]')].filter(shown)) {
    const [number, title] = step.children;
    if (!number || !title) { issues.push({ kind: "step-title-not-hung", text: step.textContent.trim() }); continue; }
    const range = document.createRange();
    range.selectNodeContents(title);
    const starts = [...range.getClientRects()].filter(box => box.width > 0.5).map(box => box.left);
    if (Math.max(...starts) - Math.min(...starts) > 0.75 || number.getBoundingClientRect().right > Math.min(...starts)) issues.push({ kind: "step-title-not-hung", text: step.textContent.trim() });
  }
  // A label takes its mark's tone: the accent and green as they are, the light
  // sky and mist in ink, and steel in muted ink, so every label reads as text.
  // A label whose tone had no effect renders in the color it inherits; one that
  // a role such as muted or a note sets on purpose renders in that role's.
  const toneProbe = document.createElement("span");
  frame.append(toneProbe);
  const color = value => { toneProbe.style.color = value; return getComputedStyle(toneProbe).color; };
  const toneText = { ink: color("var(--ink)"), accent: color("var(--accent)"), green: color("var(--chart-green)"), sky: color("var(--ink)"), mist: color("var(--ink)"), steel: color("var(--muted)") };
  toneProbe.remove();
  for (const mark of [...frame.querySelectorAll('span[style*="--ax"]')].filter(shown)) {
    const tone = [...mark.classList].map(name => name.replace(/^.*_/u, "")).find(name => name in toneText);
    const rendered = getComputedStyle(mark).color;
    const inherited = getComputedStyle(mark.parentElement).color;
    if (tone && rendered !== toneText[tone] && rendered === inherited) issues.push({ kind: "label-ignores-its-tone", text: mark.textContent.replace(/\s+/gu, " ").trim().slice(0, 60), tone, rendered, expected: toneText[tone] });
  }
  // A view leaves no more blank paper beneath its content than 60px and 15% of
  // its height together: views that far apart keep their own heights.
  for (const panel of [...frame.querySelectorAll(":scope > [data-fig-panel]")].filter(element => !element.hidden && element.children.length)) {
    const box = rect(panel);
    const content = Math.max(...[...panel.children].filter(shown).map(child => rect(child).bottom + parseFloat(getComputedStyle(child).marginBottom)));
    const blank = box.bottom - content;
    if (Number.isFinite(blank) && blank > 60 && blank > 0.15 * box.height) issues.push({ kind: "view-blank", blank: Math.round(blank), height: Math.round(box.height) });
  }
  // A legend keys what the figure draws: each swatch has a visible mark of its
  // form in its color, and a figure that names none of its marks beside them
  // keys every kind of dot it draws.
  const legendItems = [...frame.querySelectorAll('[class*="_legend"] > li')].filter(shown);
  if (legendItems.length) {
    const svgShapes = [...frame.querySelectorAll("svg :is(path, line, polyline, polygon, rect, circle)")].filter(shape => !shape.closest("svg[data-research-svg], button, [class*='_legend']") && shown(shape));
    const html = [...frame.querySelectorAll("span, div, button")].filter(element => !element.closest("[class*='_legend'], [data-research-formula]") && shown(element));
    const classed = (element, pattern) => [...element.classList].some(name => pattern.test(name));
    // A drawn interval is the kit's absolutely placed range, not a number range in a label's text.
    const interval = element => classed(element, /_range$/u) && getComputedStyle(element).position === "absolute";
    const keyed = [];
    for (const item of legendItems) {
      const swatch = item.querySelector('[class*="_swatch"]');
      if (!swatch) continue;
      // An outlined square swatch keys outlined square marks: an empty cell drawn by
      // its outline, matched by the outline's color.
      const outlined = swatch.hasAttribute("data-ring") && !swatch.dataset.shape;
      const shape = outlined ? "outlined" : swatch.dataset.shape ?? "square";
      const color = outlined ? getComputedStyle(swatch).outlineColor : getComputedStyle(swatch).color;
      const stroked = shapes => svgShapes.some(element => element.matches(shapes) && getComputedStyle(element).stroke === color);
      const dots = selector => html.some(element => classed(element, /_(dot|scenarioDot)$/u) && element.matches(selector) && getComputedStyle(element).color === color);
      const found = {
        line: () => stroked(":not([data-dash], [data-dotted], [data-thick], [data-axis], [data-scatter])"),
        thick: () => stroked("[data-thick]"),
        dash: () => stroked("[data-dash]") || html.some(element => classed(element, /_(hline|vline|rule|budgetRule)$/u)),
        dotted: () => stroked("[data-dotted]"),
        dot: () => dots(":not([data-ring], [data-shape], [data-sign='negative'])") || stroked("[data-scatter]") || svgShapes.some(element => element.matches("circle") && getComputedStyle(element).fill === color),
        ring: () => dots("[data-ring], [data-sign='negative']"),
        triangle: () => dots("[data-shape='triangle']"),
        square: () => html.some(element => !classed(element, /_(dot|scenarioDot)$/u) && getComputedStyle(element).backgroundColor === color) || dots("[data-shape='square']") || svgShapes.some(element => getComputedStyle(element).fill === color),
        outlined: () => html.some(element => element.matches("[data-ring]") && !classed(element, /_(dot|scenarioDot)$/u) && getComputedStyle(element).outlineStyle !== "none" && getComputedStyle(element).outlineColor === color),
        hatch: () => html.some(element => element.matches("[data-hatch], [data-state='unverified']")) || svgShapes.some(element => /url\(/u.test(getComputedStyle(element).fill)),
        box: () => html.some(element => element.matches("[data-state='verified'], [data-ring]") && !classed(element, /_dot$/u)),
        tint: () => svgShapes.some(element => element.matches("[data-fill]") && classed(element, /_(rangeFill|discrepancyShade)$/u)) || html.some(element => classed(element, /_(budgetBand|criticalBand|lensWindow|layerBand)$/u)),
        range: () => html.some(element => interval(element) && getComputedStyle(element).color === color),
      }[shape];
      if (found && !found()) issues.push({ kind: "legend-swatch-without-mark", text: item.textContent.trim(), shape, color });
      keyed.push(`${shape}|${color}`);
    }
    if (!frame.querySelector('span[style*="--ax"]')) {
      for (const dot of html.filter(element => classed(element, /_dot$/u))) {
        const shape = dot.hasAttribute("data-ring") ? "ring" : dot.dataset.shape ?? "dot";
        const key = `${shape}|${getComputedStyle(dot).color}`;
        if (!keyed.includes(key) && !issues.some(issue => issue.kind === "dot-without-legend" && issue.key === key)) issues.push({ kind: "dot-without-legend", key });
      }
    }
  }
  // In a figure that keys its marks in a legend, in any of its views, an
  // interval drawn in a tone other than ink is keyed by the legend the shown
  // view carries, as heston-candidates keys its gray and its accent candidates.
  if (frame.querySelector('[class*="_legend"] > li')) {
    const interval = element => [...element.classList].some(name => /_range$/u.test(name)) && getComputedStyle(element).position === "absolute";
    const keyed = legendItems.flatMap(item => [...item.querySelectorAll('[class*="_swatch"][data-shape="range"]')]).map(swatch => getComputedStyle(swatch).color);
    const probe = document.createElement("span");
    probe.style.color = "var(--ink)";
    frame.append(probe);
    const ink = getComputedStyle(probe).color;
    probe.remove();
    const ranges = [...frame.querySelectorAll("span")].filter(element => !element.closest("[class*='_legend']") && shown(element) && interval(element));
    for (const color of new Set(ranges.map(range => getComputedStyle(range).color))) {
      if (color !== ink && !keyed.includes(color)) issues.push({ kind: "range-without-legend", key: `range|${color}` });
    }
  }
  // A key result's numbers stand over its caps and its notes beside its marks:
  // no two of them may touch, so each reads as its own number.
  const resultLabels = [...frame.querySelectorAll('[data-result-label]')].filter(laidOut).map(label => ({ text: label.textContent.trim(), box: rect(label) }));
  resultLabels.forEach((a, index) => {
    for (const b of resultLabels.slice(index + 1)) {
      if (a.box.left < b.box.right + 4 && b.box.left < a.box.right + 4 && a.box.top < b.box.bottom - 0.5 && b.box.top < a.box.bottom - 0.5) issues.push({ kind: "result-labels-touch", labels: [a.text, b.text], boxes: [a.box, b.box] });
    }
  });
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
  return { bounds, issues, ranking, labels: marks.length };
}

// Every text of a figure holds one line, save its title and the text marked
// data-figure-wraps (a panel's title, a sentence, a question, a node's
// description): labels, values, ticks, key entries, row and lane names, header
// marks, switch segments, step and node titles (docs/design.md, Article
// figures). A unit of text is the run of words in one box, the nearest box
// around them that is not inline, a formula standing as a word of the run around
// it; it holds one line when its glyphs and formulas share one line.
function inspectShortText(figure) {
  const frame = figure.firstElementChild;
  const exempt = "[data-figure-title], [data-figure-wraps], [data-figure-layer], svg, math";
  const hidden = element => {
    if (!element.checkVisibility({ checkVisibilityCSS: true }) || element.closest("[hidden], script, style")) return true;
    for (let ancestor = element; ancestor && ancestor !== frame; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor);
      const clip = /^rect\(([^)]+)\)$/u.exec(style.clip)?.[1].split(/[,\s]+/u).map(Number.parseFloat);
      if (clip?.length === 4 && /absolute|fixed/u.test(style.position) && (clip[1] <= clip[3] || clip[2] <= clip[0])) return true;
    }
    return false;
  };
  const unitOf = node => {
    for (let element = node.parentElement; element && element !== frame; element = element.parentElement) {
      if (element.closest("[data-research-formula]")) continue;
      const style = getComputedStyle(element);
      if (!/^(inline|contents)$/u.test(style.display) || /absolute|fixed/u.test(style.position)) return element;
    }
    return frame;
  };
  const units = new Map();
  const add = (unit, box) => {
    if (!units.has(unit)) units.set(unit, []);
    units.get(unit).push(box);
  };
  const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const element = node.parentElement;
    if (!node.data.trim() || !element || element.closest(exempt) || hidden(element)) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const box of range.getClientRects()) if (box.width > 0.5 && box.height > 0.5) add(unitOf(node), box);
  }
  for (const formula of frame.querySelectorAll('[data-research-formula="inline"]')) {
    const ink = formula.querySelector("svg[data-research-svg] g");
    if (!ink || formula.closest("[data-figure-title], [data-figure-wraps], [data-figure-layer]") || hidden(formula)) continue;
    const box = ink.getBoundingClientRect();
    if (box.width > 0.5) add(unitOf(ink), box);
  }
  const sameLine = (a, b) => Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 0.3 * Math.min(a.height, b.height);
  const issues = [];
  for (const [unit, boxes] of units) {
    const lines = boxes.reduce((found, box) => (found.some(line => sameLine(line, box)) ? found : [...found, box]), []).length;
    if (lines > 1) issues.push({ kind: "figure-text-wraps", text: unit.textContent.replace(/\s+/gu, " ").trim().slice(0, 60), lines, width: Math.round(unit.getBoundingClientRect().width) });
  }
  return issues;
}

// A readout sets its long numbers in the digit groups its labels use
// (docs/design.md, Article figures): the first mark whose readout writes five
// or more digits after a point is pointed at, and the open readout must show
// them in groups, each a thin space after the one before it.
function inspectReadouts(figure) {
  const frame = figure.firstElementChild;
  const target = [...frame.querySelectorAll("[data-tip]")].find(element => /\.\d{5,}/u.test(element.dataset.tip));
  if (!target) return [];
  const issues = [];
  target.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
  const tooltip = frame.querySelector(":scope > div[data-figure-layer]");
  if (!tooltip?.hasAttribute("data-open")) issues.push({ kind: "readout-did-not-open", tip: target.dataset.tip.slice(0, 60) });
  else {
    const runs = [...tooltip.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.data);
    if (runs.some(run => /\.\d{5,}/u.test(run)) || !tooltip.querySelector("[data-digit-group]")) issues.push({ kind: "readout-number-ungrouped", tip: target.dataset.tip.slice(0, 60) });
    for (const group of tooltip.querySelectorAll("[data-digit-group]")) {
      const style = getComputedStyle(group);
      if (Math.abs(parseFloat(style.marginInlineStart) - parseFloat(style.fontSize) / 6) > 0.25) issues.push({ kind: "readout-digit-group-unspaced", tip: target.dataset.tip.slice(0, 60) });
    }
    if (tooltip.textContent !== target.dataset.tip) issues.push({ kind: "readout-text-changed", tip: target.dataset.tip.slice(0, 60) });
  }
  target.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: null }));
  return issues;
}

// A label stands in open space beside the marks it names and never covers a
// curve (docs/design.md, Article figures), whether or not it is knocked out.
// Its text stands 4px clear of every drawn stroke beyond the stroke's half
// width; its knockout or tag holds no point of a stroke and, as a bare
// label's glyphs do, overlaps no dot, bar or bracket; a knockout stands on no
// filled region, where it would paint a hole; and no two labels touch. Tick
// labels on one axis keep 6px between them.
function inspectLabels(figure) {
  const frame = figure.firstElementChild;
  const issues = [];
  const rect = element => {
    const box = element.getBoundingClientRect();
    return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
  };
  const shown = element => element.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }) && !element.closest("[hidden], math, script, style");
  const opaque = color => { const alpha = /rgba?\(([^)]+)\)/u.exec(color)?.[1].split(",")[3]; return /^rgb/u.test(color) && (alpha === undefined || Number(alpha) === 1); };
  // A label turned to run along a line is tested in its own frame, not by the
  // upright box around it.
  const inside = (box, x, y, pad = 0) => {
    if (!box.turn) return x > box.left - pad && x < box.right + pad && y > box.top - pad && y < box.bottom + pad;
    const { cx, cy, halfWidth, halfHeight, cos, sin } = box.turn;
    const along = (x - cx) * cos + (y - cy) * sin;
    const across = -(x - cx) * sin + (y - cy) * cos;
    return Math.abs(along) < halfWidth + pad && Math.abs(across) < halfHeight + pad;
  };
  const labels = [];
  const glyphs = element => {
    const boxes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim() || node.parentElement.closest("svg, math") || !shown(node.parentElement)) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const box of range.getClientRects()) if (box.width > 0.5 && box.height > 0.5) boxes.push({ left: box.left, right: box.right, top: box.top, bottom: box.bottom });
    }
    for (const ink of element.querySelectorAll("svg[data-research-svg] g")) boxes.push(rect(ink));
    return boxes;
  };
  for (const element of [...frame.querySelectorAll('span[style*="--ax"], [class*="_headerMark"]')].filter(shown)) {
    const text = element.textContent.replace(/\s+/gu, " ").trim().slice(0, 60);
    const style = getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform === "none" ? undefined : style.transform);
    if (Math.abs(matrix.b) > 1e-3) {
      const box = rect(element);
      const angle = Math.atan2(matrix.b, matrix.a);
      box.turn = { cx: (box.left + box.right) / 2, cy: (box.top + box.bottom) / 2, halfWidth: element.offsetWidth / 2, halfHeight: element.offsetHeight / 2, cos: Math.cos(angle), sin: Math.sin(angle) };
      labels.push({ element, text, knockout: opaque(style.backgroundColor), boxes: [box], ink: [box] });
      continue;
    }
    if (opaque(style.backgroundColor)) {
      const box = rect(element);
      for (const shadow of style.boxShadow === "none" ? [] : style.boxShadow.split(/,(?![^(]*\))/u)) {
        if (/inset/u.test(shadow)) continue;
        const [x = 0, y = 0, , spread = 0] = shadow.replace(/rgba?\([^)]*\)/u, "").trim().split(/\s+/u).map(Number.parseFloat);
        box.left = Math.min(box.left, box.left + x - spread);
        box.right = Math.max(box.right, box.right + x + spread);
        box.top = Math.min(box.top, box.top + y - spread);
        box.bottom = Math.max(box.bottom, box.bottom + y + spread);
      }
      labels.push({ element, text, knockout: true, boxes: [box], ink: glyphs(element) });
      continue;
    }
    const boxes = glyphs(element);
    if (boxes.length) labels.push({ element, text, knockout: false, boxes, ink: boxes });
  }
  if (labels.length) {
    // Strokes, sampled along each shape at least every 1.5px on screen; a
    // scatter's points are its move-to points.
    const strokes = [];
    const fills = [];
    const shapes = [...frame.querySelectorAll("svg :is(path, line, polyline, polygon, circle, ellipse, rect)")]
      .filter(shape => !shape.closest("svg[data-research-svg], [data-research-formula], button, [data-fig-switch], defs, pattern, clipPath, mask, marker, symbol") && shown(shape));
    for (const shape of shapes) {
      const style = getComputedStyle(shape);
      const matrix = shape.getScreenCTM();
      if (!matrix || Number(style.opacity) === 0) continue;
      const toScreen = (x, y) => new DOMPoint(x, y).matrixTransform(matrix);
      const scale = Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
      const width = Number.parseFloat(style.strokeWidth) * (style.vectorEffect === "non-scaling-stroke" ? 1 : scale);
      if (style.stroke !== "none" && width > 0 && Number(style.strokeOpacity) > 0) {
        const name = [...(shape.classList.length ? shape.classList : shape.parentElement.classList)].map(item => item.replace(/^.*_/u, "")).join(" ") || shape.tagName;
        const points = [];
        if (shape.hasAttribute("data-scatter")) {
          for (const match of (shape.getAttribute("d") ?? "").matchAll(/M\s*(-?[\d.]+)[\s,]+(-?[\d.]+)/gu)) points.push(toScreen(Number(match[1]), Number(match[2])));
        } else {
          const length = shape.getTotalLength();
          if (length > 0) {
            let estimate = 0;
            let previous = toScreen(shape.getPointAtLength(0).x, shape.getPointAtLength(0).y);
            for (let index = 1; index <= 200; index += 1) {
              const point = shape.getPointAtLength((length * index) / 200);
              const next = toScreen(point.x, point.y);
              estimate += Math.hypot(next.x - previous.x, next.y - previous.y);
              previous = next;
            }
            const count = Math.min(8000, Math.max(2, Math.ceil(estimate / 1.5)));
            for (let index = 0; index <= count; index += 1) {
              const point = shape.getPointAtLength((length * index) / count);
              points.push(toScreen(point.x, point.y));
            }
          }
        }
        strokes.push({ name, half: width / 2, points });
      }
      if (style.fill !== "none" && Number(style.fillOpacity) > 0 && typeof shape.isPointInFill === "function") fills.push({ shape, inverse: matrix.inverse(), name: shape.getAttribute("class") ?? shape.tagName });
    }
    const MARK = /_(dot|seg|range|bracket|scenarioDot)$/u;
    const marks = [...frame.querySelectorAll("span")].filter(element => [...element.classList].some(name => MARK.test(name)) && shown(element))
      .map(element => ({ element, name: [...element.classList].find(name => MARK.test(name)).replace(/^.*_/u, ""), box: rect(element) }));
    for (const label of labels) {
      const hits = new Map();
      const hit = (name, count = 1) => hits.set(name, (hits.get(name) ?? 0) + count);
      // The text stands 4px clear of every stroke, beyond the stroke's half
      // width, named or not.
      let nearest = Infinity;
      let nearestStroke = "";
      for (const stroke of strokes) {
        for (const point of stroke.points) {
          for (const box of label.ink) {
            let dx;
            let dy;
            if (box.turn) {
              const { cx, cy, halfWidth, halfHeight, cos, sin } = box.turn;
              dx = Math.max(Math.abs((point.x - cx) * cos + (point.y - cy) * sin) - halfWidth, 0);
              dy = Math.max(Math.abs(-(point.x - cx) * sin + (point.y - cy) * cos) - halfHeight, 0);
            } else {
              dx = Math.max(box.left - point.x, 0, point.x - box.right);
              dy = Math.max(box.top - point.y, 0, point.y - box.bottom);
            }
            if (dx < 12 && dy < 12 && Math.hypot(dx, dy) - stroke.half < nearest) {
              nearest = Math.hypot(dx, dy) - stroke.half;
              nearestStroke = stroke.name;
            }
          }
        }
      }
      if (nearest < 4) issues.push({ kind: "label-touches-curve", text: label.text, clearance: +nearest.toFixed(2), stroke: nearestStroke });
      for (const box of label.boxes) {
        // A knockout or tag may not paint over any stroke's ink.
        for (const stroke of label.knockout ? strokes : []) {
          const count = stroke.points.filter(point => inside(box, point.x, point.y, stroke.half - 0.5)).length;
          if (count) hit(`stroke ${stroke.name}`, count);
        }
        for (const mark of marks) {
          if (label.element.contains(mark.element) || mark.element.contains(label.element)) continue;
          const b = mark.box;
          if (box.left < b.right - 0.5 && b.left < box.right - 0.5 && box.top < b.bottom - 0.5 && b.top < box.bottom - 0.5) hit(mark.name);
        }
        if (!label.knockout) continue;
        for (const fill of fills) {
          let count = 0;
          for (let y = box.top + 1; y < box.bottom - 0.5; y += 2) {
            for (let x = box.left + 1; x < box.right - 0.5; x += 2) {
              if (box.turn && !inside(box, x, y)) continue;
              const point = new DOMPoint(x, y).matrixTransform(fill.inverse);
              if (fill.shape.isPointInFill(point)) count += 1;
            }
          }
          if (count) hit(`fill ${fill.name}`, count);
        }
      }
      if (hits.size) issues.push({ kind: "label-covers-mark", text: label.text, knockout: label.knockout, marks: Object.fromEntries(hits), box: label.boxes[0] });
    }
    // No two labels touch: each keeps 2px of paper around it.
    labels.forEach((a, index) => {
      for (const b of labels.slice(index + 1)) {
        if (a.element.contains(b.element) || b.element.contains(a.element)) continue;
        const touch = a.boxes.some(one => b.boxes.some(two => one.left < two.right + 2 && two.left < one.right + 2 && one.top < two.bottom + 2 && two.top < one.bottom + 2));
        if (touch) issues.push({ kind: "labels-touch", text: `${a.text} / ${b.text}`.slice(0, 80) });
      }
    });
  }
  // A view switch keeps each label inside its own segment, and itself inside
  // the head it stands in.
  for (const control of [...frame.querySelectorAll("[data-fig-switch]")].filter(shown)) {
    const room = rect(control.parentElement);
    const box = rect(control);
    if (box.right > room.right + 0.5 || control.scrollWidth > control.clientWidth + 1) issues.push({ kind: "switch-overflows", text: control.textContent.trim(), width: control.scrollWidth, room: room.right - room.left });
    for (const button of control.querySelectorAll("button")) {
      // Ink only: the words, and a formula's glyphs without its canvas gutters.
      const ink = [];
      const words = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
      for (let node = words.nextNode(); node; node = words.nextNode()) {
        if (!node.textContent.trim() || node.parentElement.closest("svg, math, [class*='assistive']")) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        ink.push(...[...range.getClientRects()].filter(box => box.width > 0.5));
      }
      ink.push(...[...button.querySelectorAll("svg[data-research-svg] g")].map(element => element.getBoundingClientRect()));
      const segment = rect(button);
      if (ink.some(box => box.left < segment.left - 0.5 || box.right > segment.right + 0.5)) issues.push({ kind: "switch-label-outside-segment", text: button.textContent.replace(/\s+/gu, " ").trim() });
    }
  }
  // Tick labels on one axis keep 6px apart.
  const axes = new Map();
  for (const tick of [...frame.querySelectorAll('[class*="_tickX"]')].filter(shown)) {
    if (rect(tick).right - rect(tick).left < 0.5) continue;
    if (!axes.has(tick.parentElement)) axes.set(tick.parentElement, []);
    axes.get(tick.parentElement).push({ text: tick.textContent.trim(), box: rect(tick) });
  }
  for (const ticks of axes.values()) {
    ticks.sort((a, b) => a.box.left - b.box.left);
    ticks.slice(1).forEach((tick, index) => {
      const before = ticks[index];
      if (tick.box.left < before.box.right + 6 && tick.box.top < before.box.bottom && before.box.top < tick.box.bottom) issues.push({ kind: "ticks-touch", ticks: [before.text, tick.text], gap: tick.box.left - before.box.right });
    });
  }
  return issues;
}

// Every table, in the article or (with `scope`, the open stage) zoomed: every
// row holds one line, so every cell that is not in a column of sentences (a
// value, an interval, a number, a row label, a name) takes one line, and a
// heading takes at most two. In the article, a table wider than its column
// scrolls and carries a magnifier; on the stage it is set whole.
function inspectTables(scope) {
  const issues = [];
  const root = scope ? document.querySelector(scope) : document;
  // The lines an element's text and drawn formulas take: boxes whose middles fall within one another's
  // height share a line.
  const lineCount = element => {
    const boxes = [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.data.trim() || node.parentElement.closest("math, svg, [hidden]")) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      boxes.push(...[...range.getClientRects()].filter(box => box.width > 0.5));
    }
    for (const svg of element.querySelectorAll("svg[data-research-svg]")) {
      const box = svg.getBoundingClientRect();
      if (box.width > 0.5 && !svg.closest("[hidden]")) boxes.push(box);
    }
    const lines = [];
    for (const box of boxes.sort((a, b) => a.top - b.top)) {
      const middle = (box.top + box.bottom) / 2;
      const line = lines.find(entry => (middle >= entry.top - 0.5 && middle <= entry.bottom + 0.5) || ((entry.top + entry.bottom) / 2 >= box.top && (entry.top + entry.bottom) / 2 <= box.bottom));
      if (line) {
        line.top = Math.min(line.top, box.top);
        line.bottom = Math.max(line.bottom, box.bottom);
      } else {
        lines.push({ top: box.top, bottom: box.bottom });
      }
    }
    return lines.length;
  };
  for (const table of root.querySelectorAll("[data-research-table]")) {
    const frame = table.closest("[data-table-frame], [data-zoomed]");
    const where = frame.querySelector("[data-table-title]")?.textContent.trim().slice(0, 60) ?? table.closest("[data-math-table]")?.id ?? "untitled";
    for (const cell of table.querySelectorAll("tbody td")) {
      if (cell.hasAttribute("data-sentence") || !cell.offsetWidth) continue;
      const lines = lineCount(cell);
      if (lines > 1) issues.push({ kind: "table-cell-over-one-line", table: where, cell: cell.textContent.trim().slice(0, 40), lines, stage: Boolean(scope) });
    }
    for (const heading of table.querySelectorAll("thead th")) {
      if (heading.hidden) continue;
      const lines = lineCount(heading);
      if (lines > 2) issues.push({ kind: "table-heading-over-two-lines", table: where, heading: heading.textContent.trim().slice(0, 40), lines, stage: Boolean(scope) });
    }
    const region = table.closest('[role="region"]');
    // The blank run past the last column (--snap-end) that makes the scrolled end a column's start is left out.
    const over = region.scrollWidth - (parseFloat(region.style.getPropertyValue("--snap-end")) || 0) - region.clientWidth;
    if (scope) {
      if (over > 1) issues.push({ kind: "table-not-whole-on-stage", table: where, over });
      continue;
    }
    const control = frame.querySelector("[data-table-zoom]");
    if (over > 1 && !/auto|scroll/u.test(getComputedStyle(region).overflowX)) issues.push({ kind: "table-overflows-without-scrolling", table: where, over });
    if (over > 1 && (!control || control.hidden || control.hasAttribute("data-idle"))) issues.push({ kind: "table-scrolls-without-magnifier", table: where, over });
  }
  return issues;
}

// Manuscript tables and displayed equations: a table heading stays clear of the
// table's zoom control at either end of its scroll; every equation on a page
// starts on one axis, whatever its length; and every equation number stands at
// its column's right edge, clear of the expression once the equation is in
// full view.
function inspectManuscript() {
  const issues = [];
  // A table keeps its row labels in view while it scrolls when they take no more than half its
  // room, or when the room beside them, short of the 40px fading edge, holds a column of values
  // whole; and only when that room holds its widest column too. A table that keeps its labels in
  // view snaps its scrolling to the start of a column beside them, so at every resting place, the
  // scrolled end included, no column's text stands half beneath the labels.
  for (const region of document.querySelectorAll('[data-table-frame] [role="region"]')) {
    const table = region.querySelector("table");
    const where = region.closest("[data-table-frame]").querySelector("[data-table-title]")?.textContent.trim().slice(0, 60);
    const [label, ...values] = [...table.rows[0].cells];
    const shown = values.filter(cell => cell.offsetWidth > 0);
    const narrowest = Math.min(...shown.map(cell => cell.offsetWidth - parseFloat(getComputedStyle(cell).paddingLeft) - parseFloat(getComputedStyle(cell).paddingRight)));
    // A column from its start to the end of its text; the blank run past the last column (--snap-end) that
    // makes the scrolled end a column's start is left out of the overflow.
    const snapEnd = parseFloat(region.style.getPropertyValue("--snap-end")) || 0;
    const widest = Math.max(...shown.map(cell => cell.offsetWidth - parseFloat(getComputedStyle(cell).paddingRight)));
    const holds = widest <= region.clientWidth - label.offsetWidth;
    const eligible = holds && (label.offsetWidth <= 0.5 * region.clientWidth || narrowest <= region.clientWidth - label.offsetWidth - 40);
    if (region.scrollWidth - snapEnd > region.clientWidth + 1 && !region.hasAttribute("data-pinned") && eligible) {
      issues.push({ kind: "table-labels-not-pinned", table: where, label: table.rows[0].cells[0].offsetWidth, room: region.clientWidth });
    }
    if (!region.hasAttribute("data-pinned")) continue;
    if (!/x/u.test(getComputedStyle(region).scrollSnapType) || !/mandatory/u.test(getComputedStyle(region).scrollSnapType)) issues.push({ kind: "table-pinned-without-snapping", table: where });
    const start = region.scrollLeft;
    for (const end of [false, true]) {
      region.scrollLeft = end ? region.scrollWidth : 0;
      const edge = label.getBoundingClientRect().right;
      for (const cell of shown) {
        const box = cell.getBoundingClientRect();
        const style = getComputedStyle(cell);
        const left = box.left + parseFloat(style.paddingLeft);
        const right = box.right - parseFloat(style.paddingRight);
        if (left < edge - 1 && right > edge + 1) issues.push({ kind: "table-column-half-under-labels", table: where, atScrollEnd: end, column: cell.textContent.trim().slice(0, 30), hidden: +(edge - left).toFixed(1) });
      }
    }
    region.scrollLeft = start;
  }
  // An inline formula stands on its line's baseline in prose, lists, captions and table cells
  // alike: its drawing's own baseline, the canvas's y = 0, meets the line's within half a pixel.
  // The line's baseline is the foot of an empty inline-block set beside the formula, before it
  // or, where a line breaks there, after it.
  for (const formula of document.querySelectorAll('[data-research-formula="inline"]')) {
    const svg = formula.querySelector(":scope > span > svg[data-research-svg]");
    if (!svg || formula.closest("[data-figure], [data-logic-diagram], [hidden]") || !formula.getClientRects().length) continue;
    const box = svg.getBoundingClientRect();
    const view = svg.viewBox.baseVal;
    const baseline = box.top - view.y * (box.height / view.height);
    const offsets = ["before", "after"].map(side => {
      const probe = document.createElement("span");
      probe.style.cssText = "display:inline-block;width:0;height:0";
      formula[side](probe);
      const line = probe.getBoundingClientRect().bottom;
      probe.remove();
      return baseline - line;
    });
    const offset = offsets.reduce((best, value) => (Math.abs(value) < Math.abs(best) ? value : best));
    if (Math.abs(offset) > 0.5) issues.push({ kind: "inline-formula-off-baseline", tex: formula.querySelector("annotation")?.textContent.slice(0, 40), offset: +offset.toFixed(2), in: formula.closest("td, th")?.tagName.toLowerCase() ?? "text" });
    // The formula clips at its box, as a scroll container does; its ink lies within it.
    const ink = svg.querySelector("g")?.getBoundingClientRect();
    const own = formula.getBoundingClientRect();
    if (ink && (ink.top < own.top - 0.5 || ink.bottom > own.bottom + 0.5)) issues.push({ kind: "inline-formula-ink-clipped", tex: formula.querySelector("annotation")?.textContent.slice(0, 40), ink: [ink.top, ink.bottom], box: [own.top, own.bottom] });
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
  // A column of values aligns on the decimal point: the point of each value's first number, or the
  // end of its integer part where it has no point, stands within half a pixel of the others', bold
  // values among regular ones included; a row whose cell is words or a dash stands outside the
  // column's alignment, and the values around it align all the same. The pads that align a column
  // draw nothing; every value of the page, a table of mathematics' included, stands in one face;
  // and a row that presents a display shows the display's number beside its label.
  const charBox = (root, index) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (index < node.data.length) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        return range.getBoundingClientRect();
      }
      index -= node.data.length;
    }
    return null;
  };
  // Where the first number from `from` on has its point: the left of its point, or the right of its
  // last integer digit (a thousands comma is part of the integer).
  const pointOf = (value, text, from) => {
    let index = from;
    while (index < text.length && !/\d/u.test(text[index]) && !(text[index] === "." && /\d/u.test(text[index + 1] ?? ""))) index += 1;
    if (index >= text.length) return null;
    while (/\d/u.test(text[index] ?? "") || (text[index] === "," && /^\d{3}(?!\d)/u.test(text.slice(index + 1)))) index += 1;
    if (text[index] === ".") return charBox(value, index)?.left ?? null;
    return charBox(value, index - 1)?.right ?? null;
  };
  for (const table of document.querySelectorAll("[data-research-table]")) {
    const body = [...table.tBodies[0].rows];
    const columns = Math.max(...body.map(row => row.cells.length));
    for (let column = 0; column < columns; column += 1) {
      const values = body.map(row => row.cells[column]?.querySelector("[data-table-value]")).filter(value => value && value.getClientRects().length);
      if (values.length < 2) continue;
      const points = values.map(value => pointOf(value, value.textContent, 0)).filter(point => point !== null);
      if (points.length < 2) continue;
      const spread = Math.max(...points) - Math.min(...points);
      if (spread > 0.5) issues.push({ kind: "table-points-misaligned", table: table.closest("[data-table-frame]")?.querySelector("[data-table-title]")?.textContent.trim().slice(0, 60), column, spread: +spread.toFixed(2) });
    }
    for (const pad of table.querySelectorAll("[data-table-pad]")) {
      if (getComputedStyle(pad, "::before").visibility !== "hidden" || pad.textContent) issues.push({ kind: "table-pad-shows", pad: pad.dataset.tablePad });
    }
    for (const lead of table.querySelectorAll("[data-table-lead]")) {
      if (getComputedStyle(lead, "::before").visibility !== "hidden") issues.push({ kind: "table-pad-shows", pad: lead.dataset.tableLead });
    }
    const reading = document.querySelector('p[data-research-block-type="paragraph"]');
    for (const value of table.querySelectorAll("[data-table-value]")) {
      const face = getComputedStyle(value).fontFamily;
      if (reading && face !== getComputedStyle(reading).fontFamily) issues.push({ kind: "table-value-off-the-reading-face", value: value.textContent.slice(0, 30), face });
    }
    for (const row of table.querySelectorAll("tr[data-equation-row]")) {
      const number = row.cells[0]?.querySelector("[data-equation-number]");
      if (!number || !number.getClientRects().length || number.textContent !== `(${row.dataset.equationRow})`) issues.push({ kind: "table-equation-number-missing", row: row.dataset.equationRow });
    }
  }
  const starts = new Map();
  const edges = [];
  // A table of mathematics is set as a research table, and checked as one below; a display
  // set as rows keeps the drawing's gutter around its rows, so it is measured as a drawing.
  const displays = '[data-research-block-type="equation"]:not([data-math-table])';
  // A drawing's baseline is its canvas's y = 0; its ink lies a gutter, 0.375em at its own size,
  // inside its box.
  const baselineOf = svg => {
    const box = svg.getBoundingClientRect();
    const view = svg.viewBox.baseVal;
    return box.top - view.y * (box.height / view.height);
  };
  const gutterOf = element => 0.375 * parseFloat(getComputedStyle(element).fontSize);
  const textBox = element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  const numberBaseline = number => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0";
    number.prepend(probe);
    const line = probe.getBoundingClientRect().bottom;
    probe.remove();
    return line;
  };
  // A display's lines: each row of a stack, or each part of a row that parts, or the one drawing.
  const linesOf = formula => {
    const stack = formula.querySelector("[data-display-stack]");
    if (!stack) return [{ svgs: [...formula.querySelectorAll("svg[data-research-svg]")], kind: "formula" }];
    return [...stack.children].flatMap(row => row.hasAttribute("data-row-parted")
      ? [...row.children].map(part => ({ svgs: [...part.querySelectorAll("svg[data-research-svg]")], kind: part.dataset.rowPart, row }))
      : [{ svgs: [...row.querySelectorAll("svg[data-research-svg]")], kind: "formula", row }]);
  };
  for (const equation of document.querySelectorAll(displays)) {
    const formula = equation.querySelector('[data-research-formula="display"]');
    const box = equation.querySelector("[data-equation-scroll]");
    const drawing = equation.querySelector("[data-display-stack], svg[data-research-svg]");
    const column = equation.getBoundingClientRect();
    // The ink starts past the drawing's transparent gutter, 0.375em at the drawing's own
    // size, which a fitted equation sets smaller.
    const start = drawing.getBoundingClientRect().left + gutterOf(drawing) - column.left;
    const axis = Math.round(start * 2) / 2;
    starts.set(axis, (starts.get(axis) ?? 0) + 1);
    edges.push(start);
    if (!box || box.getAttribute("role") !== "region" || box.tabIndex !== 0) issues.push({ kind: "equation-box-not-a-keyboard-region", number: equation.id });
    const number = equation.querySelector("[data-equation-number]");
    if (!number) continue;
    const label = number.textContent;
    const text = textBox(number);
    const gap = column.right - text.right;
    if (Math.abs(gap) > 1) issues.push({ kind: "equation-number-off-right-edge", number: label, gap });
    box.scrollLeft = 0;
    const scrolls = box.scrollWidth > box.clientWidth + 1;
    const lines = linesOf(formula);
    const last = lines.at(-1).svgs;
    const lastRight = Math.max(...last.map(svg => svg.getBoundingClientRect().right - gutterOf(svg)));
    // In a display set as rows whose earlier row scrolls, the number may stand beside the last
    // row, as TeX sets a tag beside the last line, where that row is not cut: its ink ends short
    // of the fade at the column's edge, reaching back as far as MathFit sets it.
    const fade = equation.querySelector("[data-equation-fade]");
    const fadeStart = fade && getComputedStyle(fade).display !== "none" ? fade.getBoundingClientRect().left - (parseFloat(getComputedStyle(equation).getPropertyValue("--fade-reach")) || 0) : box.getBoundingClientRect().right;
    const lastWhole = Boolean(formula.querySelector("[data-display-stack]")) && lastRight <= fadeStart + 0.5;
    // No ink on the number's line comes within 8px of it, and no number shares a line with an
    // expression that scrolls, save a whole last row: it stands beneath, on a line of its own.
    let besideCut = false;
    for (const line of lines) {
      for (const svg of line.svgs) {
        const ink = svg.getBoundingClientRect();
        if (Math.min(ink.bottom, text.bottom) - Math.max(ink.top, text.top) <= 0.3 * text.height) continue;
        if (scrolls && !(line.svgs === last && lastWhole)) {
          besideCut = true;
          issues.push({ kind: "equation-number-beside-cut-expression", number: label, overflow: box.scrollWidth - box.clientWidth });
        } else if (ink.right - gutterOf(svg) > text.left - 8) issues.push({ kind: "equation-number-overlaps-expression", number: label, gap: +(text.left - ink.right + gutterOf(svg)).toFixed(2) });
      }
    }
    const beneath = text.top >= box.getBoundingClientRect().bottom - 1;
    if (scrolls && !beneath && !besideCut && !lastWhole) issues.push({ kind: "equation-number-not-beneath-scrolling-expression", number: label });
    if (!beneath) continue;
    // Beneath, the number's line is one more row: its baseline stands one line of mathematics
    // (1.8217em of the mathematics, set as the display is) below the last line's, or the last
    // line's depth and the rest of that line where the line is deep, below any scrollbar.
    const lastBaseline = Math.max(...last.map(baselineOf));
    const size = parseFloat(getComputedStyle(drawing).fontSize);
    const depth = Math.max(...last.map(svg => svg.getBoundingClientRect().bottom - gutterOf(svg))) - lastBaseline;
    const scrollbar = box.offsetHeight - box.clientHeight;
    const expected = Math.max(depth, 0.25 * size) + (1.8217 - 0.25) * size + scrollbar;
    const pitch = numberBaseline(number) - lastBaseline;
    if (Math.abs(pitch - expected) > 0.75) issues.push({ kind: "equation-number-beneath-off-the-line", number: label, pitch: +pitch.toFixed(2), expected: +expected.toFixed(2) });
    // A number goes beneath only where no form leaves it room beside: not beside the expression
    // set as small as the floor allows with the narrower gap, nor beside a stack's last line,
    // whether or not an earlier row scrolls.
    const em = parseFloat(getComputedStyle(number).fontSize);
    if (!scrolls) {
      const fit = parseFloat(getComputedStyle(equation).getPropertyValue("--equation-fit")) || 1;
      const ink = drawing.getBoundingClientRect().width - 2 * gutterOf(drawing);
      const padding = parseFloat(getComputedStyle(box).paddingLeft);
      const gutter = gutterOf(drawing) / fit;
      const smallest = padding + gutter * (fit - 0.9) + (ink / fit) * 0.9 + 2 * gutter * 0.9 + em + text.width;
      if (smallest < column.width - 1.5) issues.push({ kind: "equation-number-beneath-with-room-beside", number: label, smallest: +smallest.toFixed(1), column: column.width });
    }
    if (formula.querySelector("[data-display-stack]")) {
      const gapBefore = scrolls ? parseFloat(getComputedStyle(number).paddingLeft) : em;
      if (lastRight + gapBefore + text.width < column.right - 1.5) issues.push({ kind: "equation-number-beneath-with-room-beside-last-line", number: label, scrolls });
    }
  }
  if (edges.length && Math.max(...edges) - Math.min(...edges) > 0.5) issues.push({ kind: "equations-start-on-different-axes", starts: [...starts] });
  // At rest, a display that scrolls visibly fades: the first three quarters of an em of the
  // fade at the column's edge, reaching back as far as MathFit sets it, lie over ink. A display
  // that does not scroll shows no fade.
  for (const equation of document.querySelectorAll(displays)) {
    const box = equation.querySelector("[data-equation-scroll]");
    const fade = equation.querySelector("[data-equation-fade]");
    const shown = fade && getComputedStyle(fade).display !== "none";
    const label = equation.querySelector("[data-equation-number]")?.textContent || equation.id;
    if (box.scrollWidth <= box.clientWidth + 1) {
      if (shown) issues.push({ kind: "display-fades-without-scrolling", number: label });
      continue;
    }
    if (!shown) {
      issues.push({ kind: "display-scrolls-without-fade", number: label });
      continue;
    }
    box.scrollLeft = 0;
    const em = parseFloat(getComputedStyle(fade).fontSize);
    const start = fade.getBoundingClientRect().left - (parseFloat(getComputedStyle(equation).getPropertyValue("--fade-reach")) || 0);
    const inked = [...box.querySelectorAll("svg path, svg rect, svg line")].some(node => {
      const ink = node.getBoundingClientRect();
      return (ink.width || ink.height) && ink.left < start + 0.75 * em && ink.right > start;
    });
    if (!inked) issues.push({ kind: "display-fades-over-blank", number: label });
    // At the end of the scroll the fade stands past the expression's drawing, over blank paper
    // (within the pixel the scroll position rounds to).
    box.scrollLeft = box.scrollWidth;
    const covered = fade.getBoundingClientRect().left < equation.querySelector("[data-display-stack], svg[data-research-svg]").getBoundingClientRect().right - 1;
    box.scrollLeft = 0;
    if (covered) issues.push({ kind: "display-fade-covers-ink-at-scroll-end", number: label });
  }

  // A display that is one array is set as a research table (the research-table
  // checks above hold it too). Every cell of a row stands on the row's baseline;
  // no cell draws a vertical rule; a header band stands over its rule; every
  // cell's mathematics, the header band's included, is set at the table's size,
  // which is at least the label type's x-height equivalent, and no script is
  // smaller than half that size, as in a line of prose; the drawing is
  // decorative beside one assistive expression; a numbered table stands its
  // number at its frame's top-left, in the title's place, in the face of every
  // equation number; it does not scroll from a tablet's width up; and row labels
  // kept in view stay put as it scrolls.
  const numberFace = document.querySelector("[data-equation-edge]") && getComputedStyle(document.querySelector("[data-equation-edge]")).fontFamily;
  for (const block of document.querySelectorAll("[data-math-table]")) {
    const frame = block.querySelector("[data-table-frame]");
    const region = frame.querySelector('[role="region"]');
    const table = region.querySelector("table");
    const where = frame.querySelector("[data-table-title]")?.textContent.slice(0, 40) ?? block.id;
    const size = parseFloat(getComputedStyle(table.tBodies[0].rows[0].cells[0]).fontSize);
    const face = document.createElement("canvas").getContext("2d");
    const baseline = cell => {
      const svg = cell.querySelector("svg[data-research-svg]");
      if (svg) {
        const box = svg.getBoundingClientRect();
        const view = svg.viewBox.baseVal;
        return box.top - view.y * (box.height / view.height);
      }
      const style = getComputedStyle(cell);
      face.font = `${style.fontWeight} 1000px ${style.fontFamily}`;
      const range = document.createRange();
      range.selectNodeContents(cell);
      const line = [...range.getClientRects()].find(rect => rect.width > 0);
      return line && line.bottom - face.measureText("x").fontBoundingBoxDescent / 1000 * parseFloat(style.fontSize);
    };
    for (const row of table.rows) {
      const lines = [...row.cells].map(baseline).filter(value => value !== undefined);
      if (Math.max(...lines) - Math.min(...lines) > 0.5) issues.push({ kind: "math-table-row-off-baseline", table: where, row: row.rowIndex, baselines: lines.map(value => +value.toFixed(2)) });
      for (const cell of row.cells) {
        const style = getComputedStyle(cell);
        if (parseFloat(style.borderLeftWidth) || parseFloat(style.borderRightWidth)) issues.push({ kind: "math-table-vertical-rule", table: where });
      }
    }
    const head = table.tHead?.rows[0];
    if (head && [...head.cells].some(cell => parseFloat(getComputedStyle(cell).borderBottomWidth) < 1)) issues.push({ kind: "math-table-header-without-rule", table: where });
    // The size at which TeX's x-height (0.442em) meets the label type's.
    let floor = 0;
    if (head) {
      const label = getComputedStyle(head.cells[0]);
      face.font = `${label.fontWeight} 1000px ${label.fontFamily}`;
      floor = face.measureText("x").actualBoundingBoxAscent / 1000 * parseFloat(label.fontSize) / 0.442;
    }
    for (const svg of table.querySelectorAll('svg[data-research-svg="cell"]')) {
      const math = parseFloat(getComputedStyle(svg.parentElement).fontSize);
      if (Math.abs(math - size) > 0.05) issues.push({ kind: "math-table-cell-off-the-table-size", table: where, size: math, expected: size });
      if (svg.closest("thead") && math < floor - 0.05) issues.push({ kind: "math-table-header-math-below-label-x-height", table: where, size: math, floor: +floor.toFixed(2) });
      for (const glyph of svg.querySelectorAll("path[data-c]")) {
        const matrix = glyph.getScreenCTM();
        const glyphSize = Math.hypot(matrix.a, matrix.b) * 1000;
        if (glyphSize < size / 2 - 0.05) issues.push({ kind: "math-table-script-below-half-the-size", table: where, size: +glyphSize.toFixed(2) });
      }
    }
    if (table.getAttribute("aria-hidden") !== "true" || block.querySelectorAll("math").length !== 1) issues.push({ kind: "math-table-without-one-assistive-expression", table: where });
    const number = block.querySelector("[data-equation-number]");
    if (number) {
      const text = document.createRange();
      text.selectNodeContents(number);
      const box = text.getBoundingClientRect();
      const title = number.closest("[data-table-title]");
      const start = title && title.getBoundingClientRect().left + parseFloat(getComputedStyle(title).paddingLeft);
      if (!title || title.parentElement !== frame || Math.abs(box.left - start) > 1 || box.bottom > region.getBoundingClientRect().top) issues.push({ kind: "math-table-number-not-at-the-frame-top-left", number: number.textContent, offset: title ? +(box.left - start).toFixed(2) : null });
      if (numberFace && getComputedStyle(number).fontFamily !== numberFace) issues.push({ kind: "math-table-number-off-the-number-face", number: number.textContent, face: getComputedStyle(number).fontFamily });
    }
    // A column whose every cell is a number stands in the reading face as a research table's values do.
    for (const cell of table.querySelectorAll('td[data-cell="value"]')) {
      if (!cell.querySelector("[data-table-value]") || cell.querySelector("svg")) issues.push({ kind: "math-table-number-drawn-as-mathematics", table: where });
    }
    if (region.hasAttribute("data-pinned")) {
      const label = table.rows[0].cells[0];
      const start = label.getBoundingClientRect().left;
      region.scrollLeft = region.scrollWidth;
      const end = label.getBoundingClientRect().left;
      region.scrollLeft = 0;
      if (Math.abs(end - start) > 0.5) issues.push({ kind: "math-table-labels-leave-view", table: where, start, end });
    }
  }

  // A display of formulas set side by side is set as rows: its rows start on one axis, each
  // stands at least a line of mathematics below the one before, and its equation number stands
  // on the last row's baseline unless it stands beneath. A row that parts sets each part on a
  // line of its own, as rows stand: the connecting word and the formula on the axis, the
  // qualifier a \qquad in, past any hang; it parts only where it would otherwise scroll. A row
  // that stands whole sets its parts on its baseline, a manuscript space apart.
  for (const stack of document.querySelectorAll("[data-display-stack]")) {
    const region = stack.closest('[data-research-block-type="equation"]');
    const box = region.querySelector("[data-equation-scroll]");
    const size = parseFloat(getComputedStyle(stack).fontSize);
    const label = region.querySelector("[data-equation-number]")?.textContent || region.id || region.dataset.researchBlock;
    const rows = [...stack.children];
    if (rows.length < (rows.some(row => row.hasAttribute("data-row-parts")) ? 1 : 2) || rows.some(row => !row.querySelector('svg[data-research-svg="row"]'))) {
      issues.push({ kind: "display-stack-without-rows", number: label, rows: rows.length });
      continue;
    }
    const lines = linesOf(stack.closest('[data-research-formula="display"]'));
    const axis = rows[0].querySelector("svg").getBoundingClientRect().left;
    lines.forEach((line, index) => {
      const left = line.svgs[0].getBoundingClientRect().left;
      const indent = line.kind === "qualifier" ? 2 * size + (parseFloat(getComputedStyle(line.row).getPropertyValue("--hang")) || 0) * size : 0;
      if (Math.abs(left - axis - indent) > 0.5) issues.push({ kind: line.kind === "qualifier" ? "display-qualifier-line-off-its-indent" : "display-stack-rows-off-axis", number: label, line: index, offset: +(left - axis - indent).toFixed(2) });
      if (index && Math.min(...line.svgs.map(baselineOf)) - Math.max(...lines[index - 1].svgs.map(baselineOf)) < 1.8217 * size - 0.5) {
        issues.push({ kind: "display-stack-rows-closer-than-a-line", number: label, line: index });
      }
    });
    for (const row of rows.filter(row => row.hasAttribute("data-row-parts"))) {
      const parts = [...row.children];
      if (row.hasAttribute("data-row-parted")) {
        // Whole, the row would have run past the column's room for the expression.
        const joins = parts.slice(1).reduce((sum, part) => sum + parseFloat(getComputedStyle(part).getPropertyValue("--join")) * size, 0);
        const whole = parts.reduce((sum, part) => sum + part.firstElementChild.getBoundingClientRect().width - 2 * gutterOf(part.firstElementChild), 0) + joins + 2 * gutterOf(stack);
        const fit = parseFloat(getComputedStyle(region).getPropertyValue("--equation-fit")) || 1;
        // The column's room for the expression at its natural size, past the manuscript inset.
        const room = box.parentElement.getBoundingClientRect().width - parseFloat(getComputedStyle(box).paddingLeft) + (gutterOf(stack) / fit) * (1 - fit);
        if (whole / fit <= room - 1.5) issues.push({ kind: "display-row-parted-without-need", number: label, whole: +(whole / fit).toFixed(1), room });
        continue;
      }
      const drawings = parts.map(part => part.firstElementChild);
      const baselines = drawings.map(drawing => baselineOf(drawing.querySelector("svg")));
      if (Math.max(...baselines) - Math.min(...baselines) > 0.5) issues.push({ kind: "display-row-parts-off-baseline", number: label });
      drawings.slice(1).forEach((drawing, index) => {
        const space = drawing.getBoundingClientRect().left + gutterOf(drawing) - (drawings[index].getBoundingClientRect().right - gutterOf(drawings[index]));
        const join = parseFloat(getComputedStyle(parts[index + 1]).getPropertyValue("--join")) * size;
        if (Math.abs(space - join) > 0.5) issues.push({ kind: "display-row-parts-off-the-manuscript-space", number: label, space, join });
      });
    }
    const number = region.querySelector("[data-equation-number]");
    if (number?.textContent && numberBaseline(number) < box.getBoundingClientRect().bottom) {
      const last = Math.max(...lines.at(-1).svgs.map(baselineOf));
      if (Math.abs(last - numberBaseline(number)) > 0.5) issues.push({ kind: "display-stack-number-off-last-row", number: label, offset: last - numberBaseline(number) });
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
  // A drawing's box less the gutters its canvas keeps around the expression; a display set
  // as rows keeps the same gutter around its rows.
  const expression = formula => {
    const box = formula.querySelector("[data-display-stack], svg[data-research-svg]").getBoundingClientRect();
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
  // A display's lower edge is its expression's, or, where its number stands on a line of its own
  // beneath it, that number's baseline, which keeps a drawing's gutter below it as ink does.
  const lowest = block => {
    const own = expression(block.querySelector('[data-research-formula="display"]'));
    const number = block.querySelector("[data-equation-number]");
    const box = block.querySelector("[data-equation-scroll]");
    return number && textBox(number).top >= box.getBoundingClientRect().bottom - 1 ? { ...own, bottom: numberBaseline(number) } : own;
  };
  const whites = [];
  for (const block of document.querySelectorAll(displays)) {
    const own = lowest(block);
    const previous = block.previousElementSibling;
    const next = block.nextElementSibling;
    if (previous?.matches('p[data-research-block-type="paragraph"]')) {
      whites.push({ side: "above", block: block.dataset.researchBlock, white: own.top - (previous.getBoundingClientRect().bottom - strutBelow + descender) });
    } else if (previous?.matches(displays)) {
      whites.push({ side: "between", block: block.dataset.researchBlock, white: own.top - lowest(previous).bottom });
    }
    if (next?.matches('p[data-research-block-type="paragraph"]')) {
      whites.push({ side: "below", block: block.dataset.researchBlock, white: next.getBoundingClientRect().top + strutAbove - xHeight - own.bottom });
    }
  }
  if (whites.length) {
    const values = whites.map(entry => entry.white);
    const typical = [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
    if (Math.max(...values) - Math.min(...values) > 2) {
      issues.push({ kind: "display-white-space-uneven", typical, outliers: whites.filter(entry => Math.abs(entry.white - typical) > 1) });
    }
    // The white space is two and a half lines of the manuscript.
    if (Math.abs(typical - 2.5 * leading) > 1.5) issues.push({ kind: "display-white-space-off-the-line", typical, expected: 2.5 * leading });
    // A subsection opens after more white than a display stands in, measured from the
    // descenders of the paragraph above to the heading's capitals.
    for (const heading of document.querySelectorAll("[data-article-body] h3")) {
      const previous = heading.previousElementSibling;
      if (!previous?.matches('p[data-research-block-type="paragraph"]')) continue;
      const own = getComputedStyle(heading);
      const headingSize = parseFloat(own.fontSize);
      face.font = `${own.fontWeight} 1000px ${own.fontFamily}`;
      const measure = face.measureText("H");
      const [headingAscent, headingDescent, cap] = [measure.fontBoundingBoxAscent, measure.fontBoundingBoxDescent, measure.actualBoundingBoxAscent].map(value => value / 1000 * headingSize);
      const capTop = heading.getBoundingClientRect().top + (parseFloat(own.lineHeight) - headingAscent - headingDescent) / 2 + headingAscent - cap;
      const white = capTop - (previous.getBoundingClientRect().bottom - strutBelow + descender);
      if (white <= typical + 8) issues.push({ kind: "subsection-opens-closer-than-a-display", heading: heading.textContent.trim().slice(0, 40), white, display: typical });
    }
  }
  // A paragraph break is one line of the manuscript; a statement, a proof, a
  // paragraph that opens on a run-in head, and the paragraph after a proof's end
  // start a line and a half below the paragraph before them.
  for (const paragraph of document.querySelectorAll('[data-article-body] p[data-research-block-type="paragraph"]')) {
    const previous = paragraph.previousElementSibling;
    if (!previous?.matches('p[data-research-block-type="paragraph"]')) continue;
    if (paragraph.hasAttribute("data-list-item") && previous.hasAttribute("data-list-item")) continue;
    const unit = paragraph.hasAttribute("data-unit") || previous.hasAttribute("data-proof-close");
    const gap = paragraph.getBoundingClientRect().top - previous.getBoundingClientRect().bottom;
    const expected = (unit ? 1.5 : 1) * leading;
    if (Math.abs(gap - expected) > 0.5) issues.push({ kind: unit ? "argument-unit-not-set-off" : "paragraph-break-off-the-line", block: paragraph.dataset.researchBlock, gap, expected });
  }
  // An inline formula stands at the word space: its canvas gutters lie wholly in
  // its negative margins, so nothing widens the space beside it.
  for (const formula of document.querySelectorAll('[data-research-formula="inline"]')) {
    if (!formula.querySelector("svg[data-research-svg]")) continue;
    const own = getComputedStyle(formula);
    const gutter = parseFloat(own.getPropertyValue("--math-gutter")) * parseFloat(own.fontSize);
    if (Math.abs(parseFloat(own.marginLeft) + gutter) > 0.1 || Math.abs(parseFloat(own.marginRight) + gutter) > 0.1) {
      issues.push({ kind: "inline-formula-spaced-past-word-space", tex: formula.querySelector("annotation")?.textContent.slice(0, 40), margins: [own.marginLeft, own.marginRight] });
      break;
    }
  }
  return issues;
}

// Every displayed equation's TeX and, for a display set as rows, the slice of it each row draws.
function drawnDisplayRows() {
  return [...document.querySelectorAll('[data-research-formula="display"]')].map(formula => ({
    tex: formula.querySelector("annotation")?.textContent ?? "",
    number: formula.querySelector("[data-equation-number]")?.textContent || formula.closest("[data-research-block]")?.dataset.researchBlock,
    rows: [...formula.querySelectorAll("[data-stack-row]")].map(row => row.dataset.stackRow.split(" ").map(Number)),
  }));
}

// Text that breaks or aligns like a mistake, on every page at every width:
// a list marker whose number and period part, that is wider than its column or
// that touches its text; numbers of one list that do not share their right edge
// and their gap to the text; punctuation pushed to the next line by the formula,
// link or marker it closes against; a word, a number, a number range or a part
// of a written-out address split mid-token; a contents entry whose wrapped title
// returns under its number; and a Back to Text or footer link that wraps.
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

// The shared frame (docs/design.md, Reading frame, Links and actions, Record strip,
// Detail pages): the rail holds its wordmark and parent link, titles and strip
// values break only between their units, the hanging heading shares its list's
// baseline, a list of one carries no index, and the site footer ends on the
// closing guide.
function inspectFrame() {
  const issues = [];
  const box = element => element.getBoundingClientRect();
  const lines = element => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const tops = [];
    for (const rect of range.getClientRects()) if (rect.width > 0.5 && !tops.some(top => Math.abs(top - rect.top) < rect.height / 2)) tops.push(rect.top);
    return tops.length;
  };
  const baseline = element => {
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
    text.parentNode.insertBefore(probe, text);
    const y = box(probe).top;
    probe.remove();
    return y;
  };
  // The reading start, and every column after it, stands where the equal grid
  // puts it (four of twelve columns on tablets, four of fifteen from 1024px):
  // the rail's growth comes out of the margin-index track before it, which keeps
  // the frames' inset.
  const frame = document.querySelector(".site-frame");
  const readingStart = document.querySelector(".structural-guide-reading-start");
  const railBoundary = document.querySelector(".structural-guide-rail-boundary");
  if (frame && readingStart && railBoundary && innerWidth >= 768 && getComputedStyle(readingStart).display !== "none") {
    const style = getComputedStyle(frame);
    const left = box(frame).left + parseFloat(style.paddingLeft);
    const width = box(frame).width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const expected = left + width * 4 / (innerWidth < 1024 ? 12 : 15);
    const start = box(readingStart).left;
    const inset = Math.min(24, Math.max(20, innerWidth * 0.02));
    if (Math.abs(start - expected) > 0.5) issues.push({ kind: "reading-start-moved", start, expected });
    if (start - box(railBoundary).left < inset - 0.5) issues.push({ kind: "margin-index-track-under-inset", track: start - box(railBoundary).left, inset });
  }
  const rail = document.querySelector(".site-rail");
  const railColumn = rail && getComputedStyle(rail).position === "sticky" && innerWidth >= 768;
  if (railColumn) {
    const mark = box(document.querySelector(".wordmark-mark"));
    const name = box(document.querySelector(".wordmark-name"));
    if (Math.abs((mark.top + mark.bottom) / 2 - (name.top + name.bottom) / 2) > 3 || mark.right > name.left) issues.push({ kind: "rail-wordmark-split" });
    const parent = document.querySelector(".parent-link span");
    if (parent && parent.textContent.length <= "Back to Experience".length && lines(parent) > 1) issues.push({ kind: "rail-parent-link-wraps", text: parent.textContent });
  }
  // A held unit (a title's compound, a strip's place or date) stands on one line
  // whenever the line can hold it.
  for (const unit of document.querySelectorAll(".keep-whole")) {
    if (lines(unit) < 2) continue;
    const probe = unit.cloneNode(true);
    probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;width:max-content";
    unit.parentElement.append(probe);
    const natural = box(probe).width;
    probe.remove();
    if (natural <= box(unit.parentElement).width - 1) issues.push({ kind: "held-unit-split", text: unit.textContent });
  }
  for (const value of document.querySelectorAll("[data-experience-metadata] dd")) {
    const range = document.createRange();
    const text = value.textContent;
    const walker = document.createTreeWalker(value, NodeFilter.SHOW_TEXT);
    let previousTop = null;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      for (let index = 0; index < node.data.length; index += 1) {
        if (/\s/u.test(node.data[index])) continue;
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getClientRects()[0];
        if (!rect) continue;
        if (previousTop !== null && rect.top > previousTop + rect.height / 2 && /[–,;)]/u.test(node.data[index])) issues.push({ kind: "strip-line-starts-with-punctuation", text });
        previousTop = rect.top;
      }
    }
  }
  const contributions = document.querySelector(".content-column > article > [data-experience-contributions]");
  if (contributions && innerWidth >= 1200) {
    const heading = contributions.querySelector("h2");
    const first = contributions.querySelector("ol > li > div");
    if (Math.abs(baseline(heading) - baseline(first)) > 0.5) issues.push({ kind: "contributions-heading-off-baseline", offset: baseline(heading) - baseline(first) });
  }
  for (const list of document.querySelectorAll("[data-experience-contributions] > ol")) {
    const items = [...list.children].filter(item => !item.hasAttribute("data-contribution-note"));
    if (items.length === 1 && !/^(?:none|normal)$/u.test(getComputedStyle(items[0], "::before").content)) issues.push({ kind: "lone-contribution-numbered" });
    for (const note of list.querySelectorAll(":scope > [data-contribution-note]")) {
      if (!/^(?:none|normal)$/u.test(getComputedStyle(note, "::before").content)) issues.push({ kind: "note-numbered" });
    }
  }
  const footer = document.querySelector(".site-footer");
  const closing = document.querySelector(".structural-guide-reading-end");
  if (footer && closing && innerWidth >= 768 && getComputedStyle(closing).display !== "none") {
    const line = box(closing).left + parseFloat(getComputedStyle(closing, "::before").left) + 1;
    if (Math.abs(box(footer).right - line) > 1) issues.push({ kind: "site-footer-off-closing-guide", footer: box(footer).right, guide: line });
  }
  return issues;
}

// A note reference stands close after the word or punctuation it annotates and
// never opens a line, with a fine pointer or a finger, whose larger target takes
// no room in the line.
function inspectNoteReferences() {
  const issues = [];
  for (const link of document.querySelectorAll('sup > a[role="doc-noteref"]:first-of-type')) {
    if (link.closest("dialog") || !link.checkVisibility()) continue;
    const before = link.parentElement.previousSibling;
    if (!before?.textContent.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(before);
    const last = [...range.getClientRects()].filter(box => box.width > 0.5).at(-1);
    range.selectNodeContents(link);
    const glyph = [...range.getClientRects()].filter(box => box.width > 0.5)[0];
    if (!last || !glyph) continue;
    const label = `${before.textContent.trim().slice(-20)}|${link.textContent}`;
    if (glyph.top + glyph.height / 2 > last.bottom) issues.push({ kind: "note-reference-starts-line", reference: label });
    else if (glyph.left - last.right > 3) issues.push({ kind: "note-reference-detached", reference: label, gap: +(glyph.left - last.right).toFixed(2) });
  }
  return issues;
}

// Back to Top returns a page to its top and moves focus to the title; on a page
// that fits the window it steps aside. The sticky rail and phone header hold
// their place to the end of the page.
async function inspectReturn(page) {
  const issues = [];
  const top = page.locator("footer a.top-link");
  if (!await top.count()) return issues;
  const state = await page.evaluate(() => {
    scrollTo(0, document.documentElement.scrollHeight);
    const wordmark = document.querySelector(".wordmark").getBoundingClientRect().top;
    const rail = document.querySelector(".site-rail").getBoundingClientRect();
    return { fits: document.documentElement.scrollHeight <= innerHeight + 1, wordmark, header: rail.bottom - Math.max(rail.top, 0), content: parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--content-top")) };
  });
  const visible = await top.isVisible();
  if (state.fits === visible) issues.push({ kind: state.fits ? "back-to-top-shown-on-page-that-fits" : "back-to-top-hidden" });
  if (viewportWidth(page) >= 768 && Math.abs(state.wordmark - state.content) > 1) issues.push({ kind: "rail-moves-at-page-end", wordmark: state.wordmark });
  if (viewportWidth(page) < 768 && state.header > 64) issues.push({ kind: "phone-header-pinned-too-tall", height: state.header });
  if (!visible) return issues;
  await top.click();
  await page.waitForTimeout(120);
  const landed = await page.evaluate(() => ({ scrollY, focus: document.activeElement?.tagName }));
  if (landed.scrollY !== 0 || landed.focus !== "H1") issues.push({ kind: "back-to-top-misses-top", ...landed });
  return issues;
}

const viewportWidth = page => page.viewportSize().width;

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

// The logic diagram at the head of each Experience article (docs/design.md, Logic
// diagrams). Its connectors are crisp 1px bars in SVG: the bars of one line touch
// or overlap, a bar that runs on in the same direction keeps its center line, a line
// into a bus from one side and out of it on the other is straight, and every line
// ends in one arrowhead centered on it, whose tip meets a node. The loop is one line
// in the accent from the source node's lower edge to the target's. A line never
// crosses a node or a label. Each connector line has one opaque color. Inline
// mathematics sits on its text's baseline within 0.5px, at no less than nine tenths
// of the text's size, inside its node; text on an ink node stands at least 4.5:1 on
// the ink; the nodes of a stage that share a row share one height and start their
// titles on one line; every node title, lane name and stage label holds one line;
// and a hyphenated compound in a description that fits its node holds one line.
const DIAGRAM_WIDTHS = [320, 390, 430, 768, 820, 1024, 1200, 1240, 1280, 1366, 1432, 1440, 1920];

function inspectDiagram() {
  const issues = [];
  const figure = document.querySelector("[data-logic-diagram]");
  if (!figure) return [{ kind: "diagram-missing" }];
  const box = element => element.getBoundingClientRect();
  const shown = element => element.checkVisibility({ checkVisibilityCSS: true }) && box(element).width + box(element).height > 0;
  const round = value => Math.round(value * 100) / 100;
  const nodes = [...figure.querySelectorAll("[data-node]")].filter(shown);
  const nodeBoxes = nodes.map(box);

  // Colors: parse the computed forms Chrome returns (rgb(), rgba() and color(srgb ...)).
  const parse = value => {
    const srgb = /color\(srgb ([\d.e-]+) ([\d.e-]+) ([\d.e-]+)(?: \/ ([\d.]+))?\)/u.exec(value);
    if (srgb) return [Number(srgb[1]) * 255, Number(srgb[2]) * 255, Number(srgb[3]) * 255, srgb[4] === undefined ? 1 : Number(srgb[4])];
    const rgb = /rgba?\(([\d.]+),? ([\d.]+),? ([\d.]+)(?:[,/] ?([\d.]+))?\)/u.exec(value);
    return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), rgb[4] === undefined ? 1 : Number(rgb[4])] : null;
  };
  const luminance = ([r, g, b]) => [r, g, b].map(channel => channel / 255).map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index], 0);
  const contrast = (foreground, background) => {
    const over = foreground.slice(0, 3).map((channel, index) => channel * foreground[3] + background[index] * (1 - foreground[3]));
    const [a, b] = [luminance(over), luminance(background)].sort((x, y) => y - x);
    return (a + 0.05) / (b + 0.05);
  };

  // Connector lines: bars are SVG rects, arrowheads are paths, grouped by drawing.
  const bars = [];
  const arrows = [];
  for (const svg of [...figure.querySelectorAll("svg[data-wire]")].filter(shown)) {
    for (const rect of svg.querySelectorAll("rect")) {
      const b = box(rect);
      if (b.width <= 0 || b.height <= 0) continue;
      const axis = b.width > 1.01 ? "h" : b.height > 1.01 ? "v" : "dot";
      bars.push({ b, axis, wire: svg.dataset.wire, fill: getComputedStyle(rect).fill, center: axis === "h" ? (b.top + b.bottom) / 2 : (b.left + b.right) / 2 });
    }
    for (const path of svg.querySelectorAll("[data-arrow] > path")) {
      arrows.push({ b: box(path), direction: path.parentElement.dataset.arrow, wire: svg.dataset.wire, fill: getComputedStyle(path).fill });
    }
  }
  const touch = (a, b, slack = 0.5) => a.left <= b.right + slack && b.left <= a.right + slack && a.top <= b.bottom + slack && b.top <= a.bottom + slack;
  for (const arrow of arrows) {
    if (!bars.some(bar => bar.wire === arrow.wire && touch(bar.b, arrow.b))) issues.push({ kind: "diagram-arrowhead-without-line", wire: arrow.wire });
  }
  // Connected lines: bars that touch, with the arrowheads they reach.
  const parent = bars.map((_, index) => index);
  const find = index => parent[index] === index ? index : (parent[index] = find(parent[index]));
  bars.forEach((a, i) => bars.forEach((b, j) => { if (j > i && a.wire === b.wire && touch(a.b, b.b)) parent[find(i)] = find(j); }));
  const lines = new Map();
  bars.forEach((bar, index) => lines.set(find(index), [...(lines.get(find(index)) ?? []), bar]));
  for (const [, members] of lines) {
    const ends = arrows.filter(arrow => arrow.wire === members[0].wire && members.some(bar => touch(bar.b, arrow.b)));
    const where = { wire: members[0].wire, at: members.map(bar => [round(bar.b.left), round(bar.b.top)]).slice(0, 2) };
    if (!ends.length || members[0].wire === "loop" && ends.length !== 1) issues.push({ kind: "diagram-line-arrowheads", arrowheads: ends.length, ...where });
    const fills = new Set([...members.map(bar => bar.fill), ...ends.map(arrow => arrow.fill)]);
    if (fills.size > 1) issues.push({ kind: "diagram-line-changes-color", fills: [...fills], ...where });
    for (const fill of fills) if ((parse(fill)?.[3] ?? 0) < 1) issues.push({ kind: "diagram-line-translucent", fill, ...where });
    // A bar that runs on in the same direction keeps the center line of the bar before it.
    members.forEach((a, i) => members.slice(i + 1).forEach(b => {
      if (a.axis !== b.axis || a.axis === "dot" || !touch(a.b, b.b)) return;
      if (Math.abs(a.center - b.center) > 0.5) issues.push({ kind: "diagram-line-steps", offset: round(a.center - b.center), ...where });
    }));
    for (const arrow of ends) {
      const shaft = members.find(bar => touch(bar.b, arrow.b) && bar.axis === (arrow.direction === "right" ? "h" : "v"));
      const axisCenter = arrow.direction === "right" ? (arrow.b.top + arrow.b.bottom) / 2 : (arrow.b.left + arrow.b.right) / 2;
      if (!shaft || Math.abs(shaft.center - axisCenter) > 0.5) issues.push({ kind: "diagram-arrowhead-off-its-line", offset: shaft && round(shaft.center - axisCenter), ...where });
      if (arrow.direction === "down") continue;
      // The tip meets a node's edge: its left edge for a forward arrow, its lower edge for the loop.
      const tip = arrow.direction === "right" ? { x: arrow.b.right, y: axisCenter } : { x: axisCenter, y: arrow.b.top };
      const met = nodeBoxes.some(node => arrow.direction === "right"
        ? Math.abs(node.left - tip.x) <= 0.5 && tip.y > node.top && tip.y < node.bottom
        : Math.abs(node.bottom - tip.y) <= 0.5 && tip.x > node.left && tip.x < node.right);
      if (!met) issues.push({ kind: "diagram-arrowhead-misses-node", tip: [round(tip.x), round(tip.y)], ...where });
      // A forward arrow enters its node at the node's middle.
      const entered = nodeBoxes.find(node => arrow.direction === "right" && Math.abs(node.left - tip.x) <= 0.5 && tip.y > node.top && tip.y < node.bottom);
      if (entered && Math.abs((entered.top + entered.bottom) / 2 - tip.y) > 0.5) issues.push({ kind: "diagram-line-off-node-middle", offset: round(tip.y - (entered.top + entered.bottom) / 2), ...where });
    }
    // A line leaves a node at the node's middle.
    for (const bar of members.filter(member => member.axis === "h")) {
      const left = nodeBoxes.find(node => Math.abs(node.right - bar.b.left) <= 0.5 && bar.center > node.top && bar.center < node.bottom);
      if (left && Math.abs((left.top + left.bottom) / 2 - bar.center) > 0.5) issues.push({ kind: "diagram-line-off-node-middle", offset: round(bar.center - (left.top + left.bottom) / 2), ...where });
    }
  }
  // A line into a bus and a line out of it on the other side are one straight line.
  for (const bus of bars.filter(bar => bar.axis === "v" && bar.b.height > 12)) {
    const sides = bars.filter(bar => bar.axis === "h" && bar.wire === bus.wire && touch(bar.b, bus.b));
    const left = sides.filter(bar => bar.b.left < bus.b.left - 1);
    const right = sides.filter(bar => bar.b.right > bus.b.right + 1);
    for (const a of left) for (const b of right) {
      const offset = Math.abs(a.center - b.center);
      if (offset > 0.5 && offset < 16) issues.push({ kind: "diagram-bus-junction-steps", wire: bus.wire, offset: round(offset) });
    }
  }
  // The loop: one line from the source node's lower edge to the arrowhead at the target's.
  const loopBars = bars.filter(bar => bar.wire === "loop");
  if (loopBars.length) {
    const roots = new Set(bars.flatMap((bar, index) => bar.wire === "loop" ? [find(index)] : []));
    if (roots.size !== 1) issues.push({ kind: "diagram-loop-broken", pieces: roots.size });
    const source = figure.querySelector('[data-loop="source"] [data-node]');
    const legTop = Math.min(...loopBars.filter(bar => bar.axis === "v" && bar.b.left > box(source).left && bar.b.right < box(source).right).map(bar => bar.b.top));
    if (Math.abs(legTop - box(source).bottom) > 0.5) issues.push({ kind: "diagram-loop-leaves-off-the-node", gap: round(legTop - box(source).bottom) });
    // The loop's label is set in the accent; the line takes the same color.
    const accent = parse(getComputedStyle(figure.querySelector("[class*='_loopLabel']")).color);
    if (parse(loopBars[0].fill)?.slice(0, 3).join() !== accent?.slice(0, 3).join()) issues.push({ kind: "diagram-loop-not-in-the-accent", fill: loopBars[0].fill });
  }
  // No line crosses a node or a label.
  const labels = [...figure.querySelectorAll("[class*='_loopLabel'], [class*='_stageLabel']")].filter(shown).map(box);
  for (const bar of bars) {
    const inside = (outer, inner) => inner.left < outer.right - 0.5 && inner.right > outer.left + 0.5 && inner.top < outer.bottom - 0.5 && inner.bottom > outer.top + 0.5;
    if (nodeBoxes.some(node => inside(node, bar.b))) issues.push({ kind: "diagram-line-crosses-node", wire: bar.wire, at: [round(bar.b.left), round(bar.b.top)] });
    for (const label of labels) {
      const text = { left: label.left, right: label.right, top: label.top + 1, bottom: label.bottom };
      if (inside(text, bar.b)) issues.push({ kind: "diagram-line-crosses-label", wire: bar.wire });
    }
  }

  // Inline mathematics: on the text's baseline, at the math size or fitted no smaller
  // than nine tenths of the text, and inside its node.
  for (const piece of [...figure.querySelectorAll("[data-diagram-math-piece]")].filter(shown)) {
    const svg = piece.querySelector("svg[data-research-svg]");
    const [, top, , height] = svg.getAttribute("viewBox").split(/\s+/u).map(Number);
    const drawing = box(svg);
    const mathBaseline = drawing.top + (0 - top) / height * drawing.height;
    // The text's baseline on the formula's line: a zero-size box beside the formula,
    // after it, or before it where a formula that closes a full line pushes the box on.
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
    const textBaseline = ["after", "before"].map(side => {
      piece[side](probe);
      const baseline = box(probe).bottom;
      probe.remove();
      return baseline;
    }).find(baseline => baseline > drawing.top && baseline < drawing.bottom) ?? NaN;
    const tex = piece.closest("[data-research-formula]")?.querySelector("annotation")?.textContent;
    if (!(Math.abs(mathBaseline - textBaseline) <= 0.5)) issues.push({ kind: "diagram-formula-off-baseline", tex, offset: round(mathBaseline - textBaseline) });
    const text = parseFloat(getComputedStyle(piece.parentElement.closest("[class*='_nodeDetail']")).fontSize);
    if (parseFloat(getComputedStyle(piece).fontSize) < 0.9 * text - 0.01) issues.push({ kind: "diagram-formula-too-small", tex, size: getComputedStyle(piece).fontSize });
    const ink = box(svg.querySelector("g"));
    const node = box(piece.closest("[data-node]"));
    if (ink.left < node.left + 1 || ink.right > node.right - 1 || ink.top < node.top + 1 || ink.bottom > node.bottom - 1) issues.push({ kind: "diagram-formula-outside-node", tex });
    if (piece.scrollWidth > piece.clientWidth + 0.5) issues.push({ kind: "diagram-formula-clipped", tex });
  }
  // Text on ink.
  for (const node of [...figure.querySelectorAll("[class*='_emphasis']")].filter(shown)) {
    const background = parse(getComputedStyle(node).backgroundColor);
    for (const part of node.querySelectorAll("[class*='_nodeTitle'], [class*='_nodeDetail'], [class*='_tag'], [data-diagram-math-piece]")) {
      const ratio = contrast(parse(getComputedStyle(part).color), background);
      if (ratio < 4.5) issues.push({ kind: "diagram-ink-text-low-contrast", text: part.textContent.trim().slice(0, 30), ratio: round(ratio) });
    }
  }
  // Nodes of a stage that share a row share one height, and their titles one line.
  const canvas = figure.querySelector("[class*='_canvas']");
  const horizontal = getComputedStyle(canvas).display === "grid";
  for (const stage of figure.querySelectorAll("[data-stage]")) {
    const own = [...stage.querySelectorAll("[data-node]")].filter(shown);
    if (own.length < 2) continue;
    const rows = horizontal ? [own] : Object.values(Object.groupBy(own, node => Math.round(box(node).top)));
    for (const row of rows.filter(row => row.length > 1)) {
      const heights = row.map(node => box(node).height);
      if (Math.max(...heights) - Math.min(...heights) > 0.5) issues.push({ kind: "diagram-stage-nodes-uneven", stage: stage.dataset.stage, heights: heights.map(round) });
    }
    const offsets = own.map(node => box(node.querySelector("[class*='_nodeTitle']")).top - box(node).top);
    if (Math.max(...offsets) - Math.min(...offsets) > 0.5) issues.push({ kind: "diagram-stage-titles-off-one-line", stage: stage.dataset.stage, offsets: offsets.map(round) });
  }
  // Node text stays inside its node; a hyphenated compound that fits its node holds one line.
  for (const node of nodes) {
    if (node.scrollWidth > node.clientWidth + 0.5 || node.scrollHeight > node.clientHeight + 0.5) issues.push({ kind: "diagram-node-text-clipped", text: node.textContent.trim().slice(0, 30) });
  }
  for (const text of [...figure.querySelectorAll("[class*='_nodeTitle'], [class*='_tag'], [class*='_stageLabel']")].filter(shown)) {
    const range = document.createRange();
    range.selectNodeContents(text);
    const tops = [];
    for (const rect of range.getClientRects()) if (rect.width > 0.5 && !tops.some(top => Math.abs(top - rect.top) < rect.height / 2)) tops.push(rect.top);
    if (tops.length > 1) issues.push({ kind: "diagram-text-wraps", text: text.textContent.trim().slice(0, 40), lines: tops.length });
  }
  for (const compound of [...figure.querySelectorAll("[data-compound]")].filter(shown)) {
    const range = document.createRange();
    range.selectNodeContents(compound);
    const lines = new Set([...range.getClientRects()].filter(rect => rect.width > 0).map(rect => Math.round(rect.top)));
    const room = compound.parentElement.getBoundingClientRect().width;
    if (lines.size > 1 && box(compound).width < room - 1) issues.push({ kind: "diagram-compound-breaks", text: compound.textContent });
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
const diagrams = [];
const frames = [];
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
              result.issues.push(...await figure.evaluate(inspectLabels));
              result.issues.push(...await figure.evaluate(inspectShortText));
              if (width === 1440 && textScale === 1 && view === (views[0] ?? "default")) result.issues.push(...await figure.evaluate(inspectReadouts));
              // Labels keep their places at every column width, not only at the
              // viewports above: the figure is set at each width from 280px to
              // 600px, past the widest column (576px), in 4px steps up to 520px
              // and 8px beyond, its container
              // queries following, and its labels, switch and ticks are checked
              // again once a view switch has refitted.
              if (width === 1440 && textScale === 1) {
                const swept = new Map();
                for (let size = 280; size <= 600; size += size < 520 ? 4 : 8) {
                  await figure.evaluate(async (element, value) => {
                    element.style.width = `${value}px`;
                    if (element.querySelector("[data-fig-switch]")) await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
                  }, size);
                  for (const issue of [...await figure.evaluate(inspectLabels), ...await figure.evaluate(inspectShortText)]) {
                    const key = `${issue.kind}|${issue.text ?? issue.ticks?.join(" ")}`;
                    if (!swept.has(key)) swept.set(key, { ...issue, figureWidths: [] });
                    swept.get(key).figureWidths.push(size);
                  }
                }
                await figure.evaluate(element => { element.style.width = ""; });
                result.issues.push(...swept.values());
              }
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
                // The key's scroll lands within a few frames; a busy machine may take longer.
                await scroller.evaluate(el => new Promise(resolve => {
                  const start = performance.now();
                  const wait = () => el.scrollLeft > 0 || performance.now() - start > 1000 ? resolve() : requestAnimationFrame(wait);
                  wait();
                }));
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
          const issues = await page.evaluate(inspectManuscript);
          issues.push(...await page.evaluate(inspectTables, null));
          // No display row holds two formulas: each row a stacked display draws, and every other
          // display whole, is one formula by the rule that sets formulas side by side as rows.
          if (width === WIDTHS[0]) {
            for (const display of await page.evaluate(drawnDisplayRows)) {
              for (const row of display.rows.length ? display.rows.map(([start, end]) => display.tex.slice(start, end)) : [display.tex]) {
                if (researchDisplayRows(row)) issues.push({ kind: "display-row-holds-two-formulas", number: display.number, row: row.slice(0, 80) });
              }
            }
          }
          manuscripts.push({ route, width, issues });
        }
      } finally { await context.close(); }
    }
    // Every table holds one line per row at the large phone and tablet widths between the check
    // widths too; and at a phone's, a tablet's and a desktop's width the stage sets every table
    // whose magnifier shows whole, one line per row.
    const tableRoutes = [];
    for (const route of manuscriptRoutes) {
      if (/data-research-table/u.test(await readFile(path.join(OUT, route, "index.html"), "utf8"))) tableRoutes.push(route);
    }
    assert.ok(tableRoutes.length >= 9, `Expected at least 9 pages with tables; found ${tableRoutes.length}.`);
    for (const width of [390, 430, 820, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        for (const route of tableRoutes) {
          await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForFunction(() => !document.querySelector("[data-table-zoom][hidden]"));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100)))));
          const issues = [430, 820].includes(width) ? await page.evaluate(inspectTables, null) : [];
          if ([390, 820, 1440].includes(width)) {
            const controls = page.locator("[data-table-zoom]:not([data-idle])");
            for (let index = 0; index < await controls.count(); index += 1) {
              await controls.nth(index).click();
              await page.waitForSelector("dialog[open] [data-research-table]");
              await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
              issues.push(...await page.evaluate(inspectTables, "dialog[open]"));
              await page.keyboard.press("Escape");
              await page.waitForFunction(() => !document.querySelector("dialog[open]"));
            }
          }
          manuscripts.push({ route, width, tables: true, issues });
        }
      } finally { await context.close(); }
    }
    const diagramRoutes = [];
    for (const route of await discoverPages()) {
      if (/data-logic-diagram/u.test(await readFile(path.join(OUT, route, "index.html"), "utf8"))) diagramRoutes.push(route);
    }
    assert.equal(diagramRoutes.length, 8, `Expected 8 logic diagrams; found ${diagramRoutes.length}.`);
    for (const width of DIAGRAM_WIDTHS) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        for (const route of diagramRoutes) {
          await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          const issues = await page.evaluate(inspectDiagram);
          const record = { route, width, issues };
          if (issues.length) {
            record.screenshot = `diagram-${route.split("/").filter(Boolean).at(-1)}-${width}.png`;
            await page.locator("[data-logic-diagram]").screenshot({ path: path.join(ARTIFACTS, record.screenshot) });
          }
          diagrams.push(record);
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
          const frameIssues = await page.evaluate(inspectFrame);
          if ([390, 768, 1024, 1440].includes(width)) frameIssues.push(...await inspectReturn(page));
          frames.push({ route, width, issues: frameIssues });
        }
      } finally { await context.close(); }
    }
    // Note references on phones and tablets, which take a finger's target, and on desktops.
    const notedRoutes = [];
    for (const route of pageRoutes) {
      if ((await readFile(path.join(OUT, route, "index.html"), "utf8")).includes('role="doc-noteref"')) notedRoutes.push(route);
    }
    assert.ok(notedRoutes.length >= 4, `Expected the four legal articles to carry note references; found ${notedRoutes.length}.`);
    for (const width of [320, 390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, isMobile: width < 768, hasTouch: width < 1200, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        for (const route of notedRoutes) {
          await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          texts.push({ route, width, touch: width < 1200, issues: await page.evaluate(inspectNoteReferences) });
        }
      } finally { await context.close(); }
    }
    // The frame at the tablet widths between the text widths, on a page of each kind.
    for (const width of [820, 834, 900, 1100, 1180]) {
      const context = await browser.newContext({ viewport: { width, height: 1100 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        for (const route of ["/", "/experience/", "/experience/jiritsu-network/", "/certified-valuation-of-arithmetic-asian-options/", "/coursework/"]) {
          await page.goto(ORIGIN + route, { waitUntil: "networkidle" });
          await page.evaluate(() => document.fonts.ready);
          frames.push({ route, width, issues: await page.evaluate(inspectFrame) });
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
        // The key's scroll lands within a few frames; a busy machine may take longer.
        await number.evaluate(element => new Promise(resolve => {
          const start = performance.now();
          const wait = () => element.scrollLeft > 0 || performance.now() - start > 1000 ? resolve() : requestAnimationFrame(wait);
          wait();
        }));
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
    // The hero stacks on portrait tablets, the 13-inch iPad included, and fills their first
    // screen; landscape tablets keep the name beside the instrument.
    for (const [width, height, stacked] of [[820, 1180, true], [1024, 1366, true], [1180, 820, false], [1366, 1024, false]]) {
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        await page.goto(ORIGIN + "/", { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        const result = await page.locator('section[aria-labelledby="hero-name"]').evaluate((hero, expected) => {
          const frame = hero.firstElementChild;
          const columns = getComputedStyle(frame).gridTemplateColumns.split(" ").length;
          const band = frame.getBoundingClientRect().top - hero.getBoundingClientRect().top;
          const issues = [];
          if ((columns === 1) !== expected) issues.push(expected ? "hero-not-stacked-on-portrait-tablet" : "hero-stacked-on-landscape");
          if (expected && band > 96) issues.push("hero-floats-on-portrait-tablet");
          return { columns, band: Math.round(band), issues };
        }, stacked);
        home.push({ width, height, check: "hero-orientation", ...result });
      } finally { await context.close(); }
    }
    // The architecture viewer's drawing is read at its own size: node titles at 13px and
    // every other label at 11px or more, at every width; zoom keeps its controls together.
    for (const width of [390, 768, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", serviceWorkers: "block" });
      await serveExport(context, missing);
      try {
        const page = await context.newPage();
        await page.goto(ORIGIN + "/architecture/", { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
        // The viewer opens on its first stage once its fonts have laid it out.
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const result = await page.evaluate(() => {
          const svg = document.querySelector(".diagram-container > svg");
          const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
          const issues = [];
          for (const text of svg.querySelectorAll("text")) {
            if (!text.getClientRects().length || getComputedStyle(text).display === "none" || getComputedStyle(text).visibility === "hidden") continue;
            const size = parseFloat(getComputedStyle(text).fontSize) * scale;
            const floor = text.hasAttribute("data-node-label") ? 13 : 11;
            if (size < floor - 0.05) issues.push({ kind: "viewer-label-too-small", text: text.textContent.slice(0, 40), size: +size.toFixed(1), floor });
          }
          const tops = ["out", "reset", "in"].map((view) => Math.round(document.querySelector(`.diagram-nav [data-view="${view}"]`).getBoundingClientRect().top));
          if (new Set(tops).size !== 1) issues.push({ kind: "viewer-zoom-controls-split" });
          if (document.documentElement.scrollWidth > innerWidth + 1) issues.push({ kind: "viewer-page-overflow" });
          // The stage opens on its first node, never on blank paper, and its right edge
          // fades while more of the drawing lies to the right.
          const stage = document.querySelector(".diagram-container");
          const box = stage.getBoundingClientRect();
          const first = svg.querySelector("[data-node-id]").getBoundingClientRect();
          // A stage that shows the drawing's whole height starts at its left edge; one that
          // also scrolls down (a phone's) starts with the first node near its top.
          const scrollsDown = getComputedStyle(stage).overflowY !== "hidden" && stage.scrollHeight > stage.clientHeight + 1;
          if (first.left - box.left > 120 || (scrollsDown && first.top - box.top > 120) || first.right > box.right || first.bottom > box.bottom) issues.push({ kind: "viewer-opens-off-its-first-node", left: Math.round(first.left - box.left), top: Math.round(first.top - box.top) });
          const remaining = stage.scrollWidth - stage.clientWidth - stage.scrollLeft;
          const fade = parseFloat(getComputedStyle(stage.querySelector(".site-edge-fade") ?? stage).width) || 0;
          if (remaining > 1 && fade < Math.min(40, remaining) - 0.5) issues.push({ kind: "viewer-cut-without-fade", remaining, fade });
          return { scale: +scale.toFixed(3), issues };
        });
        home.push({ width, check: "architecture-reading-size", ...result });
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
              // A staged figure keeps every short text on one line, as in the article.
              const staged = page.locator("dialog[open] [data-figure]");
              if (await staged.count()) issues.push(...(await staged.first().evaluate(inspectShortText)).map(issue => ({ ...issue, stage: label })));
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
const otherFailures = [...manuscripts, ...texts, ...diagrams, ...frames, ...home, ...longNumbers, ...noScript, ...scrolls].filter(record => record.issues.length);
const report = { figures: unique.size, widths: WIDTHS, cases: records.length, missingAssets: [...missing], failures: failures.length + otherFailures.length, records, manuscripts, texts, diagrams, frames, home, longNumbers, noScript, scrolls };
await writeFile(path.join(ARTIFACTS, "results.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ figures: unique.size, cases: records.length, failures: failures.map(({ id, view, width, textScale, issues, pageErrors }) => ({ id, view, width, textScale, issues, pageErrors })), otherFailures, missingAssets: [...missing], artifacts: ARTIFACTS }, null, 2));
assert.equal(missing.size, 0, "The static export is missing requested assets.");
assert.equal(failures.length, 0, "Browser layout regression found collapsed labels, frame escapes, or broken interactions. Inspect results.json and screenshots.");
assert.equal(otherFailures.length, 0, "Manuscript tables or equation numbers, text breaks and list markers, logic diagrams, the shared frame (rail, held units, strip, contributions, footer, Back to Top), homepage text resizing, long-number scrolling, no-JavaScript navigation, or scroll near-misses regressed.");
