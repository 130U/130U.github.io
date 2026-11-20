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

type ResearchMathMarkup = Readonly<{
  svg: string;
  mathml: string;
  widthEm: number;
  heightEm: number;
  depthEm: number;
  /** The equation number of a numbered display, set beside its expression. */
  number?: string;
}>;

export const RESEARCH_MATH_GUTTER_EM = 0.375;
/** The leading of the manuscripts that carry mathematics and the size of displayed
 * mathematics against their text, as `--manuscript-leading` and `--type-math` set them. */
export const RESEARCH_MANUSCRIPT_LEADING = 1.75;
export const RESEARCH_DISPLAY_MATH_SCALE = 1.15;
/** LaTeX's \jot, the space aligned equations add to the line between their rows. */
const JOT_EM = 0.3;
/** One line of displayed mathematics, in ems of its size: one line of the manuscript
 * and a jot, the pitch LaTeX gives the rows of aligned equations. Every multi-row
 * display takes it; MathJax adds row spacing to rows of a 1em strut. */
export const RESEARCH_MATH_LINE_EM = Number((RESEARCH_MANUSCRIPT_LEADING / RESEARCH_DISPLAY_MATH_SCALE + JOT_EM).toFixed(4));
export const RESEARCH_MATH_ROW_SPACING_EM = Number((RESEARCH_MATH_LINE_EM - 1).toFixed(4));

// The row spacing MathJax gives each multi-row environment, in ems (10pt to the
// em). A display row break \\[dim] adds its dimension to this spacing.
const environmentRowSpacingEm = new Map([
  ["aligned", 0.3], ["gathered", 0.3], ["cases", 0.2], ["array", 0.4],
  ["matrix", 0.4], ["pmatrix", 0.4], ["bmatrix", 0.4], ["Bmatrix", 0.4], ["vmatrix", 0.4], ["Vmatrix", 0.4],
]);
const ENVIRONMENT = /^(?:\\begin\s*)?\{([A-Za-z]+)\}/u;

function lengthInEm(value: string) {
  const match = /^(-?(?:\d+\.?\d*|\.\d+))(em|pt)$/u.exec(value);
  if (!match) return undefined;
  return Number(match[1]) / (match[2] === "pt" ? 10 : 1);
}

const EQUATION_NUMBER = /\\tag\{([^{}]+)\}\s*$/u;

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
export function normalizeResearchDisplayTex(tex: string) {
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
    throw new Error(`Research equation could not be rendered: ${error.message}`);
  },
});
// Every multi-row environment in a display (aligned, gathered, cases, arrays and
// matrices, nested or not) sets its rows one line of mathematics apart, plus any
// space its row breaks ask for. Subscript stacks keep their own spacing.
input.postFilters.add((value: unknown) => {
  const { math, data } = value as { math: MathItem<LiteElement, LiteText, LiteDocument>; data: ParseOptions };
  if (!math.display) return;
  for (const table of data.getList("mtable")) {
    const source = String(table.attributes.get("data-latex") || table.parent?.attributes?.get("data-latex") || "");
    const base = environmentRowSpacingEm.get(ENVIRONMENT.exec(source)?.[1] ?? "");
    const rowspacing = String(table.attributes.getExplicit("rowspacing") ?? "").trim();
    if (base === undefined || !rowspacing) continue;
    const spacing = rowspacing.split(/\s+/u).map(lengthInEm);
    if (spacing.some((entry) => entry === undefined)) throw new Error(`Research equation has an unreadable row spacing: ${rowspacing}.`);
    table.attributes.set("rowspacing", spacing.map((entry) => `${decimal(Math.max(0, RESEARCH_MATH_ROW_SPACING_EM + entry! - base))}em`).join(" "));
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
const cache = new Map<string, ResearchMathMarkup>();
const svgElements = new Set(["svg", "g", "path", "rect", "line", "polygon", "polyline", "text"]);

function lengthInEx(value: string, label: string) {
  const match = /^(-?\d+(?:\.\d+)?)ex$/u.exec(value);
  if (!match) throw new Error(`Research equation has an invalid ${label}.`);
  return Number(match[1]);
}

function dimension(value: number, label: string) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Research equation has a nonpositive ${label}.`);
  }
  return value;
}

function decimal(value: number) {
  return Number(value.toFixed(6)).toString();
}

function cleanSvg(node: LiteElement, root = true) {
  const kind = adaptor.kind(node);
  if (!svgElements.has(kind)) throw new Error(`Research equation produced an unsupported SVG element: ${kind}.`);
  for (const { name, value } of adaptor.allAttributes(node)) {
    if (name === "id" || name === "data-latex" || name === "data-latex-item") {
      adaptor.removeAttribute(node, name);
    } else if (/^(?:on|href$|xlink:href$|src$)/iu.test(name) || /(?:url\s*\(|javascript:)/iu.test(value)) {
      throw new Error("Research equation produced an external or executable resource.");
    }
  }
  if (kind === "text" && adaptor.textContent(node).trim()) {
    throw new Error("Research equation requires an unavailable SVG glyph.");
  }
  // The rules an array draws between its columns and rows, and around it, carry
  // the stroke MathJax's stylesheet would give them, so the drawing needs no stylesheet.
  if ((kind === "line" && adaptor.hasAttribute(node, "data-line")) || (kind === "rect" && adaptor.hasAttribute(node, "data-frame"))) {
    const style = String(adaptor.getAttribute(node, "class") ?? "");
    adaptor.setAttribute(node, "stroke-width", "70");
    adaptor.setAttribute(node, "fill", "none");
    if (style.includes("mjx-dashed")) adaptor.setAttribute(node, "stroke-dasharray", "140");
    if (style.includes("mjx-dotted")) {
      adaptor.setAttribute(node, "stroke-linecap", "round");
      adaptor.setAttribute(node, "stroke-dasharray", "0,140");
    }
  }
  // Only the root may paint past its canvas (accents and labels); the nested canvases MathJax uses
  // to clip the extender pieces of braces, arrows, bars and radicals keep their clipping.
  if (kind === "svg" && root) adaptor.setStyle(node, "overflow", "visible");
  for (const child of adaptor.childNodes(node)) {
    if (adaptor.kind(child) !== "#text" && adaptor.kind(child) !== "#comment") cleanSvg(child as LiteElement, false);
  }
}

function intrinsicSvg(container: LiteElement, display: boolean) {
  const children = adaptor.childNodes(container);
  if (children.length !== 1 || adaptor.kind(children[0]) !== "svg") {
    throw new Error("Research equation must produce a single SVG root.");
  }
  const root = children[0] as LiteElement;
  const heightEx = lengthInEx(adaptor.getAttribute(root, "height"), "height");
  const style = String(adaptor.getAttribute(root, "style") ?? "");
  const depthMatch = /vertical-align:\s*(-?\d+(?:\.\d+)?)ex/iu.exec(style);
  const depthEm = (depthMatch ? -Number(depthMatch[1]) * xHeight : 0) + RESEARCH_MATH_GUTTER_EM;
  const widthEx = lengthInEx(adaptor.getAttribute(root, "width"), "width");
  const widthEm = dimension(widthEx * xHeight + 2 * RESEARCH_MATH_GUTTER_EM, "width");
  const heightEm = dimension(heightEx * xHeight + 2 * RESEARCH_MATH_GUTTER_EM, "height");
  if (!Number.isFinite(depthEm)) throw new Error("Research equation has an invalid baseline.");
  cleanSvg(root);

  const viewBox = String(adaptor.getAttribute(root, "viewBox")).split(/\s+/u).map(Number);
  if (viewBox.length !== 4 || viewBox.some((value) => !Number.isFinite(value))) {
    throw new Error("Research equation has an invalid SVG canvas.");
  }
  const gutter = RESEARCH_MATH_GUTTER_EM * 1000;
  adaptor.setAttribute(root, "viewBox", [
    viewBox[0] - gutter,
    viewBox[1] - gutter,
    viewBox[2] + 2 * gutter,
    viewBox[3] + 2 * gutter,
  ].map(decimal).join(" "));
  adaptor.setAttribute(root, "width", `${decimal(widthEm)}em`);
  adaptor.setAttribute(root, "height", `${decimal(heightEm)}em`);
  // A display sits on its own baseline, where its equation number aligns; an
  // inline formula takes the same offset from the element that holds it.
  adaptor.setAttribute(root, "style", display ? `overflow:visible;vertical-align:${decimal(-depthEm)}em;` : "overflow:visible;");
  adaptor.setAttribute(root, "aria-hidden", "true");
  adaptor.setAttribute(root, "focusable", "false");
  adaptor.setAttribute(root, "data-research-svg", display ? "display" : "inline");
  // An extensible arrow (\xrightarrow) leaves an empty group without a TeX class; it draws nothing.
  const svg = adaptor.outerHTML(root).replace(/<g data-mml-node="TeXAtom" data-mjx-texclass="undefined"><\/g>/gu, "");
  return { svg, widthEm, heightEm, depthEm };
}

// Attributes that \mmlToken could carry into the page's markup; mathematics never needs them.
const markupAttributes = new Set(["href", "style", "class"]);

function assistiveMathml(tex: string, display: boolean) {
  const root = output.math.root;
  root.walkTree((node) => {
    if (node.kind === "merror") throw new Error("Research equation contains a MathML error.");
    if (node.attributes?.getExplicitNames().some((name) => markupAttributes.has(name))) {
      throw new Error("Research equation sets a markup attribute.");
    }
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
  root.attributes.set("data-research-math", display ? "display" : "inline");
  return visitor.visitTree(root);
}

export function renderResearchMath(tex: string, display = false): ResearchMathMarkup {
  if (!tex.trim()) throw new Error("Research equations cannot be empty.");
  const key = `${display ? "display" : "inline"}\u0000${tex}`;
  const cached = cache.get(key);
  if (cached) return cached;
  const convert = (source: string) => {
    input.reset();
    return document.convert(source, { display, em: EM, ex: EX, containerWidth: 80 * EM }) as LiteElement;
  };
  const visibleTex = display ? normalizeResearchDisplayTex(tex) : tex;
  const number = display ? EQUATION_NUMBER.exec(visibleTex) : null;
  let node = convert(visibleTex);
  // The assistive expression keeps the number with its equation; the drawing is
  // the expression alone, and the page sets the number beside it.
  const mathml = assistiveMathml(tex, display);
  if (number) node = convert(visibleTex.slice(0, number.index));
  const geometry = intrinsicSvg(node, display);
  const result = Object.freeze({ ...geometry, mathml, ...(number ? { number: number[1] } : {}) });
  cache.set(key, result);
  return result;
}
