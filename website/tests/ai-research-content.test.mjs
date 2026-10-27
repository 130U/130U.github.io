import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const AI_ROUTE = "/past-experience/artificial-intelligence/";
const SOURCE_FILE = "content/sources/ai-portfolio/ai-research-and-engineering.md";
const CANONICAL_DOCUMENT = path.join(ROOT, SOURCE_FILE);
const SOURCE_SHA256 = "bc688374f1ca56e7c5eafbd06a7f33e6d7d752f4c8d0dd98b05f30164921405d";
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

async function canonicalPortfolio() {
  const document = (await readFile(CANONICAL_DOCUMENT, "utf8")).replace(/\r\n?/gu, "\n");
  assert.equal(createHash("sha256").update(document).digest("hex"), SOURCE_SHA256, "The canonical manuscript must match its approved content hash after LF normalization");
  const parts = document.split(/^# Project (\d{2}): ([a-z0-9-]+)$/gmu);
  assert.equal(parts.length, 13, "The canonical portfolio must contain exactly four projects");
  const projects = PROJECTS.map(({ slug }, index) => {
    assert.equal(Number(parts[index * 3 + 1]), index + 1);
    assert.equal(parts[index * 3 + 2], slug);
    return parts[index * 3 + 3];
  });
  return {
    projects,
    sourceDocument: { fileName: path.basename(SOURCE_FILE), path: SOURCE_FILE, sha256: SOURCE_SHA256 },
    updated: parts[0].match(/\*\*Updated\*\*\n(\d{4}-\d{2}-\d{2})/u)?.[1],
    disclosure: {
      title: "Confidentiality & Disclosure Note",
      text: parts[0].split("## Confidentiality & Disclosure Note\n")[1].trim(),
    },
  };
}

function canonicalEntry(project, index) {
  const field = (label) => {
    const value = project.match(new RegExp(`\\*\\*${label}\\*\\*\\n([^\\n]+)`, "u"))?.[1];
    assert.ok(value, `Missing canonical field ${label}`);
    return value;
  };
  const contributions = project.split("## Key Contributions\n")[1].split("\n## Architectural Context:")[0];
  const parents = contributions.split(/^\* /gmu).slice(1);
  const details = Object.fromEntries(parents.flatMap((parent, i) => {
    const lines = [...parent.matchAll(/^ {2}(\*|\d+\.) (.+)$/gmu)];
    return lines.length ? [[i, { ordered: lines[0][1] !== "*", items: lines.map((line) => line[2]) }]] : [];
  }));
  const entry = {
    id: index + 1,
    categoryId: "01",
    organization: field("Organization"),
    summary: project.split("## Summary\n")[1].split("\n## Confidentiality & Scope Disclosure")[0].trim(),
    readMoreLabel: field("Read More Label"),
    detailTitle: field("Title"),
    metadata: { position: field("Position"), location: field("Location"), dates: field("Dates") },
    contributionsLabel: "Key Contributions",
    keyContributions: parents.map((parent) => parent.split("\n")[0]),
    notes: [],
    disclosure: { title: "Confidentiality & Scope Disclosure", text: project.split("## Confidentiality & Scope Disclosure\n")[1].split("\n## Key Contributions")[0].trim() },
    architecturalContext: {
      title: project.match(/^## (Architectural Context:[^\n]+)$/mu)?.[1],
      text: project.match(/^## Architectural Context:[^\n]+\n([\s\S]+?)\n## Manuscript/mu)?.[1].trim(),
    },
  };
  if (Object.keys(details).length) entry.keyContributionDetails = details;
  return { entry, articleTitle: field("Article Title"), url: field("URL") };
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
  test(`AI project preserves the canonical manuscript and complete mathematical rendering: ${expected.slug}`, async () => {
    const { projects, sourceDocument, updated, disclosure } = await canonicalPortfolio();
    const index = PROJECTS.indexOf(expected);
    const project = projects[index];
    const bodyParts = project.split("\n## Manuscript\n");
    assert.equal(bodyParts.length, 2);
    const canonicalBody = bodyParts[1].trim();
    const canonical = canonicalEntry(project, index);
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${expected.slug}.json`), "utf8"));
    const showcaseFile = JSON.parse(await readFile(path.join(ROOT, "content", "experience-showcase.json"), "utf8"));
    const showcase = showcaseFile.entries.find(({ id }) => id === index + 1);
    const html = await readFile(path.join(ROOT, "out", ...AI_ROUTE.split("/").filter(Boolean), expected.slug, "index.html"), "utf8");
    assert.deepEqual(showcaseFile.aiSourceDocument, sourceDocument, "The generated directory must record the current canonical source");
    assert.deepEqual(showcaseFile.categories.find(({ id }) => id === "01").disclosure, disclosure);
    assert.deepEqual(showcase, canonical.entry, "Every generated entry field, including nested details, must match the canonical manuscript");
    assert.deepEqual(source, {
      slug: expected.slug,
      title: canonical.articleTitle,
      sourceUrl: `https://github.com/130U/130U.github.io/blob/main/website/${SOURCE_FILE}`,
      sourceEditedAt: updated,
      markdown: canonicalBody,
      sourceDocument,
    }, "Every generated article field and its exact manuscript must match the canonical source");
    assert.equal(source.title, expected.title);
    assert.equal(canonical.url, `https://www.theodoreoy.com${AI_ROUTE}${expected.slug}/`);
    assert.deepEqual(formulas(source.markdown), formulas(canonicalBody), "Every mathematical expression must retain its exact TeX and order");
    const canonicalDetails = canonical.entry.keyContributionDetails ?? {};
    assert.equal(Object.values(canonicalDetails).reduce((count, detail) => count + detail.items.length, 0), [0, 4, 3, 0][index]);
    assert.equal(readableHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] ?? ""), `${showcase.organization}: ${showcase.detailTitle}`);
    assert.match(html, new RegExp(`href="/experience/#${expected.slug}"`, "u"));
    assert.match(html, /href="#key-contributions"/u);
    assert.doesNotMatch(html, /href="#overview"|id="overview"|id="article-title"/u);
    assert.ok(html.indexOf('id="key-contributions"') < html.indexOf(`data-research-block="${expected.bodyStart}"`));

    const detailLists = [...html.matchAll(/<([ou]l)\b[^>]*\bdata-contribution-details="(\d+)"[^>]*>([\s\S]*?)<\/\1>/giu)];
    assert.equal(detailLists.length, Object.keys(canonicalDetails).length, "Every nested source list must be rendered once");
    for (const list of detailLists) {
      const details = showcase.keyContributionDetails[list[2]];
      assert.ok(details, "Rendered details must have a canonical source parent");
      assert.equal(list[1], details.ordered ? "ol" : "ul");
      const children = [...list[3].matchAll(/<li\b[^>]*\bdata-contribution-detail="(\d+)"[^>]*>([\s\S]*?)<\/li>/giu)];
      assert.deepEqual(children.map((child) => Number(child[1])), details.items.map((_, child) => child));
      assert.deepEqual(children.map((child) => readableHtml(child[2])), details.items.map(readableMarkdown), "All seven nested details must retain their canonical text and order");
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
    assert.equal(sourceFormulas.filter(({ kind }) => kind === "inline").length, expected.inline, "The canonical inline formula count must remain exact");
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
