import { mathjax } from "@mathjax/src/js/mathjax.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { SVG } from "@mathjax/src/js/output/svg.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import { SerializedMmlVisitor } from "@mathjax/src/js/core/MmlTree/SerializedMmlVisitor.js";
import { MathJaxTexFont } from "@mathjax/mathjax-tex-font/js/svg.js";
import type TexError from "@mathjax/src/js/input/tex/TexError.js";
import type { LiteElement } from "@mathjax/src/js/adaptors/lite/Element.js";
import type { LiteText } from "@mathjax/src/js/adaptors/lite/Text.js";
import type { LiteDocument } from "@mathjax/src/js/adaptors/lite/Document.js";
import type { TextNode } from "@mathjax/src/js/core/MmlTree/MmlNode.js";
import type ParseOptions from "@mathjax/src/js/input/tex/ParseOptions.js";
import type { MathItem } from "@mathjax/src/js/core/MathItem.js";
import "@mathjax/src/js/input/tex/base/BaseConfiguration.js";
import "@mathjax/src/js/input/tex/ams/AmsConfiguration.js";
import "@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js";
import "@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js";
import "@mathjax/src/js/input/tex/boldsymbol/BoldsymbolConfiguration.js";

export type AiResearchMathMarkup = Readonly<{
  svg: string;
  mathml: string;
  widthEm: number;
  heightEm: number;
  depthEm: number;
}>;

export const AI_MATH_GUTTER_EM = 0.375;
export const AI_MATH_ROW_SPACING_EM = 0.6;

const equationEnvironments = new Set(["aligned", "gathered"]);

function isDisplayRowEnd(suffix: string, environments: readonly string[]) {
  let remaining = suffix.trimStart();
  const open = [...environments];
  while (remaining.startsWith("\\end")) {
    const end = /^\\end\s*\{(aligned|gathered)\}/u.exec(remaining);
    if (!end || open.pop() !== end[1]) return false;
    remaining = remaining.slice(end[0].length).trimStart();
  }
  if (remaining.startsWith("\\\\")) return open.length > 0 && equationEnvironments.has(open.at(-1)!);
  if (open.length) return false;
  const tag = /^\\tag\*?\s*\{[^{}]*\}/u.exec(remaining);
  if (tag) remaining = remaining.slice(tag[0].length).trimStart();
  return remaining.length === 0;
}

/** Suppress sentence punctuation at display row termini while preserving mathematical tokens. */
export function normalizeAiResearchDisplayTex(tex: string) {
  const environments: string[] = [];
  const delimiters: string[] = [];
  let groupDepth = 0;
  let offset = 0;
  let normalized = "";
  const closeDelimiter = (opening: string) => {
    if (delimiters.at(-1) === opening) delimiters.pop();
  };
  for (let index = 0; index < tex.length; index += 1) {
    const character = tex[index];
    if (character === "\\") {
      const environment = /^\\(begin|end)\s*\{([A-Za-z*]+)\}/u.exec(tex.slice(index));
      if (environment) {
        if (environment[1] === "begin") environments.push(environment[2]);
        else if (environments.at(-1) === environment[2]) environments.pop();
        index += environment[0].length - 1;
        continue;
      }
      const command = /^\\(?:[A-Za-z]+|[\s\S])/u.exec(tex.slice(index));
      if (groupDepth === 0 && command) {
        if (["\\{", "\\lbrace"].includes(command[0])) delimiters.push("{");
        if (["\\}", "\\rbrace"].includes(command[0])) closeDelimiter("{");
        if (command[0] === "\\langle") delimiters.push("<");
        if (command[0] === "\\rangle") closeDelimiter("<");
        if (command[0] === "\\lparen") delimiters.push("(");
        if (command[0] === "\\rparen") closeDelimiter("(");
        if (command[0] === "\\lbrack") delimiters.push("[");
        if (command[0] === "\\rbrack") closeDelimiter("[");
      }
      if (command) index += command[0].length - 1;
      continue;
    }
    if (character === "{") groupDepth += 1;
    else if (character === "}") groupDepth = Math.max(0, groupDepth - 1);
    if (groupDepth > 0) continue;
    if (character === "(" || character === "[") delimiters.push(character);
    else if (character === ")") closeDelimiter("(");
    else if (character === "]") closeDelimiter("[");
    if (!/[,.]/u.test(character) || delimiters.length || environments.some((name) => !equationEnvironments.has(name))) continue;
    if (character === "." && (
      tex[index - 1] === "." || tex[index + 1] === "." ||
      /\\(?:left|right|middle|[bB]ig(?:g)?[lr]?)\s*$/u.test(tex.slice(0, index))
    )) continue;
    if (!isDisplayRowEnd(tex.slice(index + 1), environments)) continue;
    normalized += tex.slice(offset, index);
    offset = index + 1;
  }
  return normalized + tex.slice(offset);
}

const EM = 16;
const adaptor = liteAdaptor({ fontSize: EM });
RegisterHTMLHandler(adaptor);
const input = new TeX<LiteElement, LiteText, LiteDocument>({
  packages: ["base", "ams", "newcommand", "textmacros", "boldsymbol"],
  tags: "ams",
  formatError(_jax: TeX<LiteElement, LiteText, LiteDocument>, error: TexError) {
    throw new Error(`AI research equation could not be rendered: ${error.message}`);
  },
});
input.postFilters.add((value: unknown) => {
  const { math, data } = value as { math: MathItem<LiteElement, LiteText, LiteDocument>; data: ParseOptions };
  if (!math.display) return;
  for (const table of data.getList("mtable")) {
    const source = String(table.attributes.get("data-latex") ?? "");
    if (table.childNodes.length > 1 && /^(?:\{(?:aligned|gathered)\}|\\begin\{(?:aligned|gathered)\})/u.test(source)) {
      table.attributes.set("rowspacing", `${AI_MATH_ROW_SPACING_EM}em`);
    }
  }
});
const output = new SVG<LiteElement, LiteText, LiteDocument>({
  fontData: MathJaxTexFont,
  fontCache: "none",
  linebreaks: { inline: false },
  displayOverflow: "overflow",
});
const document = mathjax.document("", { InputJax: input, OutputJax: output });
const visitor = new SerializedMmlVisitor();
const xHeight = output.font.params.x_height;
const EX = xHeight * EM;
const cache = new Map<string, AiResearchMathMarkup>();
const svgElements = new Set(["svg", "g", "path", "rect", "line", "polygon", "polyline", "text"]);

function lengthInEx(value: string, label: string) {
  const match = /^(-?\d+(?:\.\d+)?)ex$/u.exec(value);
  if (!match) throw new Error(`AI research equation has an invalid ${label}.`);
  return Number(match[1]);
}

function dimension(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`AI research equation has a nonpositive ${label}.`);
  }
  return value;
}

function decimal(value: number) {
  return Number(value.toFixed(6)).toString();
}

function cleanSvg(node: LiteElement) {
  const kind = adaptor.kind(node);
  if (!svgElements.has(kind)) throw new Error(`AI research equation produced an unsupported SVG element: ${kind}.`);
  for (const { name, value } of adaptor.allAttributes(node)) {
    if (name === "id" || name === "data-latex" || name === "data-latex-item") {
      adaptor.removeAttribute(node, name);
    } else if (/^(?:on|href$|xlink:href$|src$)/iu.test(name) || /(?:url\s*\(|javascript:)/iu.test(value)) {
      throw new Error("AI research equation produced an external or executable resource.");
    }
  }
  if (kind === "text" && adaptor.textContent(node).trim()) {
    throw new Error("AI research equation requires an unavailable SVG glyph.");
  }
  if (kind === "svg") adaptor.setStyle(node, "overflow", "visible");
  for (const child of adaptor.childNodes(node)) {
    if (adaptor.kind(child) !== "#text" && adaptor.kind(child) !== "#comment") cleanSvg(child as LiteElement);
  }
}

function intrinsicSvg(container: LiteElement, display: boolean) {
  const children = adaptor.childNodes(container);
  if (children.length !== 1 || adaptor.kind(children[0]) !== "svg") {
    throw new Error("AI research equation must produce a single SVG root.");
  }
  const root = children[0] as LiteElement;
  const heightEx = lengthInEx(adaptor.getAttribute(root, "height"), "height");
  const style = String(adaptor.getAttribute(root, "style") ?? "");
  const depthMatch = /vertical-align:\s*(-?\d+(?:\.\d+)?)ex/iu.exec(style);
  const depthEm = (depthMatch ? -Number(depthMatch[1]) * xHeight : 0) + AI_MATH_GUTTER_EM;
  const numbered = adaptor.getAttribute(root, "width") === "100%";
  const widthEx = lengthInEx(
    numbered ? adaptor.getStyle(root, "min-width") : adaptor.getAttribute(root, "width"),
    "width",
  );
  const widthEm = dimension(widthEx * xHeight + 2 * AI_MATH_GUTTER_EM, "width");
  const heightEm = dimension(heightEx * xHeight + 2 * AI_MATH_GUTTER_EM, "height");
  if (!Number.isFinite(depthEm)) throw new Error("AI research equation has an invalid baseline.");
  cleanSvg(root);

  let svgRoot = root;
  if (numbered) {
    // A native SVG frame sets the numbered equation's responsive geometry at
    // its intrinsic width, then scales the entire layout with the math size.
    const widthPx = widthEx * EX;
    const heightPx = heightEx * EX;
    adaptor.setAttribute(root, "width", decimal(widthPx));
    adaptor.setAttribute(root, "height", decimal(heightPx));
    adaptor.setAttribute(root, "style", "overflow:visible;");
    svgRoot = adaptor.node("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      width: `${decimal(widthEm)}em`,
      height: `${decimal(heightEm)}em`,
      viewBox: `${decimal(-AI_MATH_GUTTER_EM * EM)} ${decimal(-AI_MATH_GUTTER_EM * EM)} ${decimal(widthPx + 2 * AI_MATH_GUTTER_EM * EM)} ${decimal(heightPx + 2 * AI_MATH_GUTTER_EM * EM)}`,
      style: "overflow:visible;",
    }, [root], "http://www.w3.org/2000/svg");
  } else {
    const viewBox = String(adaptor.getAttribute(root, "viewBox")).split(/\s+/u).map(Number);
    if (viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
      throw new Error("AI research equation has an invalid SVG canvas.");
    }
    const gutter = AI_MATH_GUTTER_EM * 1000;
    adaptor.setAttribute(root, "viewBox", [
      viewBox[0] - gutter,
      viewBox[1] - gutter,
      viewBox[2] + 2 * gutter,
      viewBox[3] + 2 * gutter,
    ].map(decimal).join(" "));
    adaptor.setAttribute(root, "width", `${decimal(widthEm)}em`);
    adaptor.setAttribute(root, "height", `${decimal(heightEm)}em`);
    adaptor.setAttribute(root, "style", "overflow:visible;");
  }
  adaptor.setAttribute(svgRoot, "aria-hidden", "true");
  adaptor.setAttribute(svgRoot, "focusable", "false");
  adaptor.setAttribute(svgRoot, "data-ai-svg", display ? "display" : "inline");
  return { svg: adaptor.outerHTML(svgRoot), widthEm, heightEm, depthEm };
}

function assistiveMathml(tex: string, display: boolean) {
  const root = output.math.root;
  root.walkTree((node) => {
    if (node.kind === "merror") throw new Error("AI research equation contains a MathML error.");
    node.attributes?.unset("data-latex");
    node.attributes?.unset("data-latex-item");
    node.attributes?.unset("id");
  });
  const factory = root.factory;
  const body = factory.create("mrow", {}, root.childNodes);
  const sourceText = factory.create("text") as TextNode;
  sourceText.setText(tex);
  const source = factory.create("annotation", { encoding: "application/x-tex" }, [sourceText]);
  root.setChildren([factory.create("semantics", {}, [body, source])]);
  root.attributes.set("data-ai-math", display ? "display" : "inline");
  return visitor.visitTree(root);
}

export function renderAiResearchMath(tex: string, display = false): AiResearchMathMarkup {
  if (!tex.trim()) throw new Error("AI research equations cannot be empty.");
  const key = `${display ? "display" : "inline"}\u0000${tex}`;
  const cached = cache.get(key);
  if (cached) return cached;
  input.reset();
  const visibleTex = display ? normalizeAiResearchDisplayTex(tex) : tex;
  const node = document.convert(visibleTex, { display, em: EM, ex: EX, containerWidth: 80 * EM }) as LiteElement;
  const geometry = intrinsicSvg(node, display);
  const mathml = assistiveMathml(tex, display);
  const result = Object.freeze({ ...geometry, mathml });
  cache.set(key, result);
  return result;
}
