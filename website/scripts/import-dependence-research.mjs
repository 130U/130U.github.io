import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

// This importer deliberately supports the pinned manuscript, not arbitrary TeX.
// Unknown prose commands fail closed; mathematical contents are never rewritten.
const sourceDirectory = new URL("../content/sources/selected-research/dependence/", import.meta.url);
const outputUrl = new URL("../content/selected-research/critical-dependence-stress-for-portfolio-diversification.json", import.meta.url);
assert.ok(process.argv.slice(2).every((argument) => argument === "--check"), "Usage: node scripts/import-dependence-research.mjs [--check]");
const checkOnly = process.argv.includes("--check");
async function writeOrCheck(url, content) {
  if (checkOnly) assert.deepEqual(await readFile(url), Buffer.from(content, "utf8"), `Generated content differs: ${url.pathname}`);
  else await writeFile(url, content);
}
const manifest = JSON.parse(await readFile(new URL("source-manifest.json", sourceDirectory), "utf8"));
const commit = "3cc4c7e9b36e77027962999b932a1df7972cd2ed";
const paperBlob = "6ae3b86691b81075188d4cf73f091ac078f961bd";
assert.equal(manifest.commit, commit);
assert.equal(manifest.repository, "130U/mathematical-finance-project");
const repositoryUrl = `https://github.com/${manifest.repository}`;
const sourceUrl = `${repositoryUrl}/blob/${commit}/paper/paper.pdf`;
const mainFiles = ["main-introduction.tex", "main-model-benchmark.tex", "main-variational.tex", "main-crossing.tex", "main-classification-flow.tex", "main-quantitative.tex", "main-scope.tex"];
const sources = new Map();
const sourceReceipts = [];
for (const entry of manifest.files) {
  const local = `${entry.path.endsWith(".png") ? "figures/" : ""}${entry.path.split("/").at(-1)}`;
  const bytes = await readFile(new URL(local, sourceDirectory));
  const blob = createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
  assert.equal(blob, entry.sha, `Frozen Git blob mismatch: ${local}`);
  assert.equal(bytes.length, entry.size, `Frozen file size mismatch: ${local}`);
  sourceReceipts.push({ path: entry.path, local, gitBlob: blob, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length });
  if (local.endsWith(".tex")) sources.set(local, bytes.toString("utf8").replace(/\r\n/gu, "\n"));
}
assert.equal(sourceReceipts.find(({ local }) => local === "paper.tex").gitBlob, paperBlob);
const includedFiles = new Set();
function expand(file, included = false, stack = []) {
  assert.ok(sources.has(file), `Unknown TeX input: ${file}`);
  assert.ok(!stack.includes(file), `Cyclic TeX input: ${file}`);
  if (included) includedFiles.add(file);
  return sources.get(file).replace(/\\input\{([^}]+)\}/gu, (_, name) => expand(name, included, [...stack, file]));
}
function withoutComments(text) { return text.replace(/(?<!\\)%[^\n]*/gu, ""); }
const paper = sources.get("paper.tex");
const sourceTitle = paper.match(/pdftitle=\{([^}]+)\}/u)?.[1];
assert.ok(sourceTitle);
const abstract = paper.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/u)?.[1].trim();
assert.ok(abstract);
const main = withoutComments(mainFiles.map((file) => expand(file, true)).join("\n\n"));
assert.equal((main.match(/\\section\{/gu) ?? []).length, 5, "The seven main input files contain five numbered sections.");
const wholePaper = withoutComments(expand("paper.tex").split("\\begin{document}")[1]);
const references = sources.get("references.tex");
const bibliographyKeys = [...references.matchAll(/\\bibitem\{([^}]+)\}/gu)].map((match) => match[1]);
assert.equal(new Set(bibliographyKeys).size, bibliographyKeys.length);
const bibliography = new Map(bibliographyKeys.map((key, index) => [key, { number: index + 1, anchor: `ref-${key}` }]));

function braced(text, start, open = "{", close = "}") {
  assert.equal(text[start], open, `Expected ${open}: ${text.slice(start, start + 90)}`);
  let depth = 1;
  for (let index = start + 1; index < text.length; index += 1) {
    if (text[index] === "\\") { index += 1; continue; }
    if (text[index] === open) depth += 1;
    if (text[index] === close && --depth === 0) return { value: text.slice(start + 1, index), end: index + 1 };
    if (text[index] !== close) continue;
  }
  throw new Error(`Unclosed ${open}: ${text.slice(start, start + 90)}`);
}

// Record the original cross-reference numbers before removing TeX layout.
// Several source labels may name the same result; they share one web anchor.
const aliases = new Map();
const anchorOwners = new Map();
for (const match of wholePaper.matchAll(/(?:\\label\{[^}]+\}\s*)+/gu)) {
  const keys = [...match[0].matchAll(/\\label\{([^}]+)\}/gu)].map((item) => item[1]);
  const anchor = `dep-${keys[0].replace(/[^A-Za-z0-9-]/gu, "-")}`;
  assert.ok(!anchorOwners.has(anchor) || anchorOwners.get(anchor) === keys[0], `Anchor collision: ${anchor}`);
  anchorOwners.set(anchor, keys[0]);
  keys.forEach((key) => aliases.set(key, anchor));
}
const labelNumbers = new Map();
let currentNumber;
let figureNumber = 0;
for (const match of wholePaper.matchAll(/\\(section|subsection|resultnumber|tag|caption|label)\{/gu)) {
  const argument = braced(wholePaper, match.index + match[0].length - 1).value;
  if (match[1] === "section" || match[1] === "subsection") currentNumber = argument.match(/^([\dA-Z]+(?:\.\d+)*)\.?\s/u)?.[1];
  if (match[1] === "resultnumber" || match[1] === "tag") currentNumber = argument;
  if (match[1] === "caption") currentNumber = String(++figureNumber);
  if (match[1] === "label") labelNumbers.set(argument, currentNumber);
}
const labelLocations = new Map();
for (const [file, source] of sources) for (const match of source.matchAll(/\\label\{([^}]+)\}/gu)) {
  labelLocations.set(match[1], { file, line: source.slice(0, match.index).split("\n").length });
}
const internalLabels = new Set([...main.matchAll(/\\label\{([^}]+)\}/gu)].map((match) => match[1]));
const referenceUses = [];
function target(key) {
  assert.ok(aliases.has(key), `Unknown cross-reference label: ${key}`);
  let href;
  if (internalLabels.has(key)) href = `#${aliases.get(key)}`;
  else {
    const location = labelLocations.get(key);
    assert.ok(location, `No frozen source location for ${key}`);
    href = `${repositoryUrl}/blob/${commit}/paper/source/${location.file}#L${location.line}`;
  }
  referenceUses.push({ label: key, href, number: labelNumbers.get(key) });
  return href;
}

const mathematics = [];
const blocks = [];
function marker(content) { const index = blocks.push(content) - 1; return `\n\n@@DEPENDENCE-BLOCK-${index}@@\n\n`; }
function anchor(labels) {
  if (!labels.length) return "";
  const values = new Set(labels.map((key) => aliases.get(key)));
  assert.equal(values.size, 1, `Non-alias labels on a single block: ${labels.join(", ")}`);
  return `<a id="${[...values][0]}"></a>\n\n`;
}
function takeLabels(value) {
  return { labels: [...value.matchAll(/\\label\{([^}]+)\}/gu)].map((match) => match[1]), text: value.replace(/\\label\{[^}]+\}/gu, "") };
}
function mathToken(tex, display) {
  const { labels, text } = takeLabels(tex);
  const index = mathematics.push({ display, sourceTex: tex.trim(), tex: text.trim(), labels }) - 1;
  const token = `@@DEPENDENCE-MATH-${index}@@`;
  return display ? marker(`${anchor(labels)}$$\n${token}\n$$`) : token;
}
function protectMath(text) {
  return text.replace(/\\begin\{equation(\*?)\}([\s\S]*?)\\end\{equation\1\}|\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|(?<!\\)\$([^$\n]+?)(?<!\\)\$/gu,
    (_, star, equation, display, inline, dollar) => mathToken(equation ?? display ?? inline ?? dollar, equation !== undefined || display !== undefined));
}
function labelMarkers(text) {
  return text.replace(/(?:\\label\{[^}]+\}\s*)+/gu, (value) => anchor(takeLabels(value).labels));
}
function readAdjacentAnchor(text, start) {
  const match = text.slice(start).match(/^\s*(<a id="[^"]+"><\/a>)\s*/u);
  return match ? { value: `${match[1]}\n\n`, end: start + match[0].length } : { value: "", end: start };
}
const figureReceipts = [];
const sourceFigures = [...main.matchAll(/\\begin\{figure\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/gu)].map((match) => {
  const start = match[1].indexOf("\\caption{");
  assert.ok(start >= 0);
  return braced(match[1], start + "\\caption".length).value;
});
let emittedFigure = 0;
function protectFigures(text) {
  return text.replace(/\\begin\{figure\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/gu, (_, body) => {
    const image = body.match(/\\includegraphics(?:\[[^\]]*\])?\{figures\/([^}]+)\.pdf\}/u)?.[1];
    assert.ok(image, "Figure has no original image.");
    const captionStart = body.indexOf("\\caption{");
    assert.ok(captionStart >= 0, "Figure has no caption.");
    const caption = braced(body, captionStart + "\\caption".length).value;
    const labels = takeLabels(body).labels;
    const src = `/assets/research/dependence/${image}.png`;
    assert.ok(sourceReceipts.some(({ local }) => local === `figures/${image}.png`));
    const number = ++emittedFigure;
    figureReceipts.push({ number, src, labels, captionSource: sourceFigures[number - 1] });
    return marker(`${anchor(labels)}![Figure ${number}. ${inlineText(caption)}](${src})`);
  });
}
const roman = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii", "ix", "x"];
const theoremEnvironments = new Set(["theorem", "lemma", "proposition", "corollary", "definition", "remark"]);
const layoutCommands = new Set(["phantomsection", "leavevmode", "unskip", "nobreak", "hfill", "centering", "noindent", "smallskip"]);
const resultReceipts = [];
const headings = [];
let pendingResult;
const resultParts = [];
function inlineText(text) { return convert(text).trim().replace(/\s+/gu, " "); }
function urlText(text) { return text.replace(/\\([_%&#])/gu, "$1").replace(/\(/gu, "%28").replace(/\)/gu, "%29"); }
function convert(text) {
  let output = "";
  for (let index = 0; index < text.length;) {
    if (text[index] !== "\\") { output += text[index++]; continue; }
    const token = text.slice(index).match(/^\\([A-Za-z]+|.)/u);
    assert.ok(token, "Incomplete TeX command.");
    const command = token[1];
    index += token[0].length;
    const argument = () => { while (/\s/u.test(text[index] ?? "") && index < text.length) index += 1; const item = braced(text, index); index = item.end; return item.value; };
    if (["emph", "textit", "textbf", "textsc", "mbox", "textup", "textrm", "textnormal"].includes(command)) {
      const value = convert(argument());
      output += command === "textbf" ? `**${value}**` : ["emph", "textit"].includes(command) ? `*${value}*` : value;
    } else if (command === "href") {
      const href = urlText(argument()); output += `[${convert(argument())}](${href})`;
    } else if (command === "url") {
      const href = urlText(argument()); output += `[${href}](${href})`;
    } else if (command === "cite") {
      let note;
      if (text[index] === "[") { const option = braced(text, index, "[", "]"); note = inlineText(option.value); index = option.end; }
      output += `[${argument().split(",").map((key) => { const ref = bibliography.get(key.trim()); assert.ok(ref, `Unknown bibliography key ${key}`); return `[${ref.number}](#${ref.anchor})`; }).join(", ")}${note ? `, ${note}` : ""}]`;
    } else if (command === "ref" || command === "eqref") {
      const key = argument(); const number = labelNumbers.get(key); assert.ok(number, `Missing reference number: ${key}`);
      output += `[${command === "eqref" ? `(${number})` : number}](${target(key)})`;
    } else if (command === "hyperref") {
      const key = braced(text, index, "[", "]"); index = key.end;
      output += `[${convert(argument())}](${target(key.value)})`;
    } else if (["section", "subsection", "paragraph"].includes(command)) {
      const value = inlineText(argument()); const attached = readAdjacentAnchor(text, index); index = attached.end;
      if (command !== "paragraph") headings.push(value);
      output += `\n\n${attached.value}${command === "paragraph" ? `**${value}** ` : `${command === "section" ? "##" : "###"} ${value}\n\n`}`;
    } else if (command === "resultnumber") pendingResult = argument();
    else if (command === "begin") {
      const environment = argument();
      if (theoremEnvironments.has(environment) || environment === "proof") {
        let title;
        if (text[index] === "[") { const option = braced(text, index, "[", "]"); title = inlineText(option.value); index = option.end; }
        const attached = readAdjacentAnchor(text, index); index = attached.end;
        if (environment === "proof") output += `\n\n${attached.value}*${title ?? "Proof"}.* `;
        else {
          assert.ok(pendingResult, `Result without its explicit source number: ${environment}`);
          const label = `${environment[0].toUpperCase()}${environment.slice(1)} ${pendingResult}${title ? ` (${title})` : ""}.`;
          resultReceipts.push({ environment, number: pendingResult, title }); pendingResult = undefined;
          output += `\n\n${attached.value}**${label}** `;
        }
      } else if (environment === "resultparts") { resultParts.push(0); output += "\n\n"; }
      else throw new Error(`Unsupported TeX environment: ${environment}`);
    } else if (command === "end") {
      const environment = argument();
      if (environment === "proof") output += " ∎\n\n";
      else if (environment === "resultparts") { assert.ok(resultParts.length); resultParts.pop(); output += "\n\n"; }
      else if (theoremEnvironments.has(environment)) output += "\n\n";
      else throw new Error(`Unsupported TeX environment end: ${environment}`);
    } else if (command === "item") {
      assert.ok(resultParts.length, "Item outside numbered result parts.");
      const number = resultParts[resultParts.length - 1]++; assert.ok(roman[number]); output += `\n\n(${roman[number]}) `;
    } else if (command === "keepproofstart") argument();
    else if (command === "allowbreak") { while (/\s/u.test(text[index] ?? "") && index < text.length) index += 1; }
    else if (layoutCommands.has(command)) continue;
    else if (command === "proofbox") output += "∎";
    else if (["%", "&", "_", "#", "{", "}"].includes(command)) output += command;
    else if (command === " ") output += " ";
    else if (["'", '"', "`", "^", "~", "c"].includes(command)) {
      const letter = text[index] === "{" ? argument() : text[index++];
      const accent = { "'": "\u0301", '"': "\u0308", "`": "\u0300", "^": "\u0302", "~": "\u0303", c: "\u0327" }[command];
      output += (letter + accent).normalize("NFC");
    } else throw new Error(`Unsupported prose command \\${command}: ${text.slice(Math.max(0, index - 30), index + 90)}`);
  }
  return output.replace(/~/gu, " ").replace(/---/gu, "—").replace(/--/gu, "–").replace(/``/gu, "“").replace(/''/gu, "”");
}

// Protect formulas before interpreting any prose markup or balanced arguments.
let prepared = protectMath(`${abstract}\n\n@@MAIN-START@@\n\n${main}`);
prepared = protectFigures(prepared);
prepared = labelMarkers(prepared);
let converted = convert(prepared).replace("@@MAIN-START@@", "");
assert.equal(resultParts.length, 0);
assert.equal(resultReceipts.length, 11);
assert.equal(emittedFigure, 4);
assert.equal(headings.length, 16);
converted = `## Abstract\n\n${converted.trim()}`;
const referenceParagraphs = [];
for (const [index, match] of [...references.matchAll(/\\bibitem\{([^}]+)\}([\s\S]*?)(?=\\bibitem\{|\\end\{thebibliography\})/gu)].entries()) {
  assert.equal(match[1], bibliographyKeys[index]);
  const value = inlineText(protectMath(match[2].trim()));
  referenceParagraphs.push(`<a id="ref-${match[1]}"></a>\n\n${index + 1}. ${value}`);
}
assert.equal(referenceParagraphs.length, bibliographyKeys.length);
converted += `\n\n## Appendices and supporting material\n\nThis page includes the complete abstract, five main sections, all four main-text figures, and references. Technical appendices and declarations are available in the [full manuscript](${sourceUrl}) and the [GitHub repository](${repositoryUrl}).\n\n## References\n\n${referenceParagraphs.join("\n\n")}\n`;
converted = converted.replace(/@@DEPENDENCE-BLOCK-(\d+)@@/gu, (_, index) => blocks[Number(index)]);
const mathUses = mathematics.map(() => 0);
converted = converted.replace(/@@DEPENDENCE-MATH-(\d+)@@/gu, (_, rawIndex) => {
  const index = Number(rawIndex); mathUses[index] += 1;
  return mathematics[index].display ? mathematics[index].tex : `$\`${mathematics[index].tex}\`$`;
});
assert.ok(mathUses.every((count) => count === 1), "Every original formula must survive exactly once.");
assert.doesNotMatch(converted, /@@DEPENDENCE|@@MAIN-START/gu);
// Join TeX's soft lines only after display mathematics have been protected.
const restoredMath = [];
let normalized = converted.replace(/\$\$[\s\S]*?\$\$|\$`[\s\S]*?`\$/gu, (value) => `@@FINAL-MATH-${restoredMath.push(value) - 1}@@`);
normalized = normalized.split(/\n\s*\n/gu).map((paragraph) => paragraph.replace(/\s*\n\s*/gu, " ").trim()).filter(Boolean).join("\n\n") + "\n";
assert.doesNotMatch(normalized, /\\[A-Za-z]|\\[()[\]]/u, "Unconverted TeX must not reach visible prose.");
normalized = normalized.replace(/@@FINAL-MATH-(\d+)@@/gu, (_, index) => restoredMath[Number(index)]);
const emittedAnchors = new Set([...normalized.matchAll(/<a id="([^"]+)"><\/a>/gu)].map((match) => match[1]));
for (const { href } of referenceUses) if (href.startsWith("#")) assert.ok(emittedAnchors.has(href.slice(1)), `Internal reference has no target: ${href}`);
assert.equal(emittedAnchors.size, [...normalized.matchAll(/<a id="([^"]+)"><\/a>/gu)].length, "Duplicate emitted anchors.");
const content = {
  slug: "critical-dependence-stress-for-portfolio-diversification",
  title: "Critical Dependence Stress for Portfolio Diversification",
  sourceTitle,
  description: "Critical dependence stress for diversification gains under fixed marginals, with variational limits, marginal-restoration premiums, and projected flow duality.",
  introduction: [], sourceUrl, repositoryUrl, sourceEditedAt: manifest.commitDate, sourceCommit: commit, sourceBlob: paperBlob,
  coverage: { mainFiles: mainFiles.length, mainSections: 5, mainSubsections: 11, figures: 4, references: bibliographyKeys.length, omitted: "Technical appendices and declarations only; all abstract and main-text words, mathematical formulas, numbered results, four figures, and references are retained." },
  markdown: normalized,
};
await writeOrCheck(outputUrl, JSON.stringify(content, null, 2) + "\n");
await writeOrCheck(new URL("provenance.json", sourceDirectory), JSON.stringify({
  repositoryUrl, sourceUrl, sourceTitle, sourceCommit: commit, sourceBlob: paperBlob, sourceEditedAt: manifest.commitDate,
  fetchedWith: "GitHub connector at the pinned commit; all frozen bytes verified against the connector Git-tree blob SHA-1 and size.",
  sourceFiles: sourceReceipts, includedFiles: ["paper.tex (abstract)", ...includedFiles, "references.tex"],
  includedHeadings: headings,
  results: resultReceipts.map((result) => ({ ...result, title: result.title?.replace(/@@DEPENDENCE-MATH-(\d+)@@/gu, (_, index) => `\\(${mathematics[Number(index)].sourceTex}\\)`) })),
  figures: figureReceipts, references: bibliographyKeys, crossReferences: referenceUses,
  mathematics, importedMarkdownSha256: createHash("sha256").update(normalized).digest("hex"),
  transformations: [
    "Seven main TeX input files contain five numbered sections and eleven subsections; recursively included main-text proofs are retained.",
    "TeX line wrapping, layout commands, font styling, and text accents are converted to equivalent web markup.",
    "Every inline/display mathematical body is preserved, apart from moving TeX label commands to HTML anchors; explicit equation tags are retained.",
    "Original theorem numbers, proof endings, result-part numbering, bibliography order, citation targets, and complete figure captions are retained.",
    "Aliases on one original target share one web anchor; references to omitted appendices point to their exact pinned TeX source line.",
    "The four original PNG siblings of the PDF figures are referenced at local asset paths, with their original Git blob identities recorded.",
    "The public page title differs from the original paper title, which is recorded separately as sourceTitle.",
  ],
}, null, 2) + "\n");
console.log(`${checkOnly ? "Verified" : "Imported"} ${headings.length} main headings, ${resultReceipts.length} numbered results, ${mathematics.length} formulas, ${emittedFigure} figures and ${bibliographyKeys.length} references.`);
