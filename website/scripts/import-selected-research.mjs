import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const audit = new URL("../../docs/audits/selected-research-2026-10-08/", import.meta.url);
const sources = [
  {
    key: "asian", slug: "certified-valuation-arithmetic-asian-options", file: "manuscript/report.md",
    sourceCommit: "846bbe6acbaa4eaac07e20d5d2c566b3abc5456d", sourceBlob: "970c7fe3449a3a44fb32f6ae68d21c28d3cde3df",
    sourceEditedAt: "2026-10-08T11:16:02Z", mainSections: 10,
    appendixAnchor: "appendix-a-finite-certification-of-the-weighted-second-moment",
    description: "Certified pricing-error bounds for arithmetic Asian options under projected Euler, with common Gaussian smoothing, weak expansions, and posterior quantile transfer.",
  },
  {
    key: "rough", slug: "certified-rough-heston-valuation", file: "manuscript/merged-heston-en.md",
    sourceCommit: "8d7264ce2f269a2e01f0b9dd80680bf70e50dcee", sourceBlob: "e1185699a3e0b5dc9a95a02f190cb4f52c715e49",
    sourceEditedAt: "2026-10-08T11:08:15Z", mainSections: 8,
    appendixAnchor: "appendix-a-probability-model-and-strip-transform",
    description: "Deterministic joint pricing-error certificates for stored rough Heston outputs, finite-history propagation, portfolios, and finite-candidate decisions.",
  },
];

const receipts = [];
for (const config of sources) {
  const bytes = await readFile(new URL(`${config.key}-source.md`, audit));
  const source = bytes.toString("utf8");
  const blob = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  if (blob !== config.sourceBlob) throw new Error(`The frozen ${config.key} manuscript does not match its GitHub blob.`);
  const title = source.match(/^# (.+)$/mu)?.[1];
  const appendix = source.indexOf("\n## Appendix A.");
  const references = source.indexOf("\n## References");
  if (!title || appendix < 0 || references <= appendix) throw new Error("Missing manuscript boundaries.");
  const main = source.slice(source.indexOf("\n") + 1, appendix).trim();
  const refs = source.slice(references).trim();
  const repositoryUrl = `https://github.com/130U/${config.slug}`;
  const sourceUrl = `${repositoryUrl}/blob/${config.sourceCommit}/${config.file}`;
  const markdown = [
    main,
    "## Appendices and supporting material",
    `This page includes the complete main text and references. Appendices, supplementary proofs, code, and verification material are available in the [GitHub repository](${repositoryUrl}) and the [full manuscript](${sourceUrl}#${config.appendixAnchor}).`,
    refs,
  ].join("\n\n").replace(/\]\((\.\.\/[^\s)]+)\)/gu, (_, relative) => `](${repositoryUrl}/blob/${config.sourceCommit}/${relative.slice(3)})`) + "\n";
  const content = {
    slug: config.slug, title, description: config.description, sourceUrl, repositoryUrl,
    sourceEditedAt: config.sourceEditedAt, sourceCommit: config.sourceCommit, sourceBlob: config.sourceBlob,
    coverage: { mainSections: config.mainSections, omitted: "Appendices only; all main-text tables and references are retained." },
    markdown,
  };
  await writeFile(new URL(`../content/selected-research/${config.slug}.json`, import.meta.url), JSON.stringify(content, null, 2) + "\n");
  receipts.push({
    slug: config.slug, sourceUrl, sourceCommit: config.sourceCommit, sourceBlob: blob,
    sourceSha256: createHash("sha256").update(bytes).digest("hex"),
    importedMarkdownSha256: createHash("sha256").update(markdown).digest("hex"),
    includedHeadings: [...main.matchAll(/^#{2,3} (.+)$/gmu)].map((match) => match[1]),
    mainSections: config.mainSections,
    omitted: source.slice(appendix, references).match(/^## Appendix .+$/gmu),
    transformations: ["The title is rendered once by the page header.", "Relative file links resolve to the frozen GitHub commit.", "A paragraph links omitted appendices and supporting material to GitHub.", "Main text, all main-text tables, mathematical TeX and references are otherwise retained verbatim."],
  });
}
await writeFile(new URL("provenance.json", audit), JSON.stringify({ fetchedAt: "2026-10-08", fetchedWith: "GitHub plugin: github_fetch branches and commits; github_fetch_file at exact commit", sources: receipts }, null, 2) + "\n");
console.log(`Imported ${receipts.length} complete main texts; provenance: ${fileURLToPath(new URL("provenance.json", audit))}`);
