import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";
import { ROUGH_HESTON, forwardVariance, halfShareDamping, herfindahlLevel, nettingRatio, position } from "../app/lib/content/rough-heston-curves.ts";

const SLUG = "certified-rough-heston-valuation";
const STUDIES = [
  ["finite-history-nodes-alpha-13_25.json", "science/baseline/finite-history/finite-history-nodes-alpha-13_25.json", "c6ae3634bd49abcf1ce00f1abc9cd1e9648acdb6"],
  ["transfer-time-local-nodes.json", "science/baseline/frontier/transfer-time-local-nodes.json", "085f5093feb64a2d51bfea8e25e5090875b78345"],
  ["portfolio-budget-counts.json", "audit-experiments/portfolio-budget-counts.json", "c54490b525090394fec3773dc497a5cc6ff463a0"],
];

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url));
const json = async (relative) => JSON.parse(await read(relative));
const rational = (text) => { const [numerator, denominator = "1"] = text.split("/"); return Number(BigInt(numerator)) / Number(BigInt(denominator)); };

/** The rows of the manuscript table whose caption opens with `title`, as arrays of cell text. */
function tableRows(blocks, title) {
  const caption = blocks.findIndex((block) => block.type === "paragraph" && block.source.startsWith(`**${title}`));
  assert.ok(caption >= 0 && blocks[caption + 1].type === "table", `${title} is a captioned table.`);
  return blocks[caption + 1].rows.slice(1).map((row) => row.map((cell) => cell.source));
}

test("the Rough Heston figure data is the pinned saved banks, as the importer extracts them", async () => {
  const provenance = (await json("content/sources/selected-research/provenance.json")).sources.find((source) => source.slug === SLUG);
  const article = await json(`content/selected-research/${SLUG}.json`);
  assert.deepEqual(provenance.studies.map((study) => study.sourceBlob), STUDIES.map(([, , blob]) => blob));
  for (const [index, [name, file, blob]] of STUDIES.entries()) {
    const bytes = await read(`content/sources/selected-research/rough-studies/${name}`);
    assert.equal(createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), blob, `${name} is byte-identical to its upstream blob.`);
    assert.equal(provenance.studies[index].sourceUrl, `${article.repositoryUrl}/blob/${article.sourceCommit}/${file}`);
  }
  const figureData = await read(`content/selected-research/${SLUG}.figures.json`);
  assert.equal(createHash("sha256").update(figureData.toString("utf8").replace(/\r\n/gu, "\n")).digest("hex"), provenance.figureDataSha256);

  const data = JSON.parse(figureData);
  const budgets = await json("content/sources/selected-research/rough-studies/portfolio-budget-counts.json");
  for (const [candidate, alpha] of [[0, "13/25"], [1, "3/5"], [2, "9/10"]]) {
    for (const [field, method] of [["joint", "joint"], ["legByLeg", "marginal"]]) {
      const thresholds = budgets.threshold_rows.filter((row) => row.configuration_id === "H1" && row.alpha === alpha && row.method === method).map((row) => rational(row.exact_threshold_points)).sort((a, b) => a - b);
      assert.equal(thresholds.length, 28);
      data.passCounts[candidate][field].forEach((value, position) => assert.ok(Math.abs(value - thresholds[position]) < 1e-11, "Each threshold is the saved exact endpoint."));
    }
  }
  const transfer = await json("content/sources/selected-research/rough-studies/transfer-time-local-nodes.json");
  const stored = (field) => transfer.nodes.reduce((sum, node) => sum + rational(node[field]), 0) * ROUGH_HESTON.forward;
  assert.ok(Math.abs(data.errorSet.joint - stored("joint_node_support_exact")) < 1e-9, "The drawn set has the saved joint node support.");
  assert.ok(Math.abs(data.errorSet.legByLeg - stored("signed_marginal_node_support_exact")) < 1e-9, "Its bounding box has the saved leg-by-leg node support.");
});

test("the Rough Heston drawings plot what the manuscript's tables and text state", async () => {
  const article = await json(`content/selected-research/${SLUG}.json`);
  const blocks = parseResearchMarkdown(article.markdown, { joinSoftLines: true });
  const data = await json(`content/selected-research/${SLUG}.figures.json`);

  // Figure 1: the curve (7.1) and the damping of Theorem 3.1.
  assert.equal(forwardVariance(0, 0), 0.0262);
  assert.equal((halfShareDamping * 0.5 ** ROUGH_HESTON.alpha).toFixed(3), "0.075", "The damping at six months is the paper's 0.075.");
  assert.equal(Math.sqrt(forwardVariance(0, 0)).toFixed(2), "0.16", "The curve starts at an instantaneous volatility of about 16 per cent.");
  for (const t of [0.05, 0.25, 0.5]) {
    assert.ok(forwardVariance(t, halfShareDamping) < forwardVariance(t, 0), "The half-share curve lies below the curve under the pricing measure.");
    assert.ok(forwardVariance(t, 0) > forwardVariance(t / 2, 0), "The calibrated curve is increasing.");
  }

  // Figure 2: Proposition 5.2, the Herfindahl levels of Table 7 and the node charge by frequency.
  const spread = position({ 4400: 1, 4500: -1 });
  const butterfly = position({ 4300: 1, 4400: -2, 4500: 1 });
  const basket = ROUGH_HESTON.strikes.map(() => 1 / 12);
  const gap = Math.log(4500 / 4400);
  for (const u of [0, 16, 64, 128]) {
    const predicted = Math.sqrt(Math.tanh(gap / 4) ** 2 + Math.sin((u * gap) / 2) ** 2 / Math.cosh(gap / 4) ** 2);
    assert.ok(Math.abs(nettingRatio(spread, u) - predicted) < 1e-12, "The spread's netting ratio is (5.8).");
  }
  const families = tableRows(blocks, "Table 7.");
  assert.equal(herfindahlLevel(spread).toFixed(3), families.find(([family]) => family === "Adjacent spreads")[4]);
  assert.equal(herfindahlLevel(butterfly).toFixed(3), families.find(([family]) => family === "Adjacent butterflies")[4]);
  assert.equal(herfindahlLevel(basket).toFixed(3), families.find(([family]) => family === "Equal-weight baskets")[4].split(",")[0]);
  assert.equal(nettingRatio(basket, 0), 1);
  const { shares } = data.netting;
  assert.equal(shares.length, 32);
  assert.ok(Math.abs(shares.reduce((sum, share) => sum + share, 0) - 1) < 1e-12);
  const middle = shares.slice(16, 24).reduce((sum, share) => sum + share, 0);
  assert.ok(middle > 0.7 && middle < 0.8, "Three quarters of the node charge sits between u = 64 and u = 96.");

  // Figure 3: the node support of Table 4.
  const [jointSupport, legByLegSupport] = tableRows(blocks, "Table 4.").find(([component]) => component.startsWith("Node support")).slice(1);
  assert.equal(data.errorSet.joint.toFixed(9), jointSupport);
  assert.equal(data.errorSet.legByLeg.toFixed(9), legByLegSupport);
  assert.equal(data.errorSet.boundary.length, 360);
  for (const [first, second] of data.errorSet.boundary) {
    assert.ok(Math.abs(first) <= data.errorSet.half[0] + 1e-6 && Math.abs(second) <= data.errorSet.half[1] + 1e-6, "The joint set lies in its bounding box.");
    assert.ok(Math.abs(first - second) <= data.errorSet.joint + 1e-6, "No point of the set exceeds the joint support in the direction of the spread.");
  }

  // Figure 4: the counts of Table 8.
  const tolerance = { "1/4": 0.25, "1/2": 0.5, 1: 1 };
  const counts = tableRows(blocks, "Table 8.");
  assert.equal(counts.length, 9);
  for (const [alpha, level, legByLeg, joint] of counts) {
    const candidate = data.passCounts.find((row) => row.alpha.toFixed(2) === alpha);
    const count = (thresholds) => thresholds.filter((value) => value <= tolerance[level]).length;
    assert.equal(String(count(candidate.joint)), joint, `Table 8 states the joint count at alpha ${alpha} and tolerance ${level}.`);
    assert.equal(String(count(candidate.legByLeg)), legByLeg, `Table 8 states the leg-by-leg count at alpha ${alpha} and tolerance ${level}.`);
  }
});

test("the published Rough Heston article draws its four figures natively under the manuscript's captions", async () => {
  const article = await json(`content/selected-research/${SLUG}.json`);
  const figures = parseResearchMarkdown(article.markdown, { joinSoftLines: true }).filter((block) => block.type === "figure");
  assert.deepEqual(figures.map(({ src }) => src), ["residual-kernel", "netting-ratio", "joint-error-set", "pass-counts"].map((name) => `/assets/research/rough/${name}.png`));
  const page = (await read(`out/${SLUG}/index.html`)).toString("utf8");
  const drawings = [...page.matchAll(/<figure\b[^>]*\bdata-manuscript-figure="([^"]+)"[^>]*>([\s\S]*?)<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/gu)];
  assert.deepEqual(drawings.map((match) => match[1]), ["rough-residual-kernel", "rough-netting-ratio", "rough-joint-error-set", "rough-pass-counts"]);
  for (const [index, [, , drawing, caption]] of drawings.entries()) {
    assert.match(drawing, /\brole="img"[^>]*\baria-label="[^"]{40,}"/u, "Each native drawing is a labeled image.");
    assert.doesNotMatch(drawing, /<img\b/u, "Each manuscript figure is a native drawing.");
    assert.match(caption.replace(/<[^>]+>/gu, ""), new RegExp(`^Figure ${index + 1}\\. `, "u"), "Each drawing carries the manuscript's caption.");
  }
  assert.equal([...drawings[3][2].matchAll(/\baria-label="Positions certified out of 28 /gu)].length, 3, "One panel for each roughness candidate.");
});
