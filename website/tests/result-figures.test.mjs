import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

// Figures that draw a paper's or an article's key result on its own scale:
// every drawn value must be one the text states, each figure must follow the
// sentence that states it, and a reader reads each number where it lies: an
// interval's endpoints stand over its caps, every mark is named beside it, and
// the caption stays a caption.

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const json = async (relative) => JSON.parse(await read(relative));
const decode = (text) => text.replace(/&#x27;|&#39;/gu, "'").replace(/&quot;/gu, '"').replace(/&amp;/gu, "&").replace(/&lt;/gu, "<").replace(/&gt;/gu, ">").replace(/&#10;|&#xa;/giu, "\n");

/** The site figure with this id in a built page, with its tips, labels, written endpoints and caption. */
function figure(html, id) {
  const start = html.indexOf(`data-article-figure="${id}"`);
  assert.ok(start > 0, `${id} is on the page.`);
  const open = html.lastIndexOf("<figure", start);
  const close = html.indexOf("</figure>", start);
  const markup = html.slice(open, close);
  const left = (attributes) => Number(/left:\s*([\d.]+)%/u.exec(attributes)?.[1]);
  return {
    open,
    markup,
    tips: [...markup.matchAll(/\bdata-tip="([^"]*)"/gu)].map((match) => decode(match[1])),
    labels: [...markup.matchAll(/\baria-label="([^"]*)"/gu)].map((match) => decode(match[1])).join("\n"),
    // Ranges in drawing order, with the horizontal span they take.
    ranges: [...markup.matchAll(/<span class="[^"]*_range [^"]*"[^>]*style="left:([\d.]+)%;width:([\d.]+)%"/gu)].map((match) => ({ from: Number(match[1]), to: Number(match[1]) + Number(match[2]) })),
    // Numbers written over a cap: their side, their text and where they stand.
    ends: [...markup.matchAll(/<span class="[^"]*_end"([^>]*)>([^<]*)</gu)].map((match) => ({ side: /data-side="(\w+)"/u.exec(match[1])?.[1], text: decode(match[2]), at: left(match[1]) })),
    // The caption's words, with each formula counted as one word.
    caption: decode(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/u.exec(html.slice(open, close + 20))?.[1].replace(/<math[\s\S]*?<\/math>/gu, "").replace(/<svg[\s\S]*?<\/svg>/gu, "x").replace(/<[^>]+>/gu, "") ?? ""),
  };
}

/** The block that ends right before a placed figure: the last research block opened before it. */
function precedingBlock(html, offset) {
  const blocks = [...html.slice(0, offset).matchAll(/data-research-block="(\d+)"/gu)];
  return Number(blocks.at(-1)[1]);
}

/** The rows of the manuscript table whose caption opens with `title`, as arrays of cell text. */
function tableRows(blocks, title) {
  const caption = blocks.findIndex((block) => block.type === "paragraph" && block.source.startsWith(`**${title}`));
  assert.ok(caption >= 0 && blocks[caption + 1].type === "table", `${title} is a captioned table.`);
  return blocks[caption + 1].rows.slice(1).map((row) => row.map((cell) => cell.source.replace(/\*\*/gu, "")));
}

const near = (a, b) => Math.abs(a - b) < 0.01;

test("the Asian number line follows the sentence of (1.3) and writes each interval at its caps", async () => {
  const slug = "certified-valuation-of-arithmetic-asian-options";
  const { markdown } = await json(`content/selected-research/${slug}.json`);
  const blocks = parseResearchMarkdown(markdown, { joinSoftLines: true });
  const html = await read(`out/${slug}/index.html`);
  const drawing = figure(html, "asian-interval");

  // (1.3) ends in a comma, so the figure follows the paragraph that finishes its sentence.
  const after = precedingBlock(html, drawing.open);
  assert.ok(blocks[after].source.startsWith("the price under absorbed Euler with step $`h=1/768`$ lies in"));
  assert.equal(blocks[after - 1].type, "equation");
  assert.match(blocks[after - 1].tex, /\[6\.508371733,\\;6\.518868974\]/u);
  assert.match(blocks[after - 1].tex, /\\tag\{1\.3\}/u);

  // The row of (1.3) carries the display's number, and each interval's endpoints
  // stand over its own caps: the lower one starts at its cap, the upper one ends at its own.
  assert.match(drawing.markup, /_number"[^>]*>\(1\.3\)</u);
  const intervals = [["6.508371733", "6.518868974"], ["6.507844281", "6.519014106"]];
  assert.deepEqual(drawing.ends.map((end) => end.text), intervals.flat());
  intervals.forEach(([low, high], index) => {
    const interval = `[${low}, ${high}]`;
    assert.ok(drawing.labels.includes(interval) && drawing.tips.some((tip) => tip.includes(interval)), `The figure draws ${interval}.`);
    assert.ok(markdown.includes(`[${low},\\;${high}]`), `The text states ${interval}.`);
    const [from, to] = drawing.ends.slice(2 * index, 2 * index + 2);
    assert.deepEqual([from.side, to.side], ["low", "high"]);
    assert.ok(near(from.at, drawing.ranges[index].from) && near(to.at, drawing.ranges[index].to), `${interval} is written over its caps.`);
  });
  assert.ok(drawing.tips.some((tip) => tip.startsWith("Proxy value 6.513251661289\nknown to ±.00021")));
  assert.ok(drawing.tips.some((tip) => tip.startsWith("Simulated price, close to 6.51335\n.000102 above the proxy value, standard error .000004")));
  for (const phrase of ["known to $`\\pm.00021`$", "close to $`6.51335`$", "A library that prints 6.52", "by $`.000102`$ with standard error $`.000004`$", "$`.005407`$ above and $`.004670`$ below"]) {
    assert.ok(markdown.includes(phrase), `The text states ${phrase}.`);
  }
});

test("the Table 1 comparison stands in its own figure after the paragraph that draws it", async () => {
  const slug = "certified-valuation-of-arithmetic-asian-options";
  const { markdown } = await json(`content/selected-research/${slug}.json`);
  const blocks = parseResearchMarkdown(markdown, { joinSoftLines: true });
  const html = await read(`out/${slug}/index.html`);
  const drawing = figure(html, "asian-first-order");
  const paragraph = blocks[precedingBlock(html, drawing.open)].source;
  assert.ok(paragraph.startsWith("The bound is nearly attained."));
  assert.ok(paragraph.includes("1.54, 1.19, 1.10 and 1.07") && paragraph.includes("2.6 cents at every lead time, between 320 and 1,140 times larger"));

  // Each call's markers carry Table 1's proved bound, quote steps and first-order bound,
  // and the number written beside each proved bound is its Quote steps cell.
  const table = new Map(tableRows(blocks, "Table 1.").map((row) => [row[0], row]));
  const contracts = drawing.tips.filter((tip) => /\n(Proved|First-order) bound /u.test(tip));
  assert.equal(contracts.length, 8, "Four monthly calls, each with a proved and a first-order marker.");
  const ratios = ["1.54", "1.19", "1.10", "1.07"];
  for (const tip of contracts) {
    const [name, line, ratio] = tip.split("\n");
    const row = table.get(name);
    assert.ok(row && /^Crude oil call, \d+ months? ahead$/u.test(name), `${name} is a monthly call of Table 1.`);
    const proved = /^Proved bound ([\d.]+), ([\d.]+) quote steps$/u.exec(line);
    if (!proved) {
      assert.equal(line, `First-order bound ${row[5]}`, `${name}: first-order bound.`);
      continue;
    }
    assert.deepEqual([proved[1], proved[2]], [row[2], row[3]], `${name}: bound and quote steps.`);
    assert.equal(ratio, `${ratios.shift()} times the simulated cost ${row[4]}`, `${name}: the stated ratio to the simulated cost.`);
    assert.ok(drawing.markup.includes(`>${row[3]}</span>`), `${name}: its quote steps are written beside its bound.`);
  }
  // The gap the figure names follows from the table: 320 to 1,140 times.
  const factors = [...table.values()].filter((row) => /^Crude oil call, \d+ months? ahead$/u.test(row[0])).map((row) => Number(row[5]) / Number(row[2]));
  assert.equal(Math.floor(Math.min(...factors) / 10) * 10, 320);
  assert.equal(Math.round(Math.max(...factors) / 10) * 10, 1140);
  assert.ok(drawing.markup.includes("320 to 1,140 times larger"));
});

test("the Rough Heston misfit figure restates Section 7.6 and the quoted bands of Table 1", async () => {
  const slug = "certified-joint-pricing-errors-in-rough-heston";
  const { markdown } = await json(`content/selected-research/${slug}.json`);
  const blocks = parseResearchMarkdown(markdown, { joinSoftLines: true });
  const html = await read(`out/${slug}/index.html`);
  const drawing = figure(html, "heston-misfit");
  assert.ok(blocks[precedingBlock(html, drawing.open)].source.startsWith("A certificate also settles the opposite question."));

  const quotes = new Map(tableRows(blocks, "Table 1.").flatMap((row) => [row.slice(0, 4), row.slice(4, 8)]).map((row) => [row[0], row]));
  const excesses = drawing.ends.filter((end) => end.text.startsWith("≥"));
  const caps = [...drawing.markup.matchAll(/_openRange [^"]*"[^>]*style="left:([\d.]+)%/gu)].map((match) => Number(match[1]));
  for (const [index, [strike, excess]] of [["4400", "0.490"], ["4500", "0.067"]].entries()) {
    const [, bid, ask, width] = quotes.get(strike);
    assert.ok(drawing.tips.includes(`${strike} call, quoted band\nBid ${bid}, ask ${ask}, width ${width}`), `${strike}: the band of Table 1.`);
    assert.ok(drawing.tips.some((tip) => tip.startsWith(`${strike} call, certified model price\nAt least ${excess} above the ask`)), `${strike}: the excess of Section 7.6.`);
    assert.ok(markdown.includes(`at least ${excess} points`), `The text states the excess at ${strike}.`);
    assert.equal(excesses[index].text, `≥ ${excess}`);
    assert.ok(near(excesses[index].at, caps[index]), `${strike}: the excess is written over its cap.`);
  }
  assert.ok(drawing.tips.some((tip) => tip.endsWith("\nLower end 92.886, ask 92.396")));
  assert.ok(markdown.includes("lower end is 92.886 points, while the quoted ask is 92.396"));
});

test("the grader figure evaluates (5.5) for Model B and meets every value of Table 2", async () => {
  const slug = "general-reasoning-evaluation-and-layered-verification";
  const { markdown } = await json(`content/artificial-intelligence/${slug}.json`);
  const blocks = parseResearchMarkdown(markdown);
  const html = await read(`out/experience/${slug}/index.html`);
  const drawing = figure(html, "grader-ceiling");
  assert.ok(blocks[precedingBlock(html, drawing.open)].source.startsWith("• *False rejection removes routes.*"));

  // Model B of Section 1: theta 64%, alpha 36%, beta 0.
  assert.ok(markdown.includes("$`\\theta_A = 72\\%`$ and $`\\theta_B = 64\\%`$") && markdown.includes("$`\\alpha_A = 4\\%`$ and $`\\alpha_B = 36\\%`$, with $`\\beta_A = \\beta_B = 0\\%`$"));
  const [theta, alpha] = [0.64, 0.36];
  const total = (eta) => (theta + (1 - theta) * alpha) * Math.exp(eta) + (1 - theta) * (1 - alpha);
  const observed = (eta) => (100 * (theta + (1 - theta) * alpha) * Math.exp(eta)) / total(eta);
  const valid = (eta) => (100 * theta * Math.exp(eta)) / total(eta);
  const [header, scores, validity] = parseResearchMarkdown(markdown).find((block) => block.type === "table" && block.rows[0][0].source.startsWith("Optimization strength")).rows.map((row) => row.map((cell) => cell.source));
  for (const [column, label] of header.slice(1, 5).entries()) {
    const eta = Number(label);
    assert.equal(`${observed(eta).toFixed(1)}%`, scores[column + 1], `Observed score at eta = ${eta}.`);
    assert.equal(`${valid(eta).toFixed(1)}%`, validity[column + 1], `True validity at eta = ${eta}.`);
    assert.ok(drawing.tips.includes(`η = ${eta}\nObserved score ${scores[column + 1]}`) && drawing.tips.includes(`η = ${eta}\nTrue validity ${validity[column + 1]}`));
  }
  assert.equal(`${((100 * theta) / (theta + (1 - theta) * alpha)).toFixed(1)}%`, validity[5], "The limit is the positive predictive value.");
  // Each line is named at its end.
  for (const name of ["Observed score", "True validity", `Limit ${validity[5]}`]) assert.ok(drawing.markup.includes(`>${name}<`), `${name} is named on the drawing.`);

  // The rejected route keeps 1 / (1 + e^eta) of valid work.
  for (const [eta, share] of [[1, "26.9%"], [2, "11.9%"], [4, "1.8%"]]) {
    assert.equal(`${(100 / (1 + Math.exp(eta))).toFixed(1)}%`, share);
    assert.ok(drawing.tips.includes(`η = ${eta}\nRejected route ${share} of valid work`));
  }
});

test("the budget frontier draws the five plans of Table 5", async () => {
  const slug = "large-scale-domain-expert-feedback-governance-and-adaptive-review";
  const { markdown } = await json(`content/artificial-intelligence/${slug}.json`);
  const blocks = parseResearchMarkdown(markdown);
  const html = await read(`out/experience/${slug}/index.html`);
  const drawing = figure(html, "budget-frontier");
  assert.ok(blocks[precedingBlock(html, drawing.open)].source.startsWith("The last three rows are the exchange rate."));

  const plans = blocks.find((block) => block.type === "table" && block.rows[0][0].source === "Plan").rows.slice(1).map((row) => row.map((cell) => cell.source.replace(/\*\*/gu, "")));
  assert.equal(plans.length, 5);
  for (const [name, , , deviation, shipped] of plans) {
    assert.ok(drawing.tips.includes(`${name}\nStandard deviation ${deviation} pp\n${shipped} defects shipped`), `${name} is drawn at its row of Table 5, in the axis's unit.`);
    assert.ok(drawing.markup.includes(`${shipped}<`), `${name}: its defects shipped are written at its point.`);
  }
  const shipped = Object.fromEntries(plans.map((row) => [row[0], Number(row[4])]));
  assert.equal((100 * (1 - shipped["Joint rule at the precision of risk-first routing"] / shipped["Risk-first for audits and for reviews"])).toFixed(1), "38.6");
});

test("a key-result figure names its marks where they lie and keeps a short caption", async () => {
  const pages = [
    ["out/certified-valuation-of-arithmetic-asian-options/index.html", ["asian-interval", "asian-first-order"]],
    ["out/certified-joint-pricing-errors-in-rough-heston/index.html", ["heston-misfit"]],
    ["out/experience/general-reasoning-evaluation-and-layered-verification/index.html", ["grader-ceiling"]],
    ["out/experience/large-scale-domain-expert-feedback-governance-and-adaptive-review/index.html", ["budget-frontier"]],
  ];
  for (const [page, ids] of pages) {
    const html = await read(page);
    for (const id of ids) {
      const drawing = figure(html, id);
      assert.doesNotMatch(drawing.markup, /<ul\b/u, `${id} carries no legend.`);
      const sentences = drawing.caption.split(/(?<=[.:;])\s+(?=[A-Z])/u).filter(Boolean);
      assert.ok(sentences.length <= 2, `${id}: a caption of at most two sentences, found ${sentences.length}.`);
      assert.ok(drawing.caption.split(/\s+/u).length <= 60, `${id}: a caption of at most 60 words.`);
    }
  }
});

// Figure copy in one form on every article: a view is named in title case in one
// to three words, a legend label names its mark without a colon, a label
// formula stands on one level, and a readout or tip writes a symbol in the
// labels' notation and a quantity in its axis's unit.
const ARTICLE_PAGES = [
  "critical-dependence-stress-for-diversification-gains-under-fixed-marginals",
  "certified-valuation-of-arithmetic-asian-options",
  "certified-joint-pricing-errors-in-rough-heston",
  ...["large-scale-domain-expert-feedback-governance-and-adaptive-review", "financial-task-design-and-synthetic-data-engineering",
    "general-reasoning-evaluation-and-layered-verification", "evidence-verification-and-robust-comparison-in-investment-research",
    "autonomous-authority-in-space", "small-states-and-the-governance-of-strategic-space-dependence", "who-may-choose-the-lesser-risk",
    "mangrove-restoration-and-the-limits-of-compensatory-mitigation"].map((slug) => `experience/${slug}`),
];
const SMALL_WORDS = new Set(["a", "an", "and", "at", "by", "for", "in", "of", "on", "or", "the", "to"]);
const words = (markup) => decode(markup.replace(/<math[\s\S]*?<\/math>/gu, " $ ").replace(/<svg[\s\S]*?<\/svg>/gu, " $ ").replace(/<[^>]+>/gu, "")).split(/\s+/u).filter((word) => /[\p{L}\p{N}$]/u.test(word));

test("figure switches, legends, label formulas and readouts follow one form", async () => {
  let switches = 0;
  for (const page of ARTICLE_PAGES) {
    const html = await read(`out/${page}/index.html`);
    for (const [, label] of html.matchAll(/<button type="button" data-fig-view="[^"]+"[^>]*>([\s\S]*?)<\/button>/gu)) {
      switches += 1;
      const named = words(label);
      assert.ok(named.length >= 1 && named.length <= 3, `${page}: the view "${named.join(" ")}" is named in one to three words`);
      for (const [index, word] of named.entries()) {
        if (word === "$" || /^\p{N}/u.test(word) || (index > 0 && SMALL_WORDS.has(word))) continue;
        assert.match(word, /^\p{Lu}/u, `${page}: the view "${named.join(" ")}" is in title case`);
      }
    }
    for (const [, item] of html.matchAll(/<ul class="[^"]*_legend\b[^"]*"[^>]*>([\s\S]*?)<\/ul>/gu)) {
      for (const [, label] of item.matchAll(/<li>([\s\S]*?)<\/li>/gu)) assert.doesNotMatch(words(label).join(" "), /:/u, `${page}: a legend label names its mark without a colon`);
    }
  }
  assert.ok(switches >= 15, "Every article's view switches are read");
  for (const file of ["ai-research", "selected-research", "asian-manuscript", "rough-manuscript", "dependence-manuscript", "legal-research"]) {
    assert.doesNotMatch(await read(`app/components/figures/${file}.tsx`), /\\[dt]?frac\b/u, `${file}: a label formula stands on one level`);
  }
  const html = await read("out/experience/large-scale-domain-expert-feedback-governance-and-adaptive-review/index.html");
  const moment = JSON.parse(decode(/data-figure="residual-moment"[\s\S]*?data-crosshair="([^"]+)"/u.exec(html)[1]));
  assert.ok(moment.heading.every((heading) => /^qᵢ = fᵢ = \d\.\d\d$/u.test(heading)), "The readout writes qᵢ and fᵢ as the axis does");
  assert.deepEqual(moment.series.map(({ name }) => name), ["mᵢ"]);
  for (const id of ["audit-policies", "budget-frontier"]) {
    const drawing = figure(html, id);
    assert.ok(drawing.tips.some((tip) => / pp\n/u.test(tip)), `${id}: a standard deviation is in pp, the axis's unit`);
    assert.ok(drawing.tips.every((tip) => !/\d points/u.test(tip)), `${id}: no tip names another unit`);
  }
});
