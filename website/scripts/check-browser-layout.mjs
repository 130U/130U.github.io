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
  // The reading budget: a caption is set a step below the prose (the reading
  // size is 1rem), and from a 390px phone up each legend entry holds one line.
  // A key result follows its own rule (docs/design.md, Article figures).
  const caption = figure.querySelector(":scope > figcaption");
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  if (caption && parseFloat(getComputedStyle(caption).fontSize) > 0.9 * rem) issues.push({ kind: "caption-at-reading-size", fontSize: getComputedStyle(caption).fontSize });
  const keyResult = ["asian-interval", "heston-misfit", "grader-ceiling", "budget-frontier"].includes(figure.dataset.figure);
  if (!keyResult && innerWidth >= 390 && rem <= 16) {
    for (const entry of [...frame.querySelectorAll('[class*="_legend"] > li')].filter(shown)) {
      const label = entry.lastElementChild ?? entry;
      const lines = new Set([...label.getClientRects()].filter(box => box.width > 0).map(box => Math.round(box.top)));
      if (rect(entry).height > 1.6 * parseFloat(getComputedStyle(entry).lineHeight) || lines.size > 1) issues.push({ kind: "legend-entry-wraps", text: entry.textContent.trim() });
    }
  }
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
  // A legend keys what the figure draws: each swatch has a visible mark of its
  // form in its colour, and a figure that names none of its marks beside them
  // keys every kind of dot it draws.
  const legendItems = [...frame.querySelectorAll('[class*="_legend"] > li')].filter(shown);
  if (legendItems.length) {
    const svgShapes = [...frame.querySelectorAll("svg :is(path, line, polyline, polygon, rect, circle)")].filter(shape => !shape.closest("svg[data-research-svg], button, [class*='_legend']") && shown(shape));
    const html = [...frame.querySelectorAll("span, div, button")].filter(element => !element.closest("[class*='_legend'], [data-research-formula]") && shown(element));
    const classed = (element, pattern) => [...element.classList].some(name => pattern.test(name));
    const keyed = [];
    for (const item of legendItems) {
      const swatch = item.querySelector('[class*="_swatch"]');
      if (!swatch) continue;
      const shape = swatch.dataset.shape ?? "square";
      const color = getComputedStyle(swatch).color;
      const stroked = shapes => svgShapes.some(element => element.matches(shapes) && getComputedStyle(element).stroke === color);
      const dots = selector => html.some(element => classed(element, /_(dot|scenarioDot)$/u) && element.matches(selector) && getComputedStyle(element).color === color);
      const found = {
        line: () => stroked(":not([data-dash], [data-dotted], [data-thick], [data-axis], [data-scatter])"),
        thick: () => stroked("[data-thick]"),
        dash: () => stroked("[data-dash]") || html.some(element => classed(element, /_(hline|vline|rule)$/u)),
        dotted: () => stroked("[data-dotted]"),
        dot: () => dots(":not([data-ring], [data-shape], [data-sign='negative'])") || stroked("[data-scatter]") || svgShapes.some(element => element.matches("circle") && getComputedStyle(element).fill === color),
        ring: () => dots("[data-ring], [data-sign='negative']"),
        triangle: () => dots("[data-shape='triangle']"),
        square: () => html.some(element => !classed(element, /_(dot|scenarioDot)$/u) && getComputedStyle(element).backgroundColor === color) || dots("[data-shape='square']") || svgShapes.some(element => getComputedStyle(element).fill === color),
        hatch: () => html.some(element => element.matches("[data-hatch], [data-state='unverified']")) || svgShapes.some(element => /url\(/u.test(getComputedStyle(element).fill)),
        box: () => html.some(element => element.matches("[data-state='verified'], [data-ring]") && !classed(element, /_dot$/u)),
        tint: () => svgShapes.some(element => element.matches("[data-fill]") && classed(element, /_(rangeFill|discrepancyShade)$/u)) || html.some(element => classed(element, /_(budgetBand|criticalBand|lensWindow|layerBand)$/u)),
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
  return { bounds, issues, ranking, wrappedLabels: marks.length };
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
  // over a rule, a numbered table stands its number on the baseline of the row
  // nearest the math axis, and when it scrolls, row labels that take no more
  // than half its room stay in view.
  for (const table of document.querySelectorAll("[data-display-table]")) {
    const region = table.closest('[data-research-block-type="equation"]');
    const size = parseFloat(getComputedStyle(table).fontSize);
    const rows = [...table.children];
    // Each cell opens with a strut 0.25em deep, so the row's baseline lies 0.25em above its foot.
    const baselines = rows.map(row => [...row.children].map(cell => cell.firstElementChild.getBoundingClientRect().bottom - 0.25 * size));
    baselines.forEach((line, index) => {
      if (Math.max(...line) - Math.min(...line) > 0.5) issues.push({ kind: "display-table-row-off-baseline", row: index, baselines: line });
      if (index && line[0] - baselines[index - 1][0] < 1.8217 * size - 0.5) issues.push({ kind: "display-table-rows-closer-than-a-line", row: index, pitch: line[0] - baselines[index - 1][0] });
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
      // TeX centres a table on the math axis, 0.25em above the baseline it is centred for.
      const box = table.getBoundingClientRect();
      const centred = (box.top + box.bottom) / 2 + 0.25 * size;
      const row = baselines.map(line => line[0]).reduce((best, line) => (Math.abs(line - centred) < Math.abs(best - centred) ? line : best));
      if (Math.abs(row - baseline) > 1) issues.push({ kind: "display-table-number-off-its-row", number: number.textContent, offset: row - baseline });
    }
    const label = rows[0]?.firstElementChild;
    const scrolls = region.scrollWidth > region.clientWidth + 1;
    if (scrolls && label.getBoundingClientRect().width <= 0.5 * region.clientWidth && !region.hasAttribute("data-pinned")) issues.push({ kind: "display-table-labels-not-pinned" });
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
// or overlap, a bar that runs on in the same direction keeps its centre line, a line
// into a bus from one side and out of it on the other is straight, and every line
// ends in one arrowhead centred on it, whose tip meets a node. The loop is one line
// in the accent from the source node's lower edge to the target's. A line never
// crosses a node or a label. Each connector line has one opaque color. Inline
// mathematics sits on its text's baseline within 0.5px, at no less than nine tenths
// of the text's size, inside its node; text on an ink node stands at least 4.5:1 on
// the ink; the nodes of a stage that share a row share one height and start their
// titles on one line; and a hyphenated compound that fits its node holds one line.
const DIAGRAM_WIDTHS = [320, 390, 768, 1024, 1200, 1240, 1280, 1440, 1920];

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
      bars.push({ b, axis, wire: svg.dataset.wire, fill: getComputedStyle(rect).fill, centre: axis === "h" ? (b.top + b.bottom) / 2 : (b.left + b.right) / 2 });
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
    // A bar that runs on in the same direction keeps the centre line of the bar before it.
    members.forEach((a, i) => members.slice(i + 1).forEach(b => {
      if (a.axis !== b.axis || a.axis === "dot" || !touch(a.b, b.b)) return;
      if (Math.abs(a.centre - b.centre) > 0.5) issues.push({ kind: "diagram-line-steps", offset: round(a.centre - b.centre), ...where });
    }));
    for (const arrow of ends) {
      const shaft = members.find(bar => touch(bar.b, arrow.b) && bar.axis === (arrow.direction === "right" ? "h" : "v"));
      const axisCentre = arrow.direction === "right" ? (arrow.b.top + arrow.b.bottom) / 2 : (arrow.b.left + arrow.b.right) / 2;
      if (!shaft || Math.abs(shaft.centre - axisCentre) > 0.5) issues.push({ kind: "diagram-arrowhead-off-its-line", offset: shaft && round(shaft.centre - axisCentre), ...where });
      if (arrow.direction === "down") continue;
      // The tip meets a node's edge: its left edge for a forward arrow, its lower edge for the loop.
      const tip = arrow.direction === "right" ? { x: arrow.b.right, y: axisCentre } : { x: axisCentre, y: arrow.b.top };
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
      const left = nodeBoxes.find(node => Math.abs(node.right - bar.b.left) <= 0.5 && bar.centre > node.top && bar.centre < node.bottom);
      if (left && Math.abs((left.top + left.bottom) / 2 - bar.centre) > 0.5) issues.push({ kind: "diagram-line-off-node-middle", offset: round(bar.centre - (left.top + left.bottom) / 2), ...where });
    }
  }
  // A line into a bus and a line out of it on the other side are one straight line.
  for (const bus of bars.filter(bar => bar.axis === "v" && bar.b.height > 12)) {
    const sides = bars.filter(bar => bar.axis === "h" && bar.wire === bus.wire && touch(bar.b, bus.b));
    const left = sides.filter(bar => bar.b.left < bus.b.left - 1);
    const right = sides.filter(bar => bar.b.right > bus.b.right + 1);
    for (const a of left) for (const b of right) {
      const offset = Math.abs(a.centre - b.centre);
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
                  for (const issue of await figure.evaluate(inspectLabels)) {
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
