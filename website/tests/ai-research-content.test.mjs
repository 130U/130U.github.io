import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const AI_ROUTE = "/past-experience/artificial-intelligence/";
const APPROVED_DOCUMENT = path.join(ROOT, "content", "sources", "ai-portfolio", "theodore_ouyang_ai_portfolio_optimized.md");
const APPROVED_REVISIONS = path.join(ROOT, "content", "sources", "ai-portfolio", "editorial-revisions.json");
const REVISIONS_SHA256 = "6171190332fee0deae11d95e60f3278f885bfac7cb75093ab3608a299e9cf3c5";
// Structure and benchmark-table shapes are checked independently of the renderer.
const PROJECTS = [
  {
    slug: "statistical-inference-and-resource-allocation-in-expert-data-production",
    title: "Statistical inference and resource allocation in expert data production",
    bodyStart: 0, display: 20, inline: 120, headings: 7, tables: [[4, 4, 4, 4, 4, 4]],
  },
  {
    slug: "task-validity-in-financial-synthetic-data",
    title: "Task validity in financial synthetic data",
    bodyStart: 0, display: 13, inline: 85, headings: 6, tables: [[3, 3, 3, 3], [3, 3, 3, 3, 3]],
  },
  {
    slug: "verification-and-supervision-in-scientific-reasoning-tasks",
    title: "Verification and supervision in scientific reasoning tasks",
    bodyStart: 0, display: 15, inline: 108, headings: 7, tables: [[4, 4, 4, 4]],
  },
  {
    slug: "evidence-uncertainty-and-decision-guarantees-in-investment-research",
    title: "Evidence uncertainty and decision guarantees in investment research",
    bodyStart: 0, display: 11, inline: 121, headings: 6, tables: [[3, 3, 3, 3]],
  },
];

function decodeHtml(value) {
  const entities = new Map([["amp", "&"], ["apos", "'"], ["gt", ">"], ["lt", "<"], ["nbsp", " "], ["quot", '"']]);
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return entities.get(entity.toLowerCase()) ?? match;
  });
}

function normalized(value) {
  return decodeHtml(value).replace(/\s+/gu, " ").trim();
}

function attr(tag, name) {
  return decodeHtml(tag.match(new RegExp(`\\b${name}="([^"]*)"`, "u"))?.[1] ?? "");
}

function formulas(markdown) {
  return [...markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$`([^`]*?)`\$|(?<!\\)\$([^$\r\n]+?)(?<!\\)\$/gu)].map((match) => ({
    kind: match[1] === undefined ? "inline" : "display",
    tex: match[1] ?? match[2] ?? match[3],
  }));
}

function readableMarkdown(markdown) {
  let mathIndex = 0;
  return normalized(markdown
    .replace(/\$\$[\s\S]*?\$\$|\$`[^`]*?`\$|(?<!\\)\$[^$\r\n]+?(?<!\\)\$/gu, () => ` MATH_${mathIndex++} `)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gu, "$1")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([\s\S]+?)\*\*|\*([^*]+)\*|`([^`]+)`/gu, (_, strong, emphasis, code) => strong ?? emphasis ?? code)
    .replace(/<[^>]+>/gu, " "));
}

function comparableManuscript(markdown) {
  return readableMarkdown(markdown
    .replace(/^## (?:[IVXLCDM]+\.|\d+\.?) /gmu, "## ")
    .replace(/^\|\s*:?-+[:\s|\-]*\|\s*$/gmu, "")
    .replace(/^\s*(?:\*|•) /gmu, "")
    .replace(/^\|(.+)\|$/gmu, (_, row) => row.replaceAll("|", " ")));
}

async function approvedPortfolio() {
  const raw = await readFile(APPROVED_DOCUMENT);
  const document = raw.toString("utf8").replace(/\r\n?/gu, "\n");
  assert.equal(createHash("sha256").update(document).digest("hex"), "211f94a29754ca89b196f5de9fec47a990b95d587c2b5c5d89acfeabb775d283", "The frozen copy must be the exact user-approved manuscript, allowing Git line-ending normalization");
  const projects = document.split(/^# SUBPAGE \d{2}: .+$/gmu).slice(1);
  assert.equal(projects.length, 4);
  return { document, projects };
}

async function approvedRevisions() {
  const text = (await readFile(APPROVED_REVISIONS, "utf8")).replace(/\r\n?/gu, "\n");
  assert.equal(createHash("sha256").update(text).digest("hex"), REVISIONS_SHA256, "The exact independently reviewed revision manifest must remain frozen");
  const manifest = JSON.parse(text);
  assert.equal(manifest.sourceSha256, "211f94a29754ca89b196f5de9fec47a990b95d587c2b5c5d89acfeabb775d283");
  assert.equal(manifest.revisions.length, 52);
  assert.equal(new Set(manifest.revisions.map(({ id }) => id)).size, 52);
  return manifest.revisions;
}

function restoreFrozenCopy(file, document, revisions) {
  const restored = structuredClone(document);
  for (const revision of revisions.filter((item) => item.file === file).toReversed()) {
    const keys = revision.jsonPointer.slice(1).split("/");
    let parent = restored;
    for (const key of keys.slice(0, -1)) {
      assert.ok(Object.hasOwn(parent, key), `Missing reviewed field for ${revision.id}`);
      parent = parent[key];
    }
    const key = keys.at(-1);
    assert.equal(typeof parent[key], "string");
    assert.equal(parent[key].split(revision.after).length - 1, 1, `The exact approved text for ${revision.id} must appear once`);
    parent[key] = parent[key].replace(revision.after, () => revision.before);
  }
  return restored;
}

function frozenContributionDetails(project) {
  const section = project.split("## Key Contributions\n")[1].split("\n## Architectural Context:")[0];
  const parents = section.split(/^\* /gmu).slice(1);
  return Object.fromEntries(parents.flatMap((parent, index) => {
    const lines = [...parent.matchAll(/^ {2}(\*|\d+\.) (.+)$/gmu)];
    return lines.length ? [[index, { ordered: lines[0][1] !== "*", items: lines.map((line) => line[2]) }]] : [];
  }));
}

function readableHtml(html) {
  let mathIndex = 0;
  return normalized(withoutSvg(html)
    .replace(/<span\b([^>]*\bdata-research-number\b[^>]*)>[\s\S]*?<\/span>/giu, (whole, attributes) => attr(attributes, "aria-hidden") === "true" ? "" : whole)
    .replace(/<math\b[\s\S]*?<\/math>/giu, () => ` MATH_${mathIndex++} `)
    .replace(/<(?:br|\/?(?:table|thead|tbody|tr|td|th))\b[^>]*>/giu, " ")
    .replace(/<[^>]+>/gu, ""));
}

function expectedNumberVisual({ kind, tex }) {
  if (kind !== "inline") return undefined;
  const compact = tex.replace(/\s+/gu, "");
  const suffix = compact.endsWith("\\%") ? "%" : "";
  const value = suffix ? compact.slice(0, -2) : compact;
  const numeric = /^[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)$/u;
  const scientific = value.match(/^(?:(.+)\\times)?10\^\{([+-]?\d+)\}$/u);
  const minus = (text) => text.replace(/^-/u, "−");
  if (scientific && (scientific[1] === undefined || numeric.test(scientific[1]))) {
    return { base: scientific[1] === undefined ? "10" : `${minus(scientific[1])} × 10`, exponent: minus(scientific[2]), suffix };
  }
  return numeric.test(value) ? { base: minus(value), suffix } : undefined;
}

function formulaContainers(html) {
  return [...html.matchAll(/<span\b[^>]*\bdata-research-formula="(?:inline|display)"[^>]*>/giu)].map((opening) => {
    const tags = /<\/?span\b[^>]*>/giu;
    tags.lastIndex = opening.index;
    let depth = 0;
    for (let tag = tags.exec(html); tag; tag = tags.exec(html)) {
      depth += tag[0].startsWith("</") ? -1 : 1;
      if (depth === 0) return html.slice(opening.index, tags.lastIndex);
    }
    assert.fail("Formula spans must be balanced");
  });
}

function svgRanges(html) {
  const ranges = [];
  let depth = 0;
  let start = 0;
  for (const tag of html.matchAll(/<\/?svg\b[^>]*>/giu)) {
    if (tag[0].startsWith("</")) {
      depth -= 1;
      assert.ok(depth >= 0, "SVG elements must have balanced closing tags");
      if (depth === 0) ranges.push([start, tag.index + tag[0].length]);
    } else if (!tag[0].endsWith("/>")) {
      if (depth === 0) start = tag.index;
      depth += 1;
    } else if (depth === 0) {
      ranges.push([tag.index, tag.index + tag[0].length]);
    }
  }
  assert.equal(depth, 0, "SVG elements must be complete");
  return ranges;
}

function withoutSvg(html) {
  for (const [from, to] of svgRanges(html).reverse()) html = html.slice(0, from) + " " + html.slice(to);
  return html;
}

function expectedBlocks(markdown) {
  const lines = markdown.split("\n");
  const blocks = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim()) continue;
    if (line === "$$" || line.startsWith("<table")) {
      const end = line === "$$" ? "$$" : "</table>";
      const content = [line];
      do {
        index += 1;
        assert.ok(index < lines.length, `Unterminated source block ${line}`);
        content.push(lines[index]);
      } while (lines[index] !== end);
      blocks.push({ type: line === "$$" ? "equation" : "table", source: content.join("\n") });
    } else {
      blocks.push({ type: /^#{2,6} /u.test(line) ? "heading" : "paragraph", source: line });
    }
  }
  return blocks;
}

function renderedBlocks(html) {
  return [...html.matchAll(/<([a-z][\w:-]*)\b[^>]*\bdata-research-block="(\d+)"[^>]*>/giu)].map((opening) => {
    const tag = opening[1];
    const tags = new RegExp(`<\\/?${tag}\\b[^>]*>`, "giu");
    tags.lastIndex = opening.index;
    let depth = 0;
    let end;
    for (let candidate = tags.exec(html); candidate; candidate = tags.exec(html)) {
      depth += candidate[0].startsWith("</") ? -1 : 1;
      if (depth === 0) {
        end = tags.lastIndex;
        break;
      }
    }
    assert.ok(end, `Incomplete AI block ${opening[2]}`);
    return {
      index: Number(opening[2]),
      tag,
      type: attr(opening[0], "data-research-block-type"),
      html: html.slice(opening.index, end),
    };
  });
}

function tableCells(html, source) {
  const cellTag = source ? "td" : "t[hd]";
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/giu)].map((row) =>
    [...row[1].matchAll(new RegExp(`<${cellTag}\\b[^>]*>([\\s\\S]*?)<\\/${cellTag}>`, "giu"))]
      .map((cell) => source ? readableMarkdown(cell[1]) : readableHtml(cell[1])),
  );
}

for (const expected of PROJECTS) {
  test(`AI project preserves the frozen manuscript, reviewed corrections, and complete mathematical rendering: ${expected.slug}`, async () => {
    const { document, projects } = await approvedPortfolio();
    const revisions = await approvedRevisions();
    const approvedProject = projects[PROJECTS.indexOf(expected)];
    let approvedBody = approvedProject.slice(approvedProject.indexOf("## I. ")).trim();
    if (PROJECTS.indexOf(expected) === 3) {
      // The preceding published article defines these two symbols; the revised
      // document uses them without definitions. Preserve that original math.
      approvedBody = approvedBody.replace("For smooth nonlinear models where", String.raw`Set $m_f=\Delta_f(0)$ and $a_f=\nabla\Delta_f(0)$.

For smooth nonlinear models where`);
    }
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${expected.slug}.json`), "utf8"));
    const showcaseFile = JSON.parse(await readFile(path.join(ROOT, "content", "experience-showcase.json"), "utf8"));
    const showcase = showcaseFile.entries.find(({ id }) => id === PROJECTS.indexOf(expected) + 1);
    const originalShowcase = restoreFrozenCopy("content/experience-showcase.json", showcaseFile, revisions).entries[PROJECTS.indexOf(expected)];
    const originalArticle = restoreFrozenCopy(`content/artificial-intelligence/${expected.slug}.json`, source, revisions);
    const html = await readFile(path.join(ROOT, "out", ...AI_ROUTE.split("/").filter(Boolean), expected.slug, "index.html"), "utf8");
    const briefs = [...document.slice(document.indexOf("# PART 1:"), document.indexOf("# PART 2 & PART 3:")).matchAll(/^### ([^\n]+)\n([^\n]+)\n\n\[Read More >\]/gmu)];
    const index = PROJECTS.indexOf(expected);
    assert.equal(showcase.organization, briefs[index][1]);
    assert.equal(originalShowcase.summary, briefs[index][2], "Reversing only the reviewed edits must recover the complete frozen brief");
    for (const field of ["Position", "Location", "Dates"]) {
      assert.equal(showcase.metadata[field.toLowerCase()], approvedProject.match(new RegExp(`\\*\\*${field}\\*\\*\\n([^\\n]+)`, "u"))?.[1]);
    }
    const approvedContributions = approvedProject.split("## Key Contributions\n")[1].split("\n## Architectural Context:")[0].split("\n").filter((line) => line.startsWith("* ")).map((line) => line.slice(2));
    assert.deepEqual(originalShowcase.keyContributions, approvedContributions, "Every frozen contribution must survive except the exact reviewed revisions");
    const approvedDetails = frozenContributionDetails(approvedProject);
    assert.deepEqual(originalShowcase.keyContributionDetails ?? {}, approvedDetails, "All original nested contributions must survive in order, except the exact reviewed revisions");
    assert.equal(Object.values(approvedDetails).reduce((count, detail) => count + detail.items.length, 0), [0, 4, 3, 0][index]);
    assert.equal(showcase.disclosure.title, "Confidentiality & Scope Disclosure");
    assert.equal(showcase.disclosure.text, approvedProject.match(/\*\*Confidentiality & Scope Disclosure\*\*\n([^\n]+)/u)?.[1]);
    assert.equal(originalShowcase.architecturalContext.title, approvedProject.match(/^## (Architectural Context:[^\n]+)$/mu)?.[1]);
    assert.equal(originalShowcase.architecturalContext.text, approvedProject.match(/^## Architectural Context:[^\n]+\n([\s\S]+?)\n## Contents/mu)?.[1].trim());
    assert.equal(source.slug, expected.slug);
    assert.equal(source.title, expected.title);
    assert.equal(comparableManuscript(originalArticle.markdown), comparableManuscript(approvedBody), "Reversing the reviewed edits must recover every original paragraph and table");
    assert.deepEqual(formulas(originalArticle.markdown).map(({ kind, tex }) => ({ kind, tex: tex.trim() })), formulas(approvedBody).map(({ kind, tex }) => ({ kind, tex: tex.trim() })), "Reversing the reviewed edits must recover every original TeX expression in order");
    assert.equal(readableHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] ?? ""), `${showcase.organization}: ${showcase.detailTitle}`);
    assert.match(html, new RegExp(`href="/experience/#${expected.slug}"`, "u"));
    assert.match(html, /href="#key-contributions"/u);
    assert.doesNotMatch(html, /href="#overview"|id="overview"|id="article-title"/u);
    assert.ok(html.indexOf('id="key-contributions"') < html.indexOf(`data-research-block="${expected.bodyStart}"`));

    const detailLists = [...html.matchAll(/<([ou]l)\b[^>]*\bdata-contribution-details="(\d+)"[^>]*>([\s\S]*?)<\/\1>/giu)];
    assert.equal(detailLists.length, Object.keys(approvedDetails).length, "Every nested source list must be rendered once");
    for (const list of detailLists) {
      const details = showcase.keyContributionDetails[list[2]];
      assert.ok(details, "Rendered details must have a reviewed source parent");
      assert.equal(list[1], details.ordered ? "ol" : "ul");
      const children = [...list[3].matchAll(/<li\b[^>]*\bdata-contribution-detail="(\d+)"[^>]*>([\s\S]*?)<\/li>/giu)];
      assert.deepEqual(children.map((child) => Number(child[1])), details.items.map((_, child) => child));
      assert.deepEqual(children.map((child) => readableHtml(child[2])), details.items.map(readableMarkdown), "All seven nested details must retain their reviewed text and order");
      for (const [childIndex, child] of children.entries()) {
        const annotations = [...child[2].matchAll(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/giu)].map((item) => decodeHtml(item[1]));
        assert.deepEqual(annotations, formulas(details.items[childIndex]).map(({ tex }) => tex), "Nested contribution TeX must remain exact");
      }
    }

    const sourceBlocks = expectedBlocks(source.markdown);
    assert.equal(sourceBlocks.findIndex((block) => block.type === "heading"), expected.bodyStart, "The imported body starts at its first complete numbered chapter.");
    const bodyBlocks = sourceBlocks.slice(expected.bodyStart);
    const actualBlocks = renderedBlocks(html);
    assert.equal(actualBlocks.length, bodyBlocks.length);
    for (let index = 0; index < bodyBlocks.length; index += 1) {
      const actual = actualBlocks[index];
      const original = bodyBlocks[index];
      assert.equal(actual.index, expected.bodyStart + index, "Every numbered-manuscript block must appear exactly once, in order, with its original source index");
      assert.equal(actual.type, original.type);
      const actualText = readableHtml(actual.html);
      const originalText = readableMarkdown(original.source);
      assert.equal(
        original.type === "heading" ? actualText.replace(/^[IVXLCDM]+\. /u, "") : actualText,
        original.type === "heading" ? originalText.replace(/^\d+\.? /u, "") : originalText,
        `${expected.slug} changed source block ${expected.bodyStart + index}`,
      );
      if (original.type === "heading") assert.equal(actual.tag, "h2");
    }

    const content = actualBlocks.map((block) => block.html).join("\n");
    assert.equal(actualBlocks.filter((block) => block.type === "heading").length, expected.headings);
    assert.doesNotMatch(content, /<h[2-6]\b[^>]*>\s*(?:Abstract|References)\s*<\/h[2-6]>/iu);
    const originalStrong = [...bodyBlocks.map((block) => block.source).join("\n").matchAll(/\*\*([^*]+)\*\*/gu)].map((match) => readableMarkdown(match[1]));
    const actualStrong = [...content.matchAll(/<strong\b[^>]*>([\s\S]*?)<\/strong>/giu)].map((match) => readableHtml(match[1]));
    assert.deepEqual(actualStrong, originalStrong);

    const originalTables = sourceBlocks.filter((block) => block.type === "table");
    const actualTables = actualBlocks.filter((block) => block.type === "table");
    assert.deepEqual(actualTables.map((block) => tableCells(block.html, false).map((row) => row.length)), expected.tables);
    for (let index = 0; index < originalTables.length; index += 1) {
      assert.deepEqual(tableCells(actualTables[index].html, false), tableCells(originalTables[index].source, true));
      assert.equal((actualTables[index].html.match(/<thead\b/giu) ?? []).length, 1, "Source header rows must remain semantic table headers");
    }

    const originalLinks = [...source.markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gu)].map((match) => [readableMarkdown(match[1]), match[2]]);
    const actualLinks = [...content.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/giu)].map((match) => [readableHtml(match[2]), attr(match[1], "href")]);
    assert.deepEqual(actualLinks, originalLinks, "Citation labels, targets, and order must remain exact");
    const retainedCitations = JSON.parse(await readFile(path.join(ROOT, "content", "sources", "ai-portfolio", "citation-links.json"), "utf8"))[expected.slug];
    for (const citation of retainedCitations) {
      assert.ok(actualLinks.some(([, href]) => href === citation.href), `The original reference must remain clickable: ${citation.text}`);
    }

    const sourceFormulas = formulas(source.markdown);
    const numericVisuals = sourceFormulas.map(expectedNumberVisual);
    const vectorIndices = sourceFormulas.flatMap((_, index) => numericVisuals[index] ? [] : [index]);
    const math = [...content.matchAll(/<math\b([^>]*)>([\s\S]*?)<\/math>/giu)];
    const svg = [...content.matchAll(/<svg\b([^>]*)>/giu)].filter((match) => attr(match[1], "data-research-svg"));
    const visualFormulas = svgRanges(content).map(([from, to]) => content.slice(from, to));
    const containers = formulaContainers(content);
    assert.equal(math.length, sourceFormulas.length);
    assert.equal(svg.length, vectorIndices.length, "Every nonnumeric or display expression must have one deterministic visual SVG");
    assert.equal(visualFormulas.length, vectorIndices.length, "Nested vector geometry must remain inside its own formula root");
    assert.equal(containers.length, math.length, "Every formula must have one visual and assistive container");
    assert.deepEqual(svg.map((match) => attr(match[1], "data-research-svg")), vectorIndices.map((index) => sourceFormulas[index].kind));
    assert.deepEqual(containers.map((container) => attr(container.match(/^<span\b[^>]*>/iu)[0], "data-research-formula")), sourceFormulas.map(({ kind }) => kind));
    for (const [index, container] of containers.entries()) {
      const number = numericVisuals[index];
      const numericSpans = [...container.matchAll(/<span\b([^>]*\bdata-research-number\b[^>]*)>([\s\S]*?)<\/span>/giu)];
      assert.equal((container.match(/<math\b/giu) ?? []).length, 1, "Every formula retains exactly one assistive MathML expression");
      assert.equal(numericSpans.length, number ? 1 : 0, "Only complete inline numeric literals may use the prose-number presentation");
      assert.equal((container.match(/data-research-svg=/gu) ?? []).length, number ? 0 : 1, "Numeric prose must not duplicate SVG; every other expression retains SVG");
      if (number) {
        const [, attributes, markup] = numericSpans[0];
        assert.equal(attr(attributes, "aria-hidden"), "true", "Visible numeric text must not duplicate accessible math");
        const expectedMarkup = `${number.base}${number.exponent === undefined ? "" : `<sup>${number.exponent}</sup>`}${number.suffix}`;
        assert.equal(decodeHtml(markup.replace(/<!--[\s\S]*?-->/gu, "")), expectedMarkup, "Numeric base, exponent, percent suffix, and semantic superscript must remain exact");
      }
    }
    for (const match of svg) assert.equal(attr(match[1], "aria-hidden"), "true", "SVG glyphs must not duplicate accessible math");
    for (let index = 0; index < visualFormulas.length; index += 1) {
      const visual = visualFormulas[index];
      assert.match(visual, /<path\b[^>]*\bd="[^"]+"/u, "Every exported formula needs complete embedded glyph paths");
      const fallbackText = [...visual.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/giu)]
        .map((match) => normalized(match[1].replace(/<[^>]+>/gu, ""))).filter(Boolean);
      assert.deepEqual(fallbackText, [], "Exported math must not fall back to browser text glyphs");
      for (const semantic of ["mfrac", "msqrt", "mover", "munder", "msup", "msubsup", "mtable", "mlabeledtr"]) {
        const visualCount = (visual.match(new RegExp(`data-mml-node="${semantic}"`, "gu")) ?? []).length;
        const semanticCount = (math[vectorIndices[index]][2].match(new RegExp(`<${semantic}\\b`, "giu")) ?? []).length;
        assert.equal(visualCount, semanticCount, `Exported formula ${index} must preserve its ${semantic} geometry`);
      }
    }
    assert.equal(math.filter((match) => attr(match[1], "data-research-math") === "display").length, expected.display);
    assert.equal(sourceFormulas.filter(({ kind }) => kind === "inline").length, expected.inline, "The independently reviewed inline formula count must remain exact");
    assert.equal(math.filter((match) => attr(match[1], "data-research-math") === "inline").length, sourceFormulas.filter(({ kind }) => kind === "inline").length);
    assert.deepEqual(math.map((match) => ({
      kind: attr(match[1], "data-research-math"),
      tex: decodeHtml(match[2].match(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/iu)?.[1] ?? ""),
    })), sourceFormulas, "Every formula must preserve its original TeX annotation and display mode");
    assert.doesNotMatch(content, /data-mjx-error|<merror\b|<foreignObject\b|\b(?:NaN|Infinity)\b|\$`|`\$/iu);
    assert.doesNotMatch(content, /<(?:use|image)\b[^>]*(?:href|xlink:href)="(?!#)/iu, "Formula glyphs must not depend on remote resources");
    const allIds = [...html.matchAll(/\bid="([^"]+)"/giu)].map((match) => decodeHtml(match[1]));
    assert.equal(new Set(allIds).size, allIds.length, "Formula output must not create duplicate page IDs");
  });
}
