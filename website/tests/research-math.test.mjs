import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { RESEARCH_MATH_GUTTER_EM, RESEARCH_MATH_ROW_SPACING_EM, normalizeResearchDisplayTex, renderResearchMath } from "../app/lib/content/research-math.ts";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const PROJECTS = [
  ["statistical-inference-and-resource-allocation-in-expert-data-production", 79],
  ["task-validity-in-financial-synthetic-data", 61],
  ["verification-and-supervision-in-scientific-reasoning-tasks", 58],
  ["evidence-uncertainty-and-decision-guarantees-in-investment-research", 79],
];

function decodeXml(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|quot);/giu, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return { amp: "&", apos: "'", gt: ">", lt: "<", quot: '"' }[entity] ?? match;
  });
}

function originalTex(mathml) {
  const annotation = mathml.match(/<annotation\b[^>]*encoding="application\/x-tex"[^>]*>([\s\S]*?)<\/annotation>/iu);
  assert.ok(annotation, "Accessible formulas must retain the original TeX annotation");
  return decodeXml(annotation[1]);
}

function tagCount(value, tag) {
  return (value.match(new RegExp(`<${tag}\\b`, "giu")) ?? []).length;
}

function visualText(svg) {
  return [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/giu)]
    .map((match) => decodeXml(match[1].replace(/<[^>]*>/gu, "")).trim())
    .filter(Boolean);
}

function glyphPaths(svg) {
  return [...svg.matchAll(/<path\b[^>]*>/gu)].map(([tag]) => ({
    code: tag.match(/data-c="([^"]+)"/u)?.[1],
    d: tag.match(/\bd="([^"]+)"/u)?.[1],
  }));
}

function assertCompleteFormula(rendered, tex) {
  assert.match(rendered.svg, /^<svg\b/iu);
  assert.match(rendered.mathml, /^<math\b/iu);
  assert.equal(originalTex(rendered.mathml), tex);
  assert.ok(tagCount(rendered.svg, "path") > 0, "Formula glyphs must have embedded vector paths");
  assert.deepEqual(visualText(rendered.svg), [], "Math glyphs must not use browser font fallback");
  assert.doesNotMatch(rendered.svg + rendered.mathml, /data-mjx-error|<merror\b|<foreignObject\b|\b(?:NaN|Infinity|undefined)\b/iu);
  assert.doesNotMatch(rendered.svg, /<(?:use|image)\b[^>]*(?:href|xlink:href)="(?!#)/iu);
  for (const name of ["widthEm", "heightEm", "depthEm"]) {
    assert.ok(Number.isFinite(rendered[name]) && rendered[name] >= 0, `${name} must be a finite positive layout measurement`);
  }
  assert.ok(rendered.widthEm > 0 && rendered.heightEm > 0);
  const ids = [...rendered.svg.matchAll(/\bid="([^"]+)"/giu)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "One formula must not contain colliding glyph IDs");
  for (const semantic of ["mfrac", "msqrt", "mover", "munder", "msup", "msubsup", "mtable", "mlabeledtr"]) {
    const visualCount = (rendered.svg.match(new RegExp(`data-mml-node="${semantic}"`, "gu")) ?? []).length;
    assert.equal(visualCount, tagCount(rendered.mathml, semantic), `${tex} must preserve every ${semantic} in its visible geometry`);
  }
}

test("all 277 approved formulas have complete vector glyphs and exact accessible TeX", async () => {
  let total = 0;
  const mathematicalPaths = [];
  for (const [slug, expected] of PROJECTS) {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${slug}.json`), "utf8"));
    const formulas = [...source.markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$\x60([\s\S]*?)\x60\$/gu)];
    assert.equal(formulas.length, expected, `${slug} must retain its approved formula count`);
    for (const formula of formulas) {
      const tex = formula[1] ?? formula[2];
      const rendered = await renderResearchMath(tex, formula[1] !== undefined);
      assertCompleteFormula(rendered, tex);
      mathematicalPaths.push(glyphPaths(rendered.svg).filter(({ code }) => code !== "2C" && code !== "2E"));
      assert.equal(tagCount(rendered.mathml, "mfrac"), (tex.match(/\\(?:t|d)?frac(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each fraction`);
      assert.equal(tagCount(rendered.mathml, "msqrt"), (tex.match(/\\sqrt(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each square root`);
      assert.equal(tagCount(rendered.mathml, "mover"), (tex.match(/\\(?:bar|overline|widehat|widetilde)(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each source accent`);
      assert.equal(tagCount(rendered.mathml, "mlabeledtr"), (tex.match(/\\tag(?![A-Za-z])/gu) ?? []).length, `${slug} must preserve each equation number`);
    }
    total += formulas.length;
  }
  assert.equal(total, 277);
  assert.equal(createHash("sha256").update(JSON.stringify(mathematicalPaths)).digest("hex"), "606c6b481d7db57321108982ef2d042eabd85dde46f2155be32dd3a0b5a3dda8", "All mathematical glyphs must retain the approved shapes and order");
});

test("display punctuation normalization changes only true sentence and equation-row termini", () => {
  const fixtures = [
    ["x=0.25.\n", "x=0.25\n"],
    ["x=.5,", "x=.5"],
    ["x=1...", "x=1..."],
    [String.raw`x=\ldots.`, String.raw`x=\ldots`],
    [String.raw`x=f(a,b),\qquad y=\{0,1\}.`, String.raw`x=f(a,b),\qquad y=\{0,1\}`],
    [String.raw`x=\text{a,b.}.`, String.raw`x=\text{a,b.}`],
    [String.raw`x=\operatorname{f,g}(a,b).`, String.raw`x=\operatorname{f,g}(a,b)`],
    [String.raw`x=\left.a\right.`, String.raw`x=\left.a\right.`],
    [String.raw`x=\frac{1}{2.}.`, String.raw`x=\frac{1}{2.}`],
    [String.raw`\begin{aligned}x&=f(a,b),\\y&=0.25.\end{aligned}\tag{4}`, String.raw`\begin{aligned}x&=f(a,b)\\y&=0.25\end{aligned}\tag{4}`],
    [String.raw`\begin{gathered}a,b\\c,d,\end{gathered}\tag{5}`, String.raw`\begin{gathered}a,b\\c,d\end{gathered}\tag{5}`],
    [String.raw`\begin{aligned}x&=f(a,\\b).\end{aligned}`, String.raw`\begin{aligned}x&=f(a,\\b)\end{aligned}`],
    [String.raw`\begin{aligned}x&=\lparen a,\\b\rparen.\end{aligned}`, String.raw`\begin{aligned}x&=\lparen a,\\b\rparen\end{aligned}`],
    [String.raw`\begin{aligned}x&=\lbrack a,\\b\rbrack.\end{aligned}`, String.raw`\begin{aligned}x&=\lbrack a,\\b\rbrack\end{aligned}`],
    [String.raw`\begin{cases}a,&x=0\\b,&x=1\end{cases}.`, String.raw`\begin{cases}a,&x=0\\b,&x=1\end{cases}`],
    [String.raw`\begin{matrix}a,&b\\c,&d\end{matrix}.`, String.raw`\begin{matrix}a,&b\\c,&d\end{matrix}`],
  ];
  for (const [source, expected] of fixtures) assert.equal(normalizeResearchDisplayTex(source), expected, source);
});

test("visible display math preserves internal punctuation, original annotations, and inline glyphs", () => {
  const tex = String.raw`x=f(a,b)+0.25.`;
  const display = renderResearchMath(tex, true);
  const inline = renderResearchMath(tex, false);
  assertCompleteFormula(display, tex);
  assertCompleteFormula(inline, tex);
  assert.equal(glyphPaths(display.svg).filter(({ code }) => code === "2C").length, 1);
  assert.equal(glyphPaths(display.svg).filter(({ code }) => code === "2E").length, 1);
  assert.equal(glyphPaths(inline.svg).filter(({ code }) => code === "2C").length, 1);
  assert.equal(glyphPaths(inline.svg).filter(({ code }) => code === "2E").length, 2);
  assert.match(display.mathml, /<mn>0\.25<\/mn>/u);
  assert.match(display.mathml, /<mo>,<\/mo>/u);
});

test("display aligned and gathered rows get reading space while cases and matrices retain their spacing", () => {
  assert.equal(RESEARCH_MATH_ROW_SPACING_EM, 0.6);
  for (const environment of ["aligned", "gathered"]) {
    const tex = `\\begin{${environment}}x=1\\\\y=2\\end{${environment}}`;
    assert.match(renderResearchMath(tex, true).mathml, /<mtable\b[^>]*rowspacing="0\.6em"/u);
    assert.match(renderResearchMath(tex, false).mathml, /<mtable\b[^>]*rowspacing="3pt"/u);
  }
  assert.match(renderResearchMath(String.raw`\begin{cases}x,&y=1\\z,&y=2\end{cases}`, true).mathml, /<mtable\b[^>]*rowspacing="\.2em"/u);
  assert.match(renderResearchMath(String.raw`\begin{matrix}a&b\\c&d\end{matrix}`, true).mathml, /<mtable\b[^>]*rowspacing="4pt"/u);
});

test("Greek symbols, accents, primes, and fractions retain distinct mathematical geometry", async () => {
  const fixtures = [
    [String.raw`\Delta`, "mi", /\u0394/u],
    [String.raw`\frac{x}{y}`, "mfrac"],
    [String.raw`\bar{x}`, "mover"],
    [String.raw`\overline{x}`, "mover"],
    [String.raw`\underline{x}`, "munder"],
    [String.raw`\widehat{x+y}`, "mover"],
    [String.raw`\widetilde{x+y}`, "mover"],
    [String.raw`x'`, "msup", /\u2032/u],
  ];
  for (const [tex, semantic, symbol] of fixtures) {
    const rendered = await renderResearchMath(tex, false);
    assertCompleteFormula(rendered, tex);
    assert.equal(tagCount(rendered.mathml, semantic), 1, `${tex} must retain its ${semantic} structure`);
    assert.match(rendered.svg, new RegExp(`data-mml-node="${semantic}"`, "u"), `${tex} must have matching visual geometry`);
    if (symbol) assert.match(decodeXml(rendered.mathml), symbol);
  }
  const delta = await renderResearchMath(String.raw`\Delta`, false);
  const latin = await renderResearchMath("D", false);
  assert.match(delta.svg, /data-c="394"/u);
  assert.doesNotMatch(delta.svg, /data-c="44"/u);
  assert.notEqual(delta.svg.match(/<path\b[^>]*\bd="([^"]+)"/u)?.[1], latin.svg.match(/<path\b[^>]*\bd="([^"]+)"/u)?.[1]);
});

test("aligned equations preserve rows, fractions, and all nine science equation numbers", async () => {
  const alignedTex = String.raw`\begin{aligned}x&=\frac{1}{2}\\y&=3\end{aligned}`;
  const aligned = await renderResearchMath(alignedTex, true);
  assertCompleteFormula(aligned, alignedTex);
  assert.equal(tagCount(aligned.mathml, "mtable"), 1);
  assert.equal(tagCount(aligned.mathml, "mtr"), 2);
  assert.equal(tagCount(aligned.mathml, "mfrac"), 1);
  assert.match(aligned.svg, /data-mml-node="mtable"/u);
  for (let number = 1; number <= 9; number += 1) {
    const tex = String.raw`x=\frac{1}{2}\tag{${number}}`;
    const rendered = await renderResearchMath(tex, true);
    assertCompleteFormula(rendered, tex);
    assert.equal(tagCount(rendered.mathml, "mlabeledtr"), 1, "Equation labels must be associated with their expression");
    const label = rendered.mathml.match(/<mlabeledtr\b[^>]*>\s*<mtd\b[^>]*>([\s\S]*?)<\/mtd>/iu)?.[1] ?? "";
    const labelText = [...label.matchAll(/<mtext\b[^>]*>([\s\S]*?)<\/mtext>/giu)].map((match) => decodeXml(match[1])).join("");
    assert.equal(labelText, `(${number})`, "Equation labels must retain the correct numeral and parentheses");
    assert.match(rendered.svg, /data-mml-node="mlabeledtr"/u);
  }
});

test("unsupported and malformed TeX fail explicitly instead of producing error artwork", async () => {
  for (const tex of [String.raw`\unknownCommand{x}`, String.raw`\frac{x}{`, String.raw`\href{javascript:alert(1)}{x}`]) {
    await assert.rejects(async () => renderResearchMath(tex, false), /.+/u);
  }
});

test("SVG canvases preserve natural glyph scale and baselines with room for accents and labels", async () => {
  assert.equal(RESEARCH_MATH_GUTTER_EM, 0.375);
  const fixtures = [
    {
      slug: "verification-and-supervision-in-scientific-reasoning-tasks", index: 32,
      widthEm: 24.125686, heightEm: 4.435912, depthEm: 1.967784,
      viewBox: [0, 0, 386.010976, 70.974592], numbered: true,
      pathCount: 69, pathGeometrySha256: "5f03e5829453d96262499c5dba0a2eebcd689eb68950d66340fbcef08ef612e8",
    },
    {
      slug: "evidence-uncertainty-and-decision-guarantees-in-investment-research", index: 26,
      widthEm: 28.503254, heightEm: 2.20116, depthEm: 1.168206,
      viewBox: [0, -1033, 28503.3, 2201.1], numbered: false,
      pathCount: 63, pathGeometrySha256: "4ba2daeeea8ad99a6d08749790eb5efd2cab9526b8fa0ad42c8a66d6bde95dcd",
    },
    {
      slug: "evidence-uncertainty-and-decision-guarantees-in-investment-research", index: 27,
      widthEm: 3.361852, heightEm: 1.07627, depthEm: 0.36023,
      viewBox: [0, -716, 3361.9, 1076.1], numbered: false,
      pathCount: 6, pathGeometrySha256: "8af038a117b5a0595e72f3f92338d7b7337e442ee08c26206f15020ecb559975",
    },
  ];
  const close = (actual, expected, message, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, message);
  for (const fixture of fixtures) {
    const source = JSON.parse(await readFile(path.join(ROOT, "content", "artificial-intelligence", `${fixture.slug}.json`), "utf8"));
    const formula = [...source.markdown.matchAll(/\$\$([\s\S]*?)\$\$|\$\x60([\s\S]*?)\x60\$/gu)][fixture.index];
    const rendered = await renderResearchMath(formula[1] ?? formula[2], formula[1] !== undefined);
    assertCompleteFormula(rendered, formula[1] ?? formula[2]);
    close(rendered.widthEm, fixture.widthEm + 0.75, "Canvas must leave 0.375em on each horizontal side");
    close(rendered.heightEm, fixture.heightEm + 0.75, "Canvas must leave 0.375em above and below the expression");
    close(rendered.depthEm, fixture.depthEm + 0.375, "The vertical alignment must compensate for the lower canvas gutter");
    close(rendered.heightEm - rendered.depthEm - 0.375, fixture.heightEm - fixture.depthEm, "The original expression must retain its distance above the text baseline");
    const root = rendered.svg.match(/^<svg\b[^>]*>/iu)?.[0] ?? "";
    const viewBox = (root.match(/\bviewBox="([^"]+)"/u)?.[1] ?? "").split(/\s+/u).map(Number);
    assert.equal(viewBox.length, 4);
    const gutter = fixture.numbered ? 6 : 375;
    assert.deepEqual(viewBox, [fixture.viewBox[0] - gutter, fixture.viewBox[1] - gutter, fixture.viewBox[2] + 2 * gutter, fixture.viewBox[3] + 2 * gutter]);
    close(rendered.widthEm / viewBox[2], fixture.widthEm / fixture.viewBox[2], "Canvas space must not rescale equation glyphs horizontally", 1e-7);
    close(rendered.heightEm / viewBox[3], fixture.heightEm / fixture.viewBox[3], "Canvas space must not rescale equation glyphs vertically", 1e-7);
    const paths = [...rendered.svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/gu)].map((match) => match[1]);
    assert.equal(paths.length, fixture.pathCount);
    assert.equal(createHash("sha256").update(JSON.stringify(paths)).digest("hex"), fixture.pathGeometrySha256, "Original mathematical glyph paths must remain exact");
    for (const svg of rendered.svg.matchAll(/<svg\b[^>]*>/giu)) assert.match(svg[0], /style="[^"]*overflow:\s*visible/iu, "Nested accent and equation canvases must expose their full ink");
    if (fixture.numbered) {
      const inner = rendered.svg.slice(root.length).match(/^<svg\b[^>]*>/iu)?.[0] ?? "";
      close(Number(inner.match(/\bwidth="([^"]+)"/u)?.[1]), fixture.viewBox[2], "Numbered equation width must retain its original native pixel coordinates");
      close(Number(inner.match(/\bheight="([^"]+)"/u)?.[1]), fixture.viewBox[3], "Numbered equation height must retain its original native pixel coordinates");
      assert.match(rendered.svg, /transform="scale\(0\.016,-0\.016\)/u);
    }
  }
});
