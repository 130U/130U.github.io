import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { parseResearchMarkdown } from "../app/lib/content/research-markdown.ts";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE = path.join(ROOT, "content", "sources", "selected-research", "dependence");
const SLUG = "critical-dependence-stress-for-portfolio-diversification";
const COMMIT = "3cc4c7e9b36e77027962999b932a1df7972cd2ed";
const PAPER_BLOB = "6ae3b86691b81075188d4cf73f091ac078f961bd";

async function manuscript() {
  const article = JSON.parse(await readFile(path.join(ROOT, "content", "selected-research", `${SLUG}.json`), "utf8"));
  const provenance = JSON.parse(await readFile(path.join(SOURCE, "provenance.json"), "utf8"));
  return { article, provenance, blocks: parseResearchMarkdown(article.markdown, { joinSoftLines: true }) };
}

function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function normalize(text) { return text.replace(/\s+/gu, " ").trim(); }
function decodeHtml(text) {
  return text.replace(/&(amp|lt|gt|quot|apos|#39|#x27);/gu, (_, name) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", "#39": "'", "#x27": "'" })[name]);
}
function attribute(tag, name) { return decodeHtml(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "u"))?.[1] ?? ""); }
function visitInlines(inlines, visit) {
  for (const inline of inlines) {
    visit(inline);
    if (inline.inlines) visitInlines(inline.inlines, visit);
  }
}
function parsedMath(blocks) {
  const formulas = [];
  for (const block of blocks) {
    if (block.type === "equation") formulas.push({ tex: block.tex, display: true });
    else for (const inlines of block.inlines ? [block.inlines] : block.rows.flat().map((cell) => cell.inlines)) {
      visitInlines(inlines, (inline) => { if (inline.type === "math") formulas.push({ tex: inline.tex, display: false }); });
    }
  }
  return formulas;
}
function captionText(inlines) {
  return inlines.map((inline) => inline.type === "math" ? "" : inline.inlines ? captionText(inline.inlines) : inline.text ?? " ").join("");
}

test("dependence import reproduces its pinned sources and checked-in artifacts", async () => {
  execFileSync(process.execPath, [path.join(ROOT, "scripts", "import-dependence-research.mjs"), "--check"], { cwd: ROOT, encoding: "utf8", timeout: 30_000 });
  const { article, provenance, blocks } = await manuscript();
  const manifest = JSON.parse(await readFile(path.join(SOURCE, "source-manifest.json"), "utf8"));
  assert.equal(manifest.commit, COMMIT);
  assert.equal(article.sourceCommit, COMMIT);
  assert.equal(provenance.sourceCommit, COMMIT);
  assert.equal(article.sourceBlob, PAPER_BLOB);
  assert.equal(provenance.sourceFiles.length, 28);
  assert.deepEqual(provenance.sourceFiles.map(({ path: sourcePath }) => sourcePath), manifest.files.map(({ path: sourcePath }) => sourcePath));
  for (const receipt of provenance.sourceFiles) {
    const bytes = await readFile(path.join(SOURCE, receipt.local));
    const frozen = manifest.files.find((entry) => entry.path === receipt.path);
    assert.equal(bytes.length, frozen.size, receipt.local);
    assert.equal(createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex"), frozen.sha, receipt.local);
    assert.equal(sha256(bytes), receipt.sha256, receipt.local);
  }
  assert.equal(sha256(article.markdown), provenance.importedMarkdownSha256);
  assert.equal(blocks.filter((block) => block.type === "heading" && /^## \d+\./u.test(block.source)).length, 5);
  assert.equal(blocks.filter((block) => block.type === "heading" && /^### \d+\.\d+/u.test(block.source)).length, 11);
  for (const file of ["main-variational-proof.tex", "technical-efficiency-identity.tex"]) assert.ok(provenance.includedFiles.includes(file), `${file} is part of the main text`);
  assert.deepEqual([...article.markdown.matchAll(/^\*\*((?:Proposition|Theorem|Lemma|Corollary) \d+\.\d+)/gmu)].map((match) => match[1]), [
    "Proposition 2.1", "Proposition 2.2", "Theorem 3.1", "Proposition 3.2", "Theorem 3.3", "Lemma 4.1",
    "Theorem 4.2", "Theorem 4.3", "Proposition 5.1", "Corollary 5.2", "Proposition 5.3",
  ]);
  const references = await readFile(path.join(SOURCE, "references.tex"), "utf8");
  const keys = [...references.matchAll(/\\bibitem\{([^}]+)\}/gu)].map((match) => match[1]);
  assert.equal(keys.length, 41);
  assert.deepEqual(blocks.filter(({ id }) => id?.startsWith("ref-")).map(({ id }) => id.slice(4)), keys);
});

test("dependence parsing and published mathematics retain the complete source ledger in order", async () => {
  const { provenance, blocks } = await manuscript();
  assert.equal(provenance.mathematics.length, 965);
  assert.equal(provenance.mathematics.filter(({ display }) => display).length, 91);
  for (const { sourceTex, tex } of provenance.mathematics) {
    assert.equal(tex, sourceTex.replace(/\\label\{[^}]+\}/gu, "").trim(), "Only source labels may leave mathematical bodies.");
  }
  // Display delimiters contribute one newline on either side of the unchanged TeX.
  const expected = provenance.mathematics.map(({ tex, display }) => ({ tex: display ? `\n${tex}\n` : tex, display }));
  assert.deepEqual(parsedMath(blocks), expected);
  const html = await readFile(path.join(ROOT, "out", "education", SLUG, "index.html"), "utf8");
  const rendered = [...html.matchAll(/<math\b[^>]*data-research-math="(inline|display)"[^>]*>[\s\S]*?<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>[\s\S]*?<\/math>/gu)].map((match) => ({ tex: decodeHtml(match[2]), display: match[1] === "display" }));
  assert.deepEqual(rendered, expected, "Rendered annotations preserve every TeX byte, equation tag, mode and position.");
  assert.equal(blocks.length, 343);
  assert.deepEqual([...html.matchAll(/data-research-block="(\d+)"/gu)].map((match) => Number(match[1])), blocks.map((_, index) => index));
  assert.doesNotMatch(html, /data-mjx-error|<merror\b|@@DEPENDENCE|@@FINAL-MATH/u);
  const ids = [...html.matchAll(/\bid="([^"]+)"/gu)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const { id } of blocks.filter(({ id }) => id)) assert.ok(ids.includes(id), `Missing source anchor ${id}`);
  const links = [...html.matchAll(/<a\b([^>]*)>/gu)].map((match) => attribute(match[1], "href"));
  for (const { href } of provenance.crossReferences) assert.ok(links.includes(href), `Missing original cross-reference ${href}`);
  for (const href of links.filter((href) => href.startsWith("#"))) assert.ok(ids.includes(href.slice(1)), `Broken internal link ${href}`);
});

test("dependence figures preserve source bytes, complete captions and appendix references", async () => {
  const { provenance, blocks } = await manuscript();
  const figures = blocks.filter((block) => block.type === "figure");
  assert.deepEqual(figures.map(({ src }) => path.basename(src)), ["tail-layer-repair.png", "corner-capacity.png", "budget-comparison.png", "optimal-flow-shares.png"]);
  const html = await readFile(path.join(ROOT, "out", "education", SLUG, "index.html"), "utf8");
  const rendered = [...html.matchAll(/<figure\b([^>]*)>([\s\S]*?)<\/figure>/gu)];
  assert.equal(rendered.length, 4);
  const sourceText = (await Promise.all(provenance.sourceFiles.filter(({ local }) => local.endsWith(".tex")).map(({ local }) => readFile(path.join(SOURCE, local), "utf8")))).join("\n").replace(/\r\n?/gu, "\n");
  for (const [index, figure] of figures.entries()) {
    const receipt = provenance.figures[index];
    assert.equal(figure.src, receipt.src);
    assert.ok(normalize(sourceText).includes(normalize(receipt.captionSource)), "Caption text must originate in a frozen TeX file.");
    const sourceCaption = receipt.captionSource.replace(/\\\([\s\S]*?\\\)/gu, "").replace(/\\eqref\{([^}]+)\}/gu, (_, label) => {
      const reference = provenance.crossReferences.find((entry) => entry.label === label);
      assert.ok(reference, `Unknown caption reference ${label}`);
      return `(${reference.number})`;
    });
    assert.equal(normalize(captionText(figure.inlines)), normalize(`Figure ${receipt.number}. ${sourceCaption}`));
    assert.equal(attribute(rendered[index][1], "id"), figure.id);
    assert.equal(attribute(rendered[index][2].match(/<img\b([^>]*)>/u)?.[1] ?? "", "src"), figure.src);
    const caption = rendered[index][2].match(/<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/u)?.[1] ?? "";
    const prose = caption.replace(/<svg\b[\s\S]*?<\/svg>|<math\b[\s\S]*?<\/math>|<[^>]+>/gu, "");
    assert.equal(normalize(decodeHtml(prose)), normalize(captionText(figure.inlines)), "Rendered figure captions retain all non-mathematical text.");
    const frozen = await readFile(path.join(SOURCE, "figures", path.basename(figure.src)));
    for (const directory of ["public", "out"]) assert.deepEqual(await readFile(path.join(ROOT, directory, figure.src.slice(1))), frozen, `${directory}${figure.src} must retain the original PNG bytes`);
  }
  const appendix = "https://github.com/130U/mathematical-finance-project/blob/" + COMMIT + "/paper/source/technical-quantitative.tex#L80";
  assert.ok(rendered[3][2].includes(`href="${appendix}"`), "The flow-share figure retains its original equation (B.2) appendix link.");
});
