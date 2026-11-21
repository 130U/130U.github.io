import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { placePassageTables } from "../app/lib/content/passage-tables.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { alignColumn, fractionDigitGroups, isInterval, parseTableNumber, writtenNumber } from "../app/lib/content/research-number.ts";

// The values of a research table read as a printed table sets them: tabular
// figures, digits after the point grouped in threes by spacing alone, every
// column aligned on the decimal point. Nothing is inserted, so the text a reader
// copies or searches is the manuscript's number.

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");
const decode = (text) => text.replace(/&#x27;|&#39;/gu, "'").replace(/&quot;/gu, '"').replace(/&amp;/gu, "&").replace(/&lt;/gu, "<").replace(/&gt;/gu, ">");
const PAGES = [
  ["selected-research", "critical-dependence-stress-for-diversification-gains-under-fixed-marginals", ""],
  ["selected-research", "certified-valuation-of-arithmetic-asian-options", ""],
  ["selected-research", "certified-joint-pricing-errors-in-rough-heston", ""],
  ["artificial-intelligence", "evidence-verification-and-robust-comparison-in-investment-research", "experience/"],
  ["artificial-intelligence", "financial-task-design-and-synthetic-data-engineering", "experience/"],
  ["artificial-intelligence", "general-reasoning-evaluation-and-layered-verification", "experience/"],
  ["artificial-intelligence", "large-scale-domain-expert-feedback-governance-and-adaptive-review", "experience/"],
];

/** Width in units: each written character one unit, each digit-group gap a sixth of a unit apart. */
function width(pads, value, mode) {
  const shown = (pad) => pad.when === undefined || pad.when === mode;
  let characters = 0;
  let gaps = 0;
  value.fields.forEach((field, index) => {
    for (const pad of [field.before, field.after]) if (shown(pad)) [characters, gaps] = [characters + pad.text.length, gaps + pad.gaps];
    characters += `${field.separator}${field.open}${field.sign}${field.integer}${field.fraction === undefined ? "" : `.${field.fraction}`}${field.close}`.length;
    if (mode === "broken" && value.interval && index === 1) characters -= field.separator.length;
    gaps += Math.max(0, field.groups.length - 1);
  });
  for (const pad of value.tail) if (shown(pad)) [characters, gaps] = [characters + pad.text.length, gaps + pad.gaps];
  return characters + gaps / 6;
}

test("a value is a number, percentage, interval or list, written as text or as one formula of numbers", () => {
  const cases = new Map([
    ["0.023182246099", "0.023182246099"],
    ["$`[-0.011024692273,\\;0.010642371599]`$", "[−0.011024692273, 0.010642371599]"],
    ["$`[-3.441491358,3.441491358]`$", "[−3.441491358, 3.441491358]"],
    ["$`-0.063243`$", "−0.063243"],
    ["**0.515**", "0.515"],
    ["$`.\\mathbf{0}\\mathbf{1}\\mathbf{1}\\mathbf{0}\\mathbf{2}\\mathbf{5}`$", ".011025"],
    ["14.81% / 3.00% / 43.33%", "14.81% / 3.00% / 43.33%"],
    ["[4.825094, 6.778350]", "[4.825094, 6.778350]"],
    ["0.649–0.708–0.771", "0.649–0.708–0.771"],
    ["395,442.59", "395,442.59"],
    ["2 / 5", "2 / 5"],
  ]);
  for (const [source, written] of cases) assert.equal(writtenNumber(parseTableNumber(source)), written, source);
  assert.equal(parseTableNumber("**0.515**").bold, true);
  assert.equal(parseTableNumber("$`.\\mathbf{0}\\mathbf{1}`$").bold, true);
  for (const source of ["$`1/384`$", "$`10^{-12}`$", "\\(4.1\\times10^{-16}\\)", "1.0035464 (used)", "7 of 10", "-16% to +97%", "—", "1/4", "Baseline", "$`h=1/768`$"]) {
    assert.equal(parseTableNumber(source), undefined, `${source} is not a value of a table's column of numbers.`);
  }
  assert.ok(isInterval(parseTableNumber("$`[6.508371733,\\;6.518868974]`$")));
});

test("digits after the point stand in threes, a lone final digit with the group before it, as CODATA prints them", () => {
  assert.deepEqual(fractionDigitGroups("04"), ["04"]);
  assert.deepEqual(fractionDigitGroups("0081"), ["0081"]);
  assert.deepEqual(fractionDigitGroups("00170"), ["001", "70"]);
  assert.deepEqual(fractionDigitGroups("0307690"), ["030", "7690"]);
  assert.deepEqual(fractionDigitGroups("508371733"), ["508", "371", "733"]);
  assert.deepEqual(fractionDigitGroups("0000805"), ["000", "0805"]);
  assert.deepEqual(fractionDigitGroups("011024692273"), ["011", "024", "692", "273"]);
  assert.deepEqual(fractionDigitGroups("000000012711979137"), ["000", "000", "012", "711", "979", "137"]);
});

test("a column of values takes one width, so its points align, on one line and broken after an interval's comma", () => {
  const columns = [
    ["$`[6.508371733,\\;6.518868974]`$", "$`[6.507844281,\\;6.519014106]`$", "$`[-0.011024692273,\\;0.010642371599]`$"],
    ["0.0081", "0.17", "0.91", "1.39", "0.0008"],
    ["0.0000805", "0.00170", "0.009084"],
    ["77.0%", "100%"],
    ["3.00% / 11.56% / 43.33%", "3.31% / 9.57% / 100%", "0% / 67% / 100%"],
    ["2 / 5", "3 / 12"],
  ];
  for (const sources of columns) {
    const { values, start } = alignColumn(sources.map((source) => parseTableNumber(source)));
    assert.equal(start, false, `${sources[0]}: every value holds as many fields.`);
    for (const mode of ["line", "broken"]) {
      const widths = values.map((value) => width(null, value, mode));
      if (mode === "broken" && values.some((value) => value.interval)) continue;
      assert.ok(Math.max(...widths) - Math.min(...widths) < 1e-9, `${sources.join(" | ")}: one width ${mode === "line" ? "on one line" : "broken"} (${widths}).`);
    }
    values.forEach((value, index) => assert.equal(writtenNumber(value), writtenNumber(parseTableNumber(sources[index])), "Padding adds nothing to the written number."));
  }
  // An interval on one line keeps its upper end against its comma: no pad stands inside its brackets.
  const [shorter] = alignColumn(columns[0].map((source) => parseTableNumber(source))).values;
  assert.equal(shorter.fields[0].after.when, "broken");
  assert.equal(shorter.fields[1].before.when, "broken");
  assert.equal(shorter.tail[0].when, "line");
  assert.equal(shorter.tail[0].text, "000000");
  // Broken, each line of an interval column takes one width: the lower ends' line, and the upper ends' line.
  const broken = alignColumn(columns[0].map((source) => parseTableNumber(source))).values;
  const line = (value, index) => {
    const field = value.fields[index];
    return field.before.text.length + `${field.open}${field.sign}${field.integer}.${field.fraction}${field.close}`.length + field.after.text.length + (field.groups.length - 1 + field.before.gaps + field.after.gaps) / 6;
  };
  for (const index of [0, 1]) {
    const widths = broken.map((value) => line(value, index));
    assert.ok(Math.max(...widths) - Math.min(...widths) < 1e-9, `Line ${index + 1} of a broken interval takes one width.`);
  }
  // The upper end stands under the lower end's point: the same bracket, sign and integer room before it.
  for (const value of broken) {
    const [lower, upper] = value.fields;
    assert.equal(lower.before.text.length + lower.open.length + lower.sign.length + lower.integer.length, upper.before.text.length + upper.sign.length + upper.integer.length);
  }
});

test("a column of values with different numbers of fields aligns from its start, padded before its numbers only", () => {
  const { values, start } = alignColumn(["$`[6.499318797594,\\;6.509948941256]`$", "$`[-0.011798506840,\\;0.011383739259]`$", "0.023182246099"].map((source) => parseTableNumber(source)));
  assert.equal(start, true);
  const before = values.map((value) => value.fields[0].before.text.length + value.fields[0].open.length + value.fields[0].sign.length + value.fields[0].integer.length);
  assert.deepEqual(new Set(before).size, 1, "Each first number's point stands as far from the cell's start.");
  for (const value of values) {
    assert.deepEqual(value.tail, []);
    assert.equal(value.fields[0].after.text, "");
  }
  // Bold figures are wider than regular ones: a column with a bold value aligns from its start as well, and a
  // pad takes the weight of the integer part it repeats.
  assert.equal(alignColumn(["3.9878%", "0.1590%", "**0.0002529%**"].map((source) => parseTableNumber(source))).start, true);
  assert.equal(alignColumn(["**1**", "**2**", "**4**"].map((source) => parseTableNumber(source))).start, false);
  const weights = alignColumn(["25.08", "628.84", "**395,442.59**"].map((source) => parseTableNumber(source))).values;
  assert.deepEqual(weights.map((value) => [value.fields[0].before.text, value.fields[0].before.bold]), [["395,4", true], ["395,", true], ["", undefined]]);
});

test("every value of every research table shows the manuscript's digits, grouped by spans and padded by generated text", async () => {
  let counted = 0;
  for (const [directory, slug, prefix] of PAGES) {
    const { markdown } = JSON.parse(await read(`content/${directory}/${slug}.json`));
    const html = await read(`out/${prefix}${slug}/index.html`);
    const blocks = parseResearchMarkdown(markdown, { joinSoftLines: true });
    const cells = [
      ...blocks.filter((block) => block.type === "table").flatMap((block) => block.rows.slice(1).flat()),
      ...placePassageTables(slug, blocks, markdown).flatMap((table) => table.rows.slice(1).flat()),
    ];
    const written = new Set(cells.map((cell) => parseTableNumber(cell.source)).filter(Boolean).map(writtenNumber));
    const shown = [...html.matchAll(/<span\b[^>]*\bdata-table-value=""[^>]*>([\s\S]*?)<\/span>(?=<\/strong>|<\/td>|<span\b[^>]*class="[^"]*assistive)/gu)].map((match) => match[1]);
    for (const markup of shown) {
      // The pads are empty elements whose text is generated; the groups are spans holding digits only.
      for (const [, attributes, inner] of markup.matchAll(/<span\b([^>]*\bdata-table-pad="[^"]*"[^>]*)>([\s\S]*?)<\/span>/gu)) {
        assert.equal(inner, "", `A pad holds no text: ${attributes}`);
      }
      // A later group holds two to four digits: three, the last two, or four where a lone final digit joins it.
      for (const [, group] of markup.matchAll(/<span\b[^>]*\bdata-digit-group=""[^>]*>([^<]*)<\/span>/gu)) assert.match(group, /^\d{2,4}$/u);
      const text = decode(markup.replace(/<!--[\s\S]*?-->/gu, "").replace(/<[^>]+>/gu, ""));
      counted += 1;
      if (/^\[|^[\d.−+-]/u.test(text) && !text.includes("(")) assert.ok(written.has(text), `${slug}: ${text} is a value the manuscript writes.`);
    }
  }
  assert.ok(counted > 300, `The research tables set their values as values (${counted}).`);
});

test("the table styles group digits by a thin space and keep the pads invisible", async () => {
  const css = await read("app/components/research/ResearchArticle.module.css");
  const rule = (selector) => css.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}\\s*\\{([^}]*)\\}`, "u"))?.[1] ?? "";
  assert.match(rule(".value"), /--digit-gap:\s*calc\(1em \/ 6\)/u);
  assert.match(rule(".value"), /tabular-nums/u);
  assert.match(rule(".digitGroup"), /margin-inline-start:\s*var\(--digit-gap\)/u);
  assert.match(rule(".pad::before"), /content:\s*attr\(data-table-pad\)/u);
  assert.match(rule(".pad::before"), /visibility:\s*hidden/u);
  assert.match(rule(".tableRegion[data-break] .fieldBreak::after"), /content:\s*"\\A"/u);
});
