import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { cubicLaw, kinkBoundPerStrike } from "../app/lib/content/asian-kink-bound.ts";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

const SLUG = "certified-valuation-of-arithmetic-asian-options";
const STUDIES = [
  ["gap-profile.json", "30e1676f4cc0c72d0b0dbdb1cac384c41a70370b"],
  ["euler-ladder.json", "5359e2b42d32881df6fd678301feb0051cf4095c"],
];

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url));
const json = async (relative) => JSON.parse(await read(relative));

/** The rows of the manuscript table whose caption opens with `title`, as arrays of cell text. */
function tableRows(blocks, title) {
  const caption = blocks.findIndex((block) => block.type === "paragraph" && block.source.startsWith(`**${title}`));
  assert.ok(caption >= 0 && blocks[caption + 1].type === "table", `${title} is a captioned table.`);
  return blocks[caption + 1].rows.slice(1).map((row) => row.map((cell) => cell.source.replace(/\$`|`\$/gu, "")));
}

test("the Asian figure data is the pinned study results, as the importer extracts them", async () => {
  const provenance = (await json("content/sources/selected-research/provenance.json")).sources.find((source) => source.slug === SLUG);
  const article = await json(`content/selected-research/${SLUG}.json`);
  assert.deepEqual(provenance.studies.map((study) => study.sourceBlob), STUDIES.map(([, blob]) => blob));
  for (const [index, [name, blob]] of STUDIES.entries()) {
    const bytes = await read(`content/sources/selected-research/asian-studies/${name}`);
    assert.equal(createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), blob, `${name} is byte-identical to its upstream blob.`);
    assert.equal(provenance.studies[index].sourceUrl, `${article.repositoryUrl}/blob/${article.sourceCommit}/studies/results/${name}`);
  }
  const figureData = await read(`content/selected-research/${SLUG}.figures.json`);
  assert.equal(createHash("sha256").update(figureData.toString("utf8").replace(/\r\n/gu, "\n")).digest("hex"), provenance.figureDataSha256);

  const data = JSON.parse(figureData);
  const profile = await json("content/sources/selected-research/asian-studies/gap-profile.json");
  const ladder = await json("content/sources/selected-research/asian-studies/euler-ladder.json");
  const [low, high] = data.disagreement.window;
  assert.deepEqual(data.disagreement.points, profile.sample_cG_A.filter(([proxy]) => proxy > low && proxy < high));
  assert.deepEqual(data.profile.rows, profile.profile.filter((row) => row.strike >= 55 && row.strike <= 190).map((row) => [row.strike, row.cost, row.gamma_term]));
  assert.deepEqual(data.ladder.rungs, ladder.rungs.map((rung) => [rung.steps_per_year, rung.bias]));
  assert.deepEqual(data.ladder.kink, ladder.kink_cost_change.rows.map((row) => [row.steps_per_year, ...row.change_in_spread]));
});

test("the Asian drawings plot what the manuscript's captions, tables and text state", async () => {
  const article = await json(`content/selected-research/${SLUG}.json`);
  const blocks = parseResearchMarkdown(article.markdown, { joinSoftLines: true });
  const data = await json(`content/selected-research/${SLUG}.figures.json`);

  // Figure 1: 2,231 of 6,000 paths in the window, and the strike between cG and A on 34 of them.
  const { strike, points, sample } = data.disagreement;
  assert.equal(sample, 6000);
  assert.equal(points.length, 2231);
  assert.equal(points.filter(([proxy, average]) => (proxy > strike) !== (average > strike)).length, 34);
  assert.ok(article.markdown.includes("2,231 of a sample of 6,000, and strike $`K=95`$") && article.markdown.includes("which happens on 34 of them"));
  for (const [proxy, average] of points) assert.ok(average - proxy > -0.9 && average - proxy < 2.2, "Every path lies inside the plotted range of the basis.");

  // Figure 2: the one-month curve passes through the crude oil rows of Table 1, which discount at 4 percent.
  const contracts = tableRows(blocks, "Table 1.");
  for (const [months, leadDays] of [[1, 21], [3, 63], [6, 126], [12, 252]]) {
    const row = contracts.find(([name]) => name === `Crude oil call, ${months} ${months === 1 ? "month" : "months"} ahead`);
    const discounted = 70 * kinkBoundPerStrike(leadDays, 21, 49 / 400) * Math.exp((-0.04 * (leadDays + 20)) / 252);
    assert.equal((Math.ceil(discounted * 1e7) / 1e7).toFixed(7), row[2], `Table 1 states the bound ${months} months ahead, rounded up.`);
    assert.ok(cubicLaw(leadDays, 21, 49 / 400) < kinkBoundPerStrike(leadDays, 21, 49 / 400), "The leading term under continuous monitoring lies below the bound for 21 fixings.");
  }
  assert.ok(Math.abs(cubicLaw(252, 253, 49 / 400) / (0.35 ** 3 / (360 * Math.sqrt(2 * Math.PI))) - 1) < 1e-12, "The leading term is the cubic law (4.4).");

  // Figure 3: the conservation law and the peak of the profile.
  const { rows, logBound, quadraticBound } = data.profile;
  const peak = rows.reduce((best, row) => (row[1] / row[0] > best[1] / best[0] ? row : best));
  assert.ok(Math.abs(peak[0] - 77) < 1.5, "Per unit of strike the cost peaks near K = 77.");
  for (const [K, cost] of rows) assert.ok(cost / K < Math.min(logBound, quadraticBound / K ** 2), "The bound of Theorem 3.3 lies above the cost at every strike.");

  // Figure 4: Table 8 and the three certified steps.
  const table = new Map(tableRows(blocks, "Table 8.").map(([steps, bias]) => [Number(steps.match(/^\d+/u)[0]), bias]));
  const rungs = new Map(data.ladder.rungs);
  assert.equal(rungs.size, 12);
  for (const [steps, bias] of table) assert.equal(rungs.get(steps).toFixed(9), bias, `Table 8 states the bias at ${steps} steps.`);
  assert.deepEqual(data.ladder.certified, [384, 768, 1536]);
  assert.equal((-data.ladder.firstOrder).toFixed(5), "0.15563");
  const [, change, error] = data.ladder.kink.find(([steps]) => steps === 768);
  assert.equal(`${(change * 1e7).toFixed(1)}, ${(error * 1e7).toFixed(1)}`, "-1.2, 1.2");
});

test("the published Asian article draws its four figures natively under the manuscript's captions", async () => {
  const article = await json(`content/selected-research/${SLUG}.json`);
  const figures = parseResearchMarkdown(article.markdown, { joinSoftLines: true }).filter((block) => block.type === "figure");
  assert.deepEqual(figures.map(({ src }) => src), ["disagreement", "cubic-law", "profile", "euler-ladder"].map((name) => `/assets/research/asian/${name}.png`));
  const page = (await read(`out/${SLUG}/index.html`)).toString("utf8");
  const drawings = [...page.matchAll(/<figure\b[^>]*\bdata-manuscript-figure="([^"]+)"[^>]*>([\s\S]*?)<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gu)];
  assert.deepEqual(drawings.map((match) => match[1]), ["asian-disagreement", "asian-cubic-law", "asian-profile", "asian-euler-ladder"]);
  for (const [index, [, , drawing, caption]] of drawings.entries()) {
    assert.match(drawing, /\brole="img"[^>]*\baria-label="[^"]{40,}"/u, "Each native drawing is one labeled image.");
    assert.doesNotMatch(drawing, /<img\b/u, "Each manuscript figure is a native drawing.");
    assert.match(caption.replace(/<[^>]+>/gu, ""), new RegExp(`^Figure ${index + 1}\\. `, "u"), "Each drawing carries the manuscript's caption.");
  }
  assert.equal([...drawings[0][2].matchAll(/M[\d.]+,[\d.]+h0/gu)].length, 2231 - 34, "The scatter marks every path on which the two exercise rules agree.");
  assert.equal([...drawings[0][2].matchAll(/data-tip="cG = /gu)].length, 34, "Each path inside a wedge has its own marker.");
});
