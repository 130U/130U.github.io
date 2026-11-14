import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const sourceDirectory = new URL("../content/sources/selected-research/", import.meta.url);
const sources = [
  {
    key: "asian", slug: "certified-valuation-arithmetic-asian-options", file: "manuscript/report.md",
    sourceCommit: "2efeaf1580e139001744eab48ffd1c0c1e3058c8", sourceBlob: "43026cce8d246868ae16faa0ea76e3d341db7b4d",
    sourceEditedAt: "2026-11-14T06:28:35-05:00", fetchedAt: "2026-11-14", mainSections: 9,
    appendixAnchor: "appendix-a-finite-certification-of-the-weighted-second-moment",
    description: "The cost of exercising an arithmetic Asian option on the geometric average: a proved bound, its cubic law in Black's model, and a certified Heston price interval with its Euler discretization error.",
    figures: {
      directory: "asian", count: 4,
      studies: [
        { name: "gap-profile.json", file: "studies/results/gap-profile.json", blob: "30e1676f4cc0c72d0b0dbdb1cac384c41a70370b" },
        { name: "euler-ladder.json", file: "studies/results/euler-ladder.json", blob: "5359e2b42d32881df6fd678301feb0051cf4095c" },
      ],
      data: asianFigureData,
    },
  },
  {
    key: "rough", slug: "certified-rough-heston-valuation", file: "manuscript/merged-heston-en.md",
    sourceCommit: "64b8ef2bbff044e93ded82d2694bf1afe8d92b41", sourceBlob: "b25e5531b9a3d120732c276f3779e520b8968f58",
    sourceEditedAt: "2026-11-14T01:39:13-05:00", fetchedAt: "2026-11-14", mainSections: 8,
    appendixAnchor: "appendix-a-rescaled-variables-model-and-transform",
    description: "A method for certifying portfolio valuation errors in rough Heston, carrying continuous Riccati residual bounds through to complete pricing guarantees.",
    figures: {
      directory: "rough", count: 4,
      studies: [
        { name: "finite-history-nodes-alpha-13_25.json", file: "science/baseline/finite-history/finite-history-nodes-alpha-13_25.json", blob: "c6ae3634bd49abcf1ce00f1abc9cd1e9648acdb6" },
        { name: "transfer-time-local-nodes.json", file: "science/baseline/frontier/transfer-time-local-nodes.json", blob: "085f5093feb64a2d51bfea8e25e5090875b78345" },
        { name: "portfolio-budget-counts.json", file: "audit-experiments/portfolio-budget-counts.json", blob: "c54490b525090394fec3773dc497a5cc6ff463a0" },
      ],
      data: roughFigureData,
    },
  },
];

const gitBlob = (bytes) => createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

/** The values the four manuscript figures of the Asian paper plot, read from its study results. */
function asianFigureData({ "gap-profile.json": profile, "euler-ladder.json": ladder }) {
  const strike = 95;
  const window = [88, 102];
  const strikes = [55, 190];
  const { summary } = profile;
  return {
    disagreement: {
      strike, window, sample: profile.sample_cG_A.length,
      points: profile.sample_cG_A.filter(([proxy]) => proxy > window[0] && proxy < window[1]),
    },
    profile: {
      paths: summary.paths,
      logBound: summary.log_form_bound_over_strike[0],
      quadraticBound: summary.quadratic_form_bound_times_strike[0],
      rows: profile.profile.filter((row) => row.strike >= strikes[0] && row.strike <= strikes[1]).map((row) => [row.strike, row.cost, row.gamma_term]),
    },
    ladder: {
      firstOrder: ladder.first_order_coefficient,
      rungs: ladder.rungs.map((rung) => [rung.steps_per_year, rung.bias]),
      certified: ladder.comparison_with_certified_sums.map((row) => row.steps_per_year),
      kink: ladder.kink_cost_change.rows.map((row) => [row.steps_per_year, ...row.change_in_spread]),
    },
  };
}

/** An exact rational of the saved banks, such as "5/8", as a binary64 number. */
function rational(text) {
  const [numerator, denominator = "1"] = text.split("/");
  return Number(BigInt(numerator)) / Number(BigInt(denominator));
}

/**
 * The values Figures 2 to 4 of the Rough Heston paper plot, read from its saved
 * banks as scripts/build_figures.py of that repository reads them.
 */
function roughFigureData({
  "finite-history-nodes-alpha-13_25.json": history,
  "transfer-time-local-nodes.json": transfer,
  "portfolio-budget-counts.json": budgets,
}) {
  const forward = 4221.86;
  const step = 1 / 8;
  const weight = (u) => (u === 0 ? 0.5 : 1) / (u * u + 0.25);

  // Figure 2: the share of the leg-by-leg node charge in each band of four units of frequency.
  const charge = history.all_node_radii.map((radius, node) => rational(radius) * weight(node * step));
  const total = charge.reduce((sum, value) => sum + value, 0);
  const shares = Array.from({ length: 32 }, () => 0);
  charge.forEach((value, node) => { shares[Math.min(Math.floor((node * step) / 4), 31)] += value / total; });

  // Figure 3: the node error set of the 4400 and 4500 calls, a sum of one ellipse for each frequency.
  const moneyness = [4400, 4500].map((strike) => strike / forward);
  const ellipses = transfer.nodes.map((node) => {
    const u = rational(node.u);
    const scale = -(step / Math.PI) * weight(u) * rational(node.time_CF_radius_upper) * forward;
    return moneyness.map((m) => [scale * Math.sqrt(m) * Math.cos(u * Math.log(m)), -scale * Math.sqrt(m) * Math.sin(u * Math.log(m))]);
  });
  const boundary = Array.from({ length: 360 }, (_, degree) => {
    const direction = [Math.cos((degree * Math.PI) / 180), Math.sin((degree * Math.PI) / 180)];
    const point = [0, 0];
    for (const legs of ellipses) {
      const real = legs[0][0] * direction[0] + legs[1][0] * direction[1];
      const imaginary = legs[0][1] * direction[0] + legs[1][1] * direction[1];
      const modulus = Math.hypot(real, imaginary);
      if (modulus === 0) continue;
      legs.forEach((leg, index) => { point[index] += (leg[0] * real + leg[1] * imaginary) / modulus; });
    }
    return point.map((value) => Number(value.toFixed(7)));
  });
  const half = [0, 1].map((index) => ellipses.reduce((sum, legs) => sum + Math.hypot(...legs[index]), 0));
  const joint = ellipses.reduce((sum, legs) => sum + Math.hypot(legs[0][0] - legs[1][0], legs[0][1] - legs[1][1]), 0);
  const stored = (field) => transfer.nodes.reduce((sum, node) => sum + rational(node[field]), 0) * forward;
  if (Math.abs(joint - stored("joint_node_support_exact")) > 1e-9 || Math.abs(half[0] + half[1] - stored("signed_marginal_node_support_exact")) > 1e-9) {
    throw new Error("The node error set does not reproduce the saved node supports.");
  }

  // Figure 4: the exact thresholds of the 28 positions on bank H1, in index points.
  const thresholds = (alpha, method) => {
    const values = budgets.threshold_rows
      .filter((row) => row.configuration_id === "H1" && row.alpha === alpha && row.method === method)
      .map((row) => Number(rational(row.exact_threshold_points).toPrecision(12)))
      .sort((a, b) => a - b);
    if (values.length !== 28) throw new Error("A roughness candidate needs the thresholds of all 28 positions.");
    return values;
  };
  return {
    netting: { shares },
    errorSet: { boundary, half, joint, legByLeg: half[0] + half[1] },
    passCounts: ["13/25", "3/5", "9/10"].map((alpha) => ({ alpha: rational(alpha), joint: thresholds(alpha, "joint"), legByLeg: thresholds(alpha, "marginal") })),
  };
}

const receipts = [];
for (const config of sources) {
  const contentUrl = new URL(`../content/selected-research/${config.slug}.json`, import.meta.url);
  const bytes = await readFile(new URL(`${config.key}-source.md`, sourceDirectory));
  const source = bytes.toString("utf8").replace(/\r\n/gu, "\n");
  const blob = gitBlob(bytes);
  if (blob !== config.sourceBlob) throw new Error(`The frozen ${config.key} manuscript does not match its GitHub blob.`);
  const title = source.match(/^# (.+)$/mu)?.[1];
  const appendix = source.indexOf("\n## Appendix A.");
  const references = source.indexOf("\n## References");
  if (!title || appendix < 0 || references <= appendix) throw new Error("Missing manuscript boundaries.");
  const main = source.slice(source.indexOf("\n") + 1, appendix).trim();
  const refs = source.slice(references).trim();
  const repositoryUrl = `https://github.com/130U/${config.slug}`;
  const sourceUrl = `${repositoryUrl}/blob/${config.sourceCommit}/${config.file}`;
  // A manuscript figure is an image line that either carries its caption or is
  // followed by a caption paragraph whose bold opening repeats the image's
  // label. The page draws the figure from the image's local path and sets the
  // caption beneath it.
  const figures = [];
  const local = (image) => `/assets/research/${config.figures?.directory}/${image}.png`;
  const captioned = main
    .replace(/^!\[([^\]\n]+)\]\(figures\/([a-z0-9-]+)\.png\)\n\n\*\*\1\*\*([^\n]*)$/gmu, (_, label, image, caption) => {
      figures.push({ label, src: local(image) });
      return `![**${label}**${caption}](${local(image)})`;
    })
    .replace(/^!\[((Figure \d+\.)[^\n]*)\]\(\.\.\/figures\/([a-z0-9-]+)\.png\)$/gmu, (_, caption, label, image) => {
      figures.push({ label, src: local(image) });
      return `![${caption}](${local(image)})`;
    });
  if (figures.length !== (config.figures?.count ?? 0) || /^!\[/mu.test(captioned.replace(/^!\[[^\n]*\]\(\/assets\/research\/[a-z0-9/-]+\.png\)$/gmu, ""))) {
    throw new Error(`The ${config.key} manuscript's figures do not match their reviewed form.`);
  }
  const markdown = [
    captioned,
    "## Appendices and Supporting Material",
    `This page includes the complete main text and references. Appendices, supplementary proofs, code, and verification material are available in the [GitHub repository](${repositoryUrl}) and the [full manuscript](${sourceUrl}#${config.appendixAnchor}).`,
    refs,
  ].join("\n\n").replace(/\]\((\.\.\/[^\s)]+)\)/gu, (_, relative) => `](${repositoryUrl}/blob/${config.sourceCommit}/${relative.slice(3)})`) + "\n";
  const content = {
    slug: config.slug, title, description: config.description, sourceUrl, repositoryUrl,
    sourceEditedAt: config.sourceEditedAt, sourceCommit: config.sourceCommit, sourceBlob: config.sourceBlob,
    markdown,
  };
  await writeFile(contentUrl, JSON.stringify(content, null, 2) + "\n");
  const receipt = {
    slug: config.slug, fetchedAt: config.fetchedAt, sourceUrl, sourceCommit: config.sourceCommit, sourceBlob: blob,
    sourceSha256: sha256(bytes),
    importedMarkdownSha256: sha256(markdown),
    includedHeadings: [...main.matchAll(/^#{2,3} (.+)$/gmu)].map((match) => match[1]),
    mainSections: config.mainSections,
    omitted: source.slice(appendix, references).match(/^## Appendix .+$/gmu),
    transformations: [
      "The title is rendered once by the page header.",
      "Relative file links resolve to the frozen GitHub commit.",
      ...(figures.length ? ["Each figure is one captioned figure at a local path, which the page draws from the manuscript's formulas and the pinned study results."] : []),
      "A paragraph links omitted appendices and supporting material to GitHub.",
      "Main text, all main-text tables, mathematical TeX and references are otherwise retained verbatim.",
    ],
  };
  if (config.figures) {
    const studies = {};
    const studyReceipts = [];
    for (const study of config.figures.studies) {
      const studyBytes = await readFile(new URL(`${config.key}-studies/${study.name}`, sourceDirectory));
      if (gitBlob(studyBytes) !== study.blob) throw new Error(`The frozen ${config.key} study result ${study.name} does not match its GitHub blob.`);
      studies[study.name] = JSON.parse(studyBytes.toString("utf8"));
      studyReceipts.push({ sourceUrl: `${repositoryUrl}/blob/${config.sourceCommit}/${study.file}`, sourceBlob: study.blob, sourceSha256: sha256(studyBytes) });
    }
    const figureData = JSON.stringify(config.figures.data(studies)) + "\n";
    await writeFile(new URL(`../content/selected-research/${config.slug}.figures.json`, import.meta.url), figureData);
    Object.assign(receipt, { figures, studies: studyReceipts, figureDataSha256: sha256(figureData) });
  }
  receipts.push(receipt);
}
await writeFile(new URL("provenance.json", sourceDirectory), JSON.stringify({ fetchedWith: "Authenticated Git checkout at the exact commit; bytes read with git show and checked against Git blob SHA-1", sources: receipts }, null, 2) + "\n");
console.log(`Imported ${receipts.length} complete main texts; provenance: ${fileURLToPath(new URL("provenance.json", sourceDirectory))}`);
