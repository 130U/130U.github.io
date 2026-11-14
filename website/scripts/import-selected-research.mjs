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
    sourceCommit: "de721f78cec277e390cd9dc2ebc4efa9ae9681e4", sourceBlob: "2b52caa1ad3e58a2f411c9c1f1b651d01f3a8d39",
    sourceEditedAt: "2026-11-12T09:54:24-05:00", fetchedAt: "2026-11-12", mainSections: 8,
    appendixAnchor: "appendix-a-probability-model-and-strip-transform",
    description: "A method for certifying portfolio valuation errors in rough Heston, carrying continuous Riccati residual bounds through to complete pricing guarantees.",
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
  // A manuscript figure is an image line followed by its caption paragraph,
  // whose bold opening repeats the image's label. The page draws the figure
  // from the image's local path and sets the caption beneath it.
  const figures = [];
  const captioned = main.replace(/^!\[([^\]\n]+)\]\(figures\/([a-z0-9-]+)\.png\)\n\n\*\*\1\*\*([^\n]*)$/gmu, (_, label, image, caption) => {
    const src = `/assets/research/${config.figures?.directory}/${image}.png`;
    figures.push({ label, src });
    return `![**${label}**${caption}](${src})`;
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
      ...(figures.length ? ["Each figure's image line joins its caption paragraph as one captioned figure at a local path, and the page draws the figure from the pinned study results."] : []),
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
