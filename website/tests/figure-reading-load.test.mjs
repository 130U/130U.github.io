import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// The reading budget of an article figure (docs/design.md, Article figures): a
// caption reads as a caption, a title names what to see, a legend keys only
// what cannot be named in place, and a value column names its unit once.

const OUT = fileURLToPath(new URL("../out/", import.meta.url));
// A key result is drawn beside the sentence that states it, and its figure
// follows the key-result rule of the same section.
const KEY_RESULTS = new Set(["asian-interval", "heston-misfit", "grader-ceiling", "budget-frontier"]);
const CAPTION_WORDS = 36;
const CAPTION_SENTENCES = 2;
const TITLE_WORDS = 10;
const LEGEND_ITEMS = 4;
const LEGEND_WORDS = 6;

async function pages(directory = OUT) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory() && !["_next", "assets", "architecture"].includes(entry.name)) found.push(...await pages(file));
    if (entry.isFile() && entry.name === "index.html") {
      const html = await readFile(file, "utf8");
      if (html.includes("data-figure=")) found.push({ route: path.relative(OUT, directory) || "/", html });
    }
  }
  return found;
}

/** Markup without its SVG artwork, which carries no words. */
function withoutSvg(html) {
  let result = "";
  let depth = 0;
  let cursor = 0;
  for (const tag of html.matchAll(/<\/?svg\b[^>]*>/gu)) {
    if (tag[0].startsWith("</")) {
      depth -= 1;
      if (depth === 0) cursor = tag.index + tag[0].length;
    } else if (!tag[0].endsWith("/>")) {
      if (depth === 0) result += html.slice(cursor, tag.index);
      depth += 1;
    }
  }
  return result + html.slice(cursor);
}

const decode = (text) => text.replace(/&#x27;|&#39;/gu, "'").replace(/&quot;/gu, '"').replace(/&lt;/gu, "<").replace(/&gt;/gu, ">").replace(/&nbsp;/gu, " ").replace(/&amp;/gu, "&");

/** Visible text, each formula standing as one word that carries its TeX. */
function reading(markup) {
  const formulas = [];
  const text = withoutSvg(markup).replace(/<math\b[\s\S]*?<\/math>/gu, (math) => {
    formulas.push(decode(/<annotation\b[^>]*>([\s\S]*?)<\/annotation>/u.exec(math)?.[1] ?? ""));
    return " MATH ";
  });
  const plain = decode(text.replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ").trim();
  // A word holds a letter or a digit, so punctuation set apart from a formula is not one.
  return { plain, formulas, words: plain.split(" ").filter((token) => /[\p{L}\p{N}]/u.test(token)).length };
}

function figures(html) {
  return [...html.matchAll(/<figure\b([^>]*)\bdata-figure="([^"]+)"[^>]*>/gu)].map((open) => {
    const end = html.indexOf("</figure>", open.index);
    const markup = html.slice(open.index, end);
    const part = (pattern) => pattern.exec(markup)?.[1] ?? "";
    const legend = part(/<ul\b[^>]*class="[^"]*_legend[^"]*"[^>]*>([\s\S]*?)<\/ul>/u);
    return {
      id: open[2],
      site: open[0].includes("data-article-figure"),
      title: part(/<p\b[^>]*data-figure-title[^>]*>([\s\S]*?)<\/p>/u),
      caption: part(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/u),
      legend: [...legend.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gu)].map((item) => item[1]),
      notes: [...markup.matchAll(/<small\b[^>]*>([\s\S]*?)<\/small>/gu)].map((note) => reading(note[1]).plain),
    };
  });
}

test("site figures keep a caption of two sentences and a title that names what to see", async () => {
  const checked = [];
  for (const { route, html } of await pages()) {
    for (const figure of figures(html).filter((item) => item.site && !KEY_RESULTS.has(item.id))) {
      const caption = reading(figure.caption);
      const sentences = caption.plain.split(/(?<=[.!?])\s+(?=[A-Z])/u).length;
      assert.ok(caption.words > 0 && caption.words <= CAPTION_WORDS, `${route} ${figure.id}: the caption runs to ${caption.words} words; a caption holds ${CAPTION_WORDS}.`);
      assert.ok(sentences <= CAPTION_SENTENCES, `${route} ${figure.id}: the caption runs to ${sentences} sentences.`);
      const title = reading(figure.title);
      assert.ok(title.words > 0 && title.words <= TITLE_WORDS, `${route} ${figure.id}: the title runs to ${title.words} words.`);
      assert.ok(title.formulas.every((tex) => !tex.includes("=")), `${route} ${figure.id}: a title names symbols but holds no equation; the caption carries it.`);
      checked.push(figure.id);
    }
  }
  assert.ok(checked.length >= 26, `Expected the site's own figures; found ${checked.length}.`);
});

test("a legend keys at most four marks in short names, and a value column names its unit once", async () => {
  let legends = 0;
  for (const { route, html } of await pages()) {
    for (const figure of figures(html)) {
      if (KEY_RESULTS.has(figure.id)) continue;
      assert.ok(figure.legend.length <= LEGEND_ITEMS, `${route} ${figure.id}: the legend keys ${figure.legend.length} marks.`);
      for (const item of figure.legend) {
        const label = reading(item);
        assert.ok(label.words <= LEGEND_WORDS, `${route} ${figure.id}: the legend entry "${label.plain}" runs to ${label.words} words.`);
        assert.ok(label.formulas.every((tex) => !tex.includes("=")), `${route} ${figure.id}: a legend entry names a mark; a definition or value belongs to the text.`);
      }
      legends += figure.legend.length ? 1 : 0;
      const counts = new Map();
      for (const note of figure.notes) counts.set(note, (counts.get(note) ?? 0) + 1);
      for (const [note, count] of counts) assert.ok(count < 3, `${route} ${figure.id}: the note "${note}" repeats on ${count} rows.`);
    }
  }
  assert.ok(legends >= 15, `Expected the figures' legends; found ${legends}.`);
});

test("a figure's caption is set a step below the prose, and a panel title below the figure's title", async () => {
  const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
  const tokens = await read("app/globals.css");
  const size = (token) => Number(new RegExp(`${token}:\\s*([\\d.]+)rem`, "u").exec(tokens)?.[1]);
  assert.ok(size("--type-caption") < size("--type-reading") && size("--type-caption") > size("--type-label"), "The caption sits between the reading and the label sizes.");
  const rule = (css, selector) => new RegExp(`(?:^|\\n)${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u").exec(css.replace(/\/\*[\s\S]*?\*\//gu, ""))?.[1] ?? "";
  for (const [file, selector] of [["app/components/figures/Figure.module.css", ".caption"], ["app/components/experience/LogicDiagram.module.css", ".caption"], ["app/blog/blog.module.css", ".figure figcaption"]]) {
    const declarations = rule(await read(file), selector);
    assert.match(declarations, /font-size:\s*var\(--type-caption\)/u, `${file} ${selector} sets the caption size.`);
    assert.match(declarations, /line-height:\s*var\(--caption-leading\)/u, `${file} ${selector} sets the caption leading.`);
  }
  const figures = await read("app/components/figures/Figures.module.css");
  assert.match(rule(figures, "figure:has([data-figure-title]) .panelTitle"), /font-size:\s*var\(--type-label\)/u, "Under a figure's title, a panel title takes the label size.");
});
