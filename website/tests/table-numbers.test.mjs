import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { placePassageTables } from "../app/lib/content/passage-tables.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { parseResearchDisplayTable } from "../app/lib/content/research-math.ts";
import { alignColumn, alignTexColumn, fractionDigitGroups, isInterval, parseTableNumber, parseTexNumber, writtenNumber } from "../app/lib/content/research-number.ts";

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
    // A bound keeps its relation, set apart by a space as TeX sets a relation.
    ["$`\\le.008018821658`$", "≤ .008018821658"],
    ["$`[.0307690,.0307764]`$", "[.0307690, .0307764]"],
  ]);
  for (const [source, written] of cases) assert.equal(writtenNumber(parseTableNumber(source)), written, source);
  assert.equal(parseTableNumber("**0.515**").bold, true);
  assert.equal(parseTableNumber("$`.\\mathbf{0}\\mathbf{1}`$").bold, true);
  for (const source of ["$`1/384`$", "$`10^{-12}`$", "\\(4.1\\times10^{-16}\\)", "1.0035464 (used)", "7 of 10", "-16% to +97%", "—", "1/4", "Baseline", "$`h=1/768`$", "$`3/204800`$"]) {
    assert.equal(parseTableNumber(source), undefined, `${source} is not a value of a table's column of numbers.`);
  }
  assert.ok(isInterval(parseTableNumber("$`[6.508371733,\\;6.518868974]`$")));
  assert.ok(!isInterval(parseTableNumber("$`\\le.008018821658`$")));
  // In a research table a value may carry a note after it, which the cell sets as text after the value.
  for (const [source, written, note] of [
    ["1.0035464 (used)", "1.0035464", " (used)"],
    ["1.0035486 (rounded midpoint of (5.22))", "1.0035486", " (rounded midpoint of (5.22))"],
    ["384 (certified sums)", "384", " (certified sums)"],
    ["75.0% (accepts 1,800 flawed solutions)", "75.0%", " (accepts 1,800 flawed solutions)"],
  ]) {
    const value = parseTableNumber(source, { note: true });
    assert.deepEqual([writtenNumber(value), value.note], [written, note], source);
  }
  for (const source of ["7 of 10", "-16% to +97%", "**0.515** (bold)", "$`1/4`$ (a fraction)", "(5.22)"]) assert.equal(parseTableNumber(source, { note: true }), undefined, source);
});

test("a column of a table of mathematics whose every cell writes only numbers is a column of values", () => {
  const bounds = alignTexColumn([String.raw`\le.008018821658`, String.raw`\le.012716404217`]);
  assert.deepEqual(bounds.values.map(writtenNumber), ["≤ .008018821658", "≤ .012716404217"]);
  assert.ok(bounds.values.every((value) => value.tex === undefined), "The table's one assistive expression carries the TeX.");
  const quantiles = alignTexColumn(["[.0307690,.0307764]", "[.0308203,.0308350]"]);
  assert.deepEqual(quantiles.values.map((value) => [value.interval, value.fields.map((field) => field.groups.join(" "))]), [[true, ["030 7690", "030 7764"]], [true, ["030 8203", "030 8350"]]]);
  // A fraction, a symbol or an expression keeps the column mathematics.
  for (const column of [["3/204800", "3/81920"], ["0", String.raw`\varepsilon/2`], [String.raw`-(1+\varepsilon)`, "-1"]]) assert.equal(alignTexColumn(column), undefined, column.join(" | "));
  assert.deepEqual(alignTexColumn(["0.5", ""]).values.map((value) => value && writtenNumber(value)), ["0.5", undefined], "An empty cell stays empty.");
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
  // Bold figures are wider than regular ones: a column with a bold value aligns from its start as well, and
  // each number's lead stands in a box as wide as the column's widest lead in bold, so its point stands where
  // every other's does whatever its weight. Signs of different widths (a plus beside a minus written as a
  // hyphen) take the box too, its sign the widest.
  assert.equal(alignColumn(["3.9878%", "0.1590%", "**0.0002529%**"].map((source) => parseTableNumber(source))).start, true);
  assert.equal(alignColumn(["**1**", "**2**", "**4**"].map((source) => parseTableNumber(source))).start, false);
  const weights = alignColumn(["25.08", "628.84", "**395,442.59**"].map((source) => parseTableNumber(source))).values;
  assert.deepEqual(weights.map((value) => [value.fields[0].before.text, value.fields[0].lead]), [["", "395,442"], ["", "395,442"], ["", "395,442"]]);
  const signs = alignColumn(["+33.8%", "**-17.8%**"].map((source) => parseTableNumber(source))).values;
  assert.deepEqual(signs.map((value) => value.fields[0].lead), ["+33", "+33"]);
  assert.deepEqual(alignColumn(["2.5", "10.25"].map((source) => parseTableNumber(source))).values.map((value) => value.fields[0].lead), [undefined, undefined], "One weight and one sign need no box.");
  // Notes after values, of their own lengths, align the column from its start, its integer parts padded.
  const notes = alignColumn(["48", "384 (certified sums)", "6144"].map((source) => parseTableNumber(source, { note: true })));
  assert.equal(notes.start, true);
  assert.deepEqual(notes.values.map((value) => [value.fields[0].before.text, value.note]), [["61", undefined], ["6", " (certified sums)"], ["", undefined]]);
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
    // The cells of the tables of mathematics, from their displays' TeX.
    const mathCells = blocks.filter((block) => block.type === "equation").flatMap((block) => parseResearchDisplayTable(block.tex)?.rows.flatMap((row) => row.cells) ?? []);
    const written = new Set([
      ...cells.map((cell) => parseTableNumber(cell.source, { note: true })),
      ...mathCells.map((tex) => parseTexNumber(tex)),
    ].filter(Boolean).map(writtenNumber));
    // A value ends its cell, its bold, or meets its note or its assistive expression.
    const shown = [...html.matchAll(/<span\b[^>]*\bdata-table-value=""[^>]*>([\s\S]*?)<\/span>(?=<\/strong>|<\/td>|(?:<!-- -->)? \(|<span\b[^>]*class="[^"]*assistive)/gu)].map((match) => match[1]);
    for (const markup of shown) {
      // The pads are empty elements whose text is generated; the groups are spans holding digits only; a lead's
      // box holds the lead it sets.
      for (const [, attributes, inner] of markup.matchAll(/<span\b([^>]*\bdata-table-pad="[^"]*"[^>]*)>([\s\S]*?)<\/span>/gu)) {
        assert.equal(inner, "", `A pad holds no text: ${attributes}`);
      }
      for (const [, lead, inner] of markup.matchAll(/<span\b[^>]*\bdata-table-lead="([^"]*)"[^>]*><span>([^<]*)<\/span><\/span>/gu)) {
        assert.ok(inner.length <= lead.length && /^[[\d,]*$/u.test(lead.replace(/^\[?\+?/u, "")), `A lead's box is as wide as the widest lead: ${lead} holds ${inner}`);
      }
      // A later group holds two to four digits: three, the last two, or four where a lone final digit joins it.
      for (const [, group] of markup.matchAll(/<span\b[^>]*\bdata-digit-group=""[^>]*>([^<]*)<\/span>/gu)) assert.match(group, /^\d{2,4}$/u);
      const text = decode(markup.replace(/<!--[\s\S]*?-->/gu, "").replace(/<[^>]+>/gu, ""));
      counted += 1;
      if (/^\[|^[\d.−+≤-]/u.test(text)) assert.ok(written.has(text), `${slug}: ${text} is a value the manuscript writes.`);
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
  assert.match(rule(".lead::before"), /content:\s*attr\(data-table-lead\)/u);
  assert.match(rule(".lead::before"), /visibility:\s*hidden/u);
  assert.match(rule(".lead::before"), /font-weight:\s*bold/u);
  assert.match(rule(".tableRegion[data-break] .fieldBreak::after"), /content:\s*"\\A"/u);
  // A column of intervals broken after their commas aligns from its start, its head included.
  assert.match(rule(".tableRegion[data-break] .cell[data-interval]"), /text-align:\s*left/u);
  // A table that keeps its labels in view snaps its scrolling to a column's start beside them.
  assert.match(rule(".tableRegion[data-pinned]"), /scroll-snap-type:\s*x mandatory/u);
  assert.match(rule(".tableRegion[data-pinned]"), /scroll-padding-inline-start:\s*var\(--pin-width/u);
  assert.match(rule(".tableRegion[data-pinned] .cell:not(:first-child)"), /scroll-snap-align:\s*start/u);
  // The scrolled end of such a table is a column's start: the table runs on past its last column, blank, so no
  // column gives up its width.
  assert.match(rule(".tableRegion[data-pinned] .table"), /border-inline-end:\s*var\(--snap-end, 0px\) solid transparent/u);
  assert.doesNotMatch(css, /padding-right:[^;]*--snap-end/u);
});

test("the research and math tables mark every column of intervals, its head included", async () => {
  const html = await read("out/certified-valuation-of-arithmetic-asian-options/index.html");
  for (const title of ["Table 5. Proved intervals", "The 2.5, 50 and 97.5 percent quantiles"]) {
    const start = html.indexOf(title);
    const table = html.slice(html.indexOf("<table", start), html.indexOf("</table>", start));
    const heads = [...table.matchAll(/<th\b([^>]*)>/gu)].map(([, attributes]) => /data-interval=""/u.test(attributes));
    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gu)].slice(1).map(([, row]) => [...row.matchAll(/<td\b([^>]*)>/gu)].map(([, attributes]) => /data-interval=""/u.test(attributes)));
    rows.forEach((row) => row.forEach((interval, column) => assert.equal(heads[column], interval, `${title}: column ${column}`)));
    assert.ok(heads.some(Boolean), title);
  }
});
