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
    if (!element.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true }) || element.closest('[hidden], mjx-assistive-mml, script, style')) return false;
    // Accessibility MathML remains in the layout tree even when CSS clips its
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
    if (!node.textContent.trim() || !shown(element) || element.closest('svg, mjx-assistive-mml')) continue;
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
    // The SVG canvas includes transparent safety gutters. Test its glyph group
    // instead, so a gutter does not masquerade as clipped mathematical content.
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
// lines; every equation on a page starts on one axis, whatever its length; and
// every equation number stands at its column's right edge, clear of the
// expression once the equation is in full view.
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
  const starts = new Map();
  for (const equation of document.querySelectorAll('[data-research-block-type="equation"]')) {
    const drawing = equation.querySelector("svg[data-research-svg]");
    const column = equation.getBoundingClientRect();
    const start = Math.round((drawing.getBoundingClientRect().left - column.left) * 2) / 2;
    starts.set(start, (starts.get(start) ?? 0) + 1);
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
  if (starts.size > 1) issues.push({ kind: "equations-start-on-different-axes", starts: [...starts] });
  return issues;
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
          manuscripts.push({ route, width, issues: await page.evaluate(inspectManuscript) });
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
    for (const route of ["/certified-valuation-of-arithmetic-asian-options/", "/experience/mangrove-restoration-and-compensatory-mitigation/"]) {
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
  }
} finally {
  await browser.close();
}
const failures = records.filter(record => record.issues.length || record.pageErrors.length);
const otherFailures = [...manuscripts, ...home, ...longNumbers, ...noScript].filter(record => record.issues.length);
const report = { figures: unique.size, widths: WIDTHS, cases: records.length, missingAssets: [...missing], failures: failures.length + otherFailures.length, records, manuscripts, home, longNumbers, noScript };
await writeFile(path.join(ARTIFACTS, "results.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({ figures: unique.size, cases: records.length, failures: failures.map(({ id, view, width, textScale, issues, pageErrors }) => ({ id, view, width, textScale, issues, pageErrors })), otherFailures, missingAssets: [...missing], artifacts: ARTIFACTS }, null, 2));
assert.equal(missing.size, 0, "The static export is missing requested assets.");
assert.equal(failures.length, 0, "Browser layout regression found collapsed labels, frame escapes, or broken interactions. Inspect results.json and screenshots.");
assert.equal(otherFailures.length, 0, "Manuscript tables or equation numbers, homepage text resizing, long-number scrolling, or no-JavaScript navigation regressed.");
