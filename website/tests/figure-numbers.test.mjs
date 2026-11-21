import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Numbers in article figures (docs/design.md, Article figures): a number of five
// or more digits after its point stands in the digit groups a research table
// sets, by spacing alone, in a label and in a readout; and a figure that follows
// a table writes none of that table's values, in its labels or its caption,
// leaving them to the table and to its marks' readouts.

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const decode = (text) => text.replace(/&#x27;|&#39;/gu, "'").replace(/&quot;/gu, '"').replace(/&lt;/gu, "<").replace(/&gt;/gu, ">").replace(/&nbsp;/gu, " ").replace(/&#x2212;/giu, "−").replace(/&amp;/gu, "&");

const PAGES = [
  "certified-valuation-of-arithmetic-asian-options",
  "certified-joint-pricing-errors-in-rough-heston",
  "critical-dependence-stress-for-diversification-gains-under-fixed-marginals",
  ...["large-scale-domain-expert-feedback-governance-and-adaptive-review", "financial-task-design-and-synthetic-data-engineering",
    "general-reasoning-evaluation-and-layered-verification", "evidence-verification-and-robust-comparison-in-investment-research"].map((slug) => `experience/${slug}`),
];
const GROUP = /<span\b[^>]*\bdata-digit-group=""[^>]*>([^<]*)<\/span>/gu;

/** Each figure of a page: its markup without the attributes that carry its readouts and assistive text. */
function figures(html) {
  return [...html.matchAll(/<figure\b[^>]*\bdata-figure="([^"]+)"[^>]*>/gu)].map((open) => {
    const end = html.indexOf("</figure>", open.index);
    const markup = html.slice(open.index, end);
    return {
      id: open[1],
      open: open.index,
      markup,
      shown: markup.replace(/\s(?:aria-label|data-tip|data-crosshair|data-dag-readout|data-dag-descendants)="[^"]*"/gu, ""),
      tips: [...markup.matchAll(/\b(?:data-tip|aria-label)="([^"]*)"/gu)].map((match) => decode(match[1])).join("\n"),
    };
  });
}

/** Visible text: digit groups joined to their numbers, each formula as its TeX, drawings and pads dropped. */
function visibleText(markup) {
  return decode(markup
    .replace(GROUP, "$1")
    .replace(/<math\b[\s\S]*?<annotation[^>]*>([\s\S]*?)<\/annotation>[\s\S]*?<\/math>/gu, " $1 ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gu, " ")
    .replace(/<[^>]+>/gu, " ")).replace(/\s+/gu, " ");
}

/** The numbers a text writes with a decimal point and at least three significant digits, as written. */
function numbers(text) {
  return [...text.replace(/\(\d+\.\d+\)/gu, " ").matchAll(/(?<![\d.])\d[\d,]*\.\d+|(?<![\d.])\.\d+/gu)]
    .map((match) => match[0].replace(/,/gu, ""))
    .filter((value) => value.replace(".", "").replace(/^0+/u, "").length >= 3);
}

/** Whether a figure's number restates a table's: written the same, or, with three or more decimals, rounded from it. */
function restates(value, tableValues, rounding) {
  const decimals = value.split(".")[1].length;
  return tableValues.some((entry) => Number(entry) === Number(value)
    || (rounding && decimals >= 3 && entry.split(".")[1].length > decimals && Number(entry).toFixed(decimals) === Number(value).toFixed(decimals)));
}

/**
 * The tables a figure follows: those standing right before it, with at most one
 * paragraph between the last of them and the figure.
 */
function tablesBefore(html, open) {
  const blocks = [...html.slice(0, open).matchAll(/<(\w+)\b([^>]*)\bdata-research-block-type="(\w+)"[^>]*>/gu)].map((match) => ({
    index: match.index,
    type: match[3],
    title: /data-table-title/u.test(match[0]),
  }));
  const found = [];
  let paragraphs = 0;
  for (const block of blocks.reverse()) {
    if (block.type === "table") {
      found.push(html.slice(block.index, html.indexOf("</table>", block.index)));
      continue;
    }
    if (block.type === "paragraph" && block.title) continue;
    if (block.type === "paragraph" && !paragraphs && !found.length) {
      paragraphs += 1;
      continue;
    }
    break;
  }
  return found;
}

test("a figure's long numbers stand in digit groups, in its labels and its readouts", async () => {
  let grouped = 0;
  for (const page of PAGES) {
    const html = await read(`out/${page}/index.html`);
    for (const figure of figures(html)) {
      // No run of text a figure shows holds five digits after a point: each later group is a span of its own.
      const runs = figure.shown.replace(/<svg\b[\s\S]*?<\/svg>/gu, "").replace(/<math\b[\s\S]*?<\/math>/gu, "").split(/<[^>]+>/u);
      for (const run of runs) assert.doesNotMatch(decode(run), /\.\d{5,}/u, `${page} ${figure.id}: "${decode(run).trim()}" stands ungrouped.`);
      for (const match of figure.shown.matchAll(/(\d*\.\d{3})((?:<!-- -->)?(?:<span\b[^>]*\bdata-digit-group=""[^>]*>\d+<\/span>)+)/gu)) {
        const groups = [...match[2].matchAll(GROUP)].map((group) => group[1]);
        assert.ok(groups.slice(0, -1).every((group) => group.length === 3) && /^\d{2,4}$/u.test(groups.at(-1)), `${page} ${figure.id}: groups of three, a lone digit joining the last (${groups.join(" ")}).`);
        // Nothing is inserted: the number joined is one the figure's readouts and assistive text write.
        const digits = `${match[1]}${groups.join("")}`;
        assert.ok(figure.tips.includes(digits), `${page} ${figure.id}: ${digits} is the manuscript's number.`);
        grouped += 1;
      }
    }
  }
  assert.ok(grouped >= 8, `Expected the grouped numbers of the figures; found ${grouped}.`);

  // Readouts take the same groups: the controller writes every readout through the one splitter,
  // which groups with the tables' helper.
  const controller = await read("app/components/figures/FigureController.tsx");
  assert.doesNotMatch(controller, /(?:tooltip|readout)\.textContent\s*=/u, "No readout is written as plain text.");
  assert.ok((controller.match(/writeReadout\(/gu) ?? []).length >= 4, "Tips, crosshair readouts and the graph's status use writeReadout.");
  assert.match(await read("app/components/figures/digit-runs.ts"), /import \{ fractionDigitGroups \} from "\.\.\/\.\.\/lib\/content\/research-number"/u);
});

test("a figure that follows a table writes none of its values, in its labels or its caption", async () => {
  const beside = [];
  for (const page of PAGES) {
    const html = await read(`out/${page}/index.html`);
    for (const figure of figures(html)) {
      const tables = tablesBefore(html, figure.open);
      if (!tables.length) continue;
      beside.push(figure.id);
      // A table's values are its cells after each row's first, which names the row (α = 0.520 names a candidate).
      const tableValues = tables.flatMap((table) => [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gu)].flatMap((row) => [...row[1].matchAll(/<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gu)].slice(1).flatMap((cell) => numbers(visibleText(cell[2])))));
      const caption = /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/u.exec(figure.shown)?.[1] ?? "";
      // Axis ticks mark the scale, and equation numbers name displays; neither is a value.
      const labels = figure.shown.replace(/<figcaption\b[\s\S]*$/u, "").replace(/<span class="[^"]*_tick[XY]\b[^"]*"[^>]*>(?:[^<]|<sup>[^<]*<\/sup>)*<\/span>/gu, "");
      for (const value of numbers(visibleText(labels))) assert.ok(!restates(value, tableValues, true), `${page} ${figure.id}: a label writes ${value}, which the table above states.`);
      for (const value of numbers(visibleText(caption))) assert.ok(!restates(value, tableValues, false), `${page} ${figure.id}: the caption writes ${value}, which the table above states.`);
    }
  }
  for (const id of ["asian-interval", "asian-width", "heston-stages", "heston-ledger", "heston-candidates", "rejection-cost", "audit-policies", "protocol-outcomes", "regret-scenarios"]) {
    assert.ok(beside.includes(id), `${id} follows a table.`);
  }
});
