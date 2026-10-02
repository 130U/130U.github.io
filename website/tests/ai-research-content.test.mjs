import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const AI_ROUTE = "/past-experience/artificial-intelligence/";
// These expectations come from the approved Notion documents, independently of the renderer.
const PROJECTS = [
  {
    slug: "statistical-inference-and-resource-allocation-in-expert-data-production",
    title: "Statistical inference and resource allocation in expert data production",
    markdownSha256: "d5337572ca5f67cab778e55f29e60f54cad14270ca346426046139c3d5d6fb58",
    display: 15, inline: 64, headings: 7, citations: 5, strong: 10, tables: [[4, 4, 4, 4, 4, 4]],
  },
  {
    slug: "task-validity-in-financial-synthetic-data",
    title: "Task validity in financial synthetic data",
    markdownSha256: "5dd231da44360e298f656048ea05e0c45e8c30dabc65f509c20a36d3edef3797",
    display: 9, inline: 52, headings: 6, citations: 9, strong: 7, tables: [[3, 3, 3, 3], [3, 3, 3, 3, 3]],
  },
  {
    slug: "verification-and-supervision-in-scientific-reasoning-tasks",
    title: "Verification and supervision in scientific reasoning tasks",
    markdownSha256: "e2e2ea3032919367a671e280a439d07500444bf1f0fa6937734986cdcc275a27",
    display: 9, inline: 49, headings: 7, citations: 6, strong: 3, tables: [[4, 4, 4, 4]],
  },
  {
    slug: "evidence-uncertainty-and-decision-guarantees-in-investment-research",
    title: "Evidence uncertainty and decision guarantees in investment research",
    markdownSha256: "7e615e1b16b049a9f86b8a403c88d33c677da895652e795421c3d76b760f07d1",
    display: 10, inline: 69, headings: 6, citations: 7, strong: 5, tables: [[3, 3, 3, 3]],
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
  return [...markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$`([\s\S]*?)`\$/gu)].map((match) => ({
    kind: match[1] === undefined ? "inline" : "display",
    tex: match[1] ?? match[2],
  }));
}

function readableMarkdown(markdown) {
  let mathIndex = 0;
  return normalized(markdown
    .replace(/\$\$[\s\S]*?\$\$|\$`[\s\S]*?`\$/gu, () => ` MATH_${mathIndex++} `)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gu, "$1")
    .replace(/^#{1,6}\s+/gmu, "")
    .replaceAll("**", "")
    .replace(/<[^>]+>/gu, " "));
}

function readableHtml(html) {
  let mathIndex = 0;
  return normalized(withoutSvg(html)
    .replace(/<math\b[\s\S]*?<\/math>/giu, () => ` MATH_${mathIndex++} `)
    .replace(/<(?:br|\/?(?:table|thead|tbody|tr|td|th))\b[^>]*>/giu, " ")
    .replace(/<[^>]+>/gu, ""));
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
  return [...html.matchAll(/<([a-z][\w:-]*)\b[^>]*\bdata-ai-block="(\d+)"[^>]*>/giu)].map((opening) => {
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
      type: attr(opening[0], "data-ai-block-type"),
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
  test(`AI project preserves the complete source: ${expected.slug}`, async () => {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${expected.slug}.json`), "utf8"));
    const html = await readFile(path.join(ROOT, "out", ...AI_ROUTE.split("/").filter(Boolean), expected.slug, "index.html"), "utf8");
    assert.equal(source.slug, expected.slug);
    assert.equal(source.title, expected.title);
    assert.equal(createHash("sha256").update(source.markdown, "utf8").digest("hex"), expected.markdownSha256);
    assert.equal(readableHtml(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/iu)?.[1] ?? ""), expected.title);
    assert.match(html, new RegExp(`href="${AI_ROUTE}#${expected.slug}"`, "u"));

    const sourceBlocks = expectedBlocks(source.markdown);
    const actualBlocks = renderedBlocks(html);
    assert.equal(actualBlocks.length, sourceBlocks.length);
    for (let index = 0; index < sourceBlocks.length; index += 1) {
      const actual = actualBlocks[index];
      const original = sourceBlocks[index];
      assert.equal(actual.index, index, "Source blocks must appear exactly once and in order");
      assert.equal(actual.type, original.type);
      assert.equal(readableHtml(actual.html), readableMarkdown(original.source), `${expected.slug} changed source block ${index}`);
      if (original.type === "heading") assert.equal(actual.tag, "h2");
    }

    const content = actualBlocks.map((block) => block.html).join("\n");
    assert.equal(actualBlocks.filter((block) => block.type === "heading").length, expected.headings);
    assert.doesNotMatch(content, /<h[2-6]\b[^>]*>\s*(?:Abstract|References)\s*<\/h[2-6]>/iu);
    assert.equal((content.match(/<strong\b/giu) ?? []).length, expected.strong);
    const originalStrong = [...source.markdown.matchAll(/\*\*([^*]+)\*\*/gu)].map((match) => readableMarkdown(match[1]));
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
    assert.equal(actualLinks.length, expected.citations);
    assert.deepEqual(actualLinks, originalLinks, "Citation labels, targets, and order must remain exact");

    const sourceFormulas = formulas(source.markdown);
    const math = [...content.matchAll(/<math\b([^>]*)>([\s\S]*?)<\/math>/giu)];
    const svg = [...content.matchAll(/<svg\b([^>]*)>/giu)].filter((match) => attr(match[1], "data-ai-svg"));
    const visualFormulas = svgRanges(content).map(([from, to]) => content.slice(from, to));
    const containers = [...content.matchAll(/<span\b([^>]*)>/giu)].filter((match) => attr(match[1], "data-ai-formula"));
    assert.equal(math.length, expected.display + expected.inline);
    assert.equal(svg.length, math.length, "Every source formula must have one deterministic visual SVG");
    assert.equal(visualFormulas.length, math.length, "Nested vector geometry must remain inside its own formula root");
    assert.equal(containers.length, math.length, "Every formula must have one visual and assistive container");
    assert.deepEqual(svg.map((match) => attr(match[1], "data-ai-svg")), sourceFormulas.map(({ kind }) => kind));
    assert.deepEqual(containers.map((match) => attr(match[1], "data-ai-formula")), sourceFormulas.map(({ kind }) => kind));
    for (const match of svg) assert.equal(attr(match[1], "aria-hidden"), "true", "SVG glyphs must not duplicate accessible math");
    for (let index = 0; index < visualFormulas.length; index += 1) {
      const visual = visualFormulas[index];
      assert.match(visual, /<path\b[^>]*\bd="[^"]+"/u, "Every exported formula needs complete embedded glyph paths");
      const fallbackText = [...visual.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/giu)]
        .map((match) => normalized(match[1].replace(/<[^>]+>/gu, ""))).filter(Boolean);
      assert.deepEqual(fallbackText, [], "Exported math must not fall back to browser text glyphs");
      for (const semantic of ["mfrac", "msqrt", "mover", "munder", "msup", "msubsup", "mtable", "mlabeledtr"]) {
        const visualCount = (visual.match(new RegExp(`data-mml-node="${semantic}"`, "gu")) ?? []).length;
        const semanticCount = (math[index][2].match(new RegExp(`<${semantic}\\b`, "giu")) ?? []).length;
        assert.equal(visualCount, semanticCount, `Exported formula ${index} must preserve its ${semantic} geometry`);
      }
    }
    assert.equal(math.filter((match) => attr(match[1], "data-ai-math") === "display").length, expected.display);
    assert.equal(math.filter((match) => attr(match[1], "data-ai-math") === "inline").length, expected.inline);
    assert.deepEqual(math.map((match) => ({
      kind: attr(match[1], "data-ai-math"),
      tex: decodeHtml(match[2].match(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/iu)?.[1] ?? ""),
    })), sourceFormulas, "Every formula must preserve its original TeX annotation and display mode");
    assert.doesNotMatch(content, /data-mjx-error|<merror\b|<foreignObject\b|\b(?:NaN|Infinity)\b|\$`|`\$/iu);
    assert.doesNotMatch(content, /<(?:use|image)\b[^>]*(?:href|xlink:href)="(?!#)/iu, "Formula glyphs must not depend on remote resources");
    const allIds = [...html.matchAll(/\bid="([^"]+)"/giu)].map((match) => decodeHtml(match[1]));
    assert.equal(new Set(allIds).size, allIds.length, "Formula output must not create duplicate page IDs");
  });
}
