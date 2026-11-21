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

/** A column of a tabular display, aligned as the manuscript aligns it. */
export type ResearchDisplayTableColumn = Readonly<{ align: "l" | "c" | "r" }>;
export type ResearchDisplayTableRow = Readonly<{
  /** Each cell's TeX as the page draws it, or an empty string for an empty cell. */
  cells: readonly string[];
  /** The rule under the row: the firm rule under a header row, or a hairline between rows. */
  rule?: "header" | "row";
  /** Space a row break asks for beyond one line of mathematics (`\\[dim]`), in ems. */
  extraEm?: number;
}>;
export type ResearchDisplayTable = Readonly<{
  columns: readonly ResearchDisplayTableColumn[];
  rows: readonly ResearchDisplayTableRow[];
}>;
/** A cell of a table of mathematics: an expression drawn by the pipeline, or text set in the table's own face. */
export type ResearchTableCell =
  | Readonly<{ kind: "math"; svg: string; depthEm: number }>
  | Readonly<{ kind: "text"; text: string }>;
export type ResearchDisplayTableMarkup = Readonly<{
  /** How each column aligns in its frame: row labels left and a column of numbers right, as in every
   * research table; any other column as the manuscript aligns it. */
  columns: ReadonlyArray<Readonly<{ align: "l" | "c" | "r"; numeric: boolean }>>;
  /** Whether the first row heads the columns, and so stands as the table's header band. */
  header: boolean;
  rows: ReadonlyArray<ReadonlyArray<ResearchTableCell | null>>;
  /** The whole display's assistive expression and the original TeX, and its equation number. */
  mathml: string;
  number?: string;
}>;

type TableToken = { kind: "text"; text: string } | { kind: "cell" } | { kind: "row"; extraEm: number } | { kind: "hline" };

/** Splits an array body at its own cell and row breaks, leaving nested groups and environments whole. */
function tableTokens(body: string): TableToken[] {
  const tokens: TableToken[] = [];
  let text = "";
  let groups = 0;
  let environments = 0;
  const flush = () => {
    if (text) tokens.push({ kind: "text", text });
    text = "";
  };
  for (let index = 0; index < body.length; index += 1) {
    const character = body[index];
    const top = groups === 0 && environments === 0;
    if (character === "\\") {
      const rest = body.slice(index);
      if (top && rest.startsWith("\\\\")) {
        flush();
        let extraEm = 0;
        const space = /^\\\\\s*\[([^\]]*)\]/u.exec(rest);
        if (space) {
          const length = lengthInEm(space[1].trim());
          if (length === undefined) throw new Error(`A tabular display has an unreadable row break: ${space[0]}.`);
          extraEm = length;
        }
        tokens.push({ kind: "row", extraEm });
        index += (space?.[0].length ?? 2) - 1;
        continue;
      }
      const environment = /^\\(begin|end)\s*\{[A-Za-z*]+\}/u.exec(rest);
      if (environment) environments += environment[1] === "begin" ? 1 : -1;
      const command = environment?.[0] ?? /^\\(?:[A-Za-z]+|[\s\S])/u.exec(rest)?.[0] ?? "\\";
      if (top && /^\\(?:hline|cline|hdashline|toprule|midrule|bottomrule|cmidrule)$/u.test(command)) {
        if (command !== "\\hline") throw new Error(`A tabular display draws a rule the page does not set: ${command}.`);
        if (text.trim() || tokens.at(-1)?.kind === "cell") throw new Error("A tabular display draws \\hline inside a row.");
        text = "";
        tokens.push({ kind: "hline" });
      } else {
        text += command;
      }
      index += command.length - 1;
      continue;
    }
    if (character === "{") groups += 1;
    else if (character === "}") groups -= 1;
    if (top && character === "&") {
      flush();
      tokens.push({ kind: "cell" });
      continue;
    }
    text += character;
  }
  flush();
  return tokens;
}

/** The array that makes up a whole display, with the text that follows it. */
function wholeArray(tex: string) {
  const opening = /^\\begin\s*\{array\}\s*(?=\{)/u.exec(tex);
  if (!opening) return undefined;
  // The column specification is the balanced group after \begin{array}.
  let depth = 0;
  let close = opening[0].length;
  for (; close < tex.length; close += 1) {
    if (tex[close] === "\\") close += 1;
    else if (tex[close] === "{") depth += 1;
    else if (tex[close] === "}" && --depth === 0) break;
  }
  const begin = [tex.slice(0, close + 1), tex.slice(opening[0].length + 1, close)];
  let groups = 0;
  let environments = 1;
  for (let index = begin[0].length; index < tex.length; index += 1) {
    const character = tex[index];
    if (character === "\\") {
      const environment = /^\\(begin|end)\s*\{[A-Za-z*]+\}/u.exec(tex.slice(index));
      if (environment && groups === 0) {
        environments += environment[1] === "begin" ? 1 : -1;
        if (environments === 0) return { spec: begin[1], body: tex.slice(begin[0].length, index), after: tex.slice(index + environment[0].length) };
        index += environment[0].length - 1;
      } else {
        index += 1;
      }
      continue;
    }
    if (character === "{") groups += 1;
    else if (character === "}") groups -= 1;
  }
  throw new Error("A tabular display leaves its array open.");
}

/**
 * A display that is one array, and nothing else but its equation number, is a
 * table of mathematics: its cells keep their TeX, rows and columns, and the
 * page sets it as a research table. The row that heads the columns is the row
 * the manuscript rules off, or the first row of a table whose first column the
 * manuscript rules off (its first cell then heads the row labels); a rule the
 * manuscript draws between later rows is marked, though every row of a research
 * table parts on a hairline. The sentence's closing punctuation after the last
 * cell is not drawn, as on every display.
 */
export function parseResearchDisplayTable(tex: string): ResearchDisplayTable | undefined {
  const source = tex.trim().replace(EQUATION_NUMBER, "").trim();
  const array = wholeArray(source);
  if (!array || !/^[.,]?\s*$/u.test(array.after)) return undefined;
  const spec = array.spec.replace(/\s+/gu, "");
  if (!/^\|*(?:[lcr]\|*)+$/u.test(spec)) throw new Error(`A tabular display has a column specification the page does not set: {${array.spec}}.`);
  const aligns = [...spec.replace(/\|/gu, "")] as Array<"l" | "c" | "r">;
  const labelsRuled = /^\|*[lcr]\|+[lcr]/u.test(spec);
  const rows: Array<{ cells: string[]; extraEm: number; ruleAbove: boolean }> = [];
  let current = { cells: [""], extraEm: 0, ruleAbove: false };
  let pendingRule = false;
  for (const token of tableTokens(array.body)) {
    if (token.kind === "text") current.cells[current.cells.length - 1] += token.text;
    else if (token.kind === "cell") current.cells.push("");
    else if (token.kind === "hline") pendingRule = true;
    else {
      rows.push({ ...current, ruleAbove: current.ruleAbove || pendingRule });
      pendingRule = false;
      current = { cells: [""], extraEm: token.extraEm, ruleAbove: false };
    }
    if (token.kind === "text" && token.text.trim() && pendingRule) {
      current.ruleAbove = true;
      pendingRule = false;
    }
  }
  if (current.cells.length > 1 || current.cells[0].trim()) rows.push(current);
  if (!rows.length) return undefined;
  const cells = rows.map((row) => row.cells.map((cell) => cell.trim()));
  if (cells.some((row) => row.length > aligns.length)) throw new Error("A tabular display has more cells in a row than its columns.");
  // The sentence's punctuation after the last cell belongs to the prose, not the table.
  const last = cells.at(-1)!;
  last[last.length - 1] = normalizeResearchDisplayTex(last.at(-1)!).trim();
  const header = rows.length > 1 && (rows[1].ruleAbove || labelsRuled);
  return Object.freeze({
    columns: aligns.map((align) => Object.freeze({ align })),
    rows: cells.map((row, index) => {
      const rule = index === 0 && header ? "header" : index < rows.length - 1 && rows[index + 1].ruleAbove ? "row" : undefined;
      const extraEm = index > 0 ? rows[index].extraEm : 0;
      return Object.freeze({
        cells: [...row, ...Array<string>(aligns.length - row.length).fill("")],
        ...(rule ? { rule } : {}),
        ...(extraEm ? { extraEm } : {}),
      } as ResearchDisplayTableRow);
    }),
  });
}

/**
 * Groups the digits after a decimal point in threes, counted from the point and
 * parted by a thin space, when there are five or more, as the SI and ISO 80000
 * set them. Only the drawing
 * takes the spaces; the TeX that the assistive expression carries keeps the
 * manuscript's number.
 */
export function groupDecimalDigits(tex: string) {
  return tex.replace(/(?<![\d.])(\d*)\.(\d{5,})(?![\d.])/gu, (_, whole: string, fraction: string) => `${whole}.${fraction.match(/\d{1,3}/gu)!.join("\\,")}`);
}

// A cell that is text alone, which the table sets in its own face.
const TEXT_CELL = /^\\text\s*\{([^{}\\$]*)\}$/u;
// A cell that holds a number, a fraction, an interval or a bound on one, and nothing else:
// once its relations and spaces are set aside, only figures and their punctuation remain.
const NUMERIC_CELL = /^[-+]?[\d.,/()[\]+-]*\d[\d.,/()[\]+-]*$/u;
const RELATIONS_AND_SPACES = /\\(?:le|leq|ge|geq|lt|gt|approx|pm)(?![A-Za-z])|\\[,;:! ]|\s+/gu;

function numericTex(tex: string) {
  return NUMERIC_CELL.test(tex.replace(RELATIONS_AND_SPACES, ""));
}

const tableCache = new Map<string, ResearchDisplayTableMarkup | null>();

/**
 * The table of mathematics a display TeX makes. Each cell is typeset in text
 * style, as TeX sets an array's cells, with the digits after a decimal point
 * grouped; a cell that is text alone is set as text in the table's face, without
 * a closing colon, which in the sentence introduced the values the table's columns
 * now hold. Row labels align left and a column of numbers aligns right, as in
 * every research table; any other column keeps the manuscript's alignment.
 */
export function renderResearchDisplayTable(tex: string): ResearchDisplayTableMarkup | undefined {
  const cached = tableCache.get(tex);
  if (cached !== undefined) return cached ?? undefined;
  const table = parseResearchDisplayTable(tex);
  if (!table) {
    tableCache.set(tex, null);
    return undefined;
  }
  const whole = renderResearchMath(tex, true);
  const header = table.rows[0].rule === "header";
  const body = table.rows.slice(header ? 1 : 0);
  const rows = table.rows.map((row) => Object.freeze(row.cells.map((cell): ResearchTableCell | null => {
    if (!cell) return null;
    const text = TEXT_CELL.exec(cell);
    if (text) return Object.freeze({ kind: "text", text: text[1].trim().replace(/:$/u, "") });
    const markup = renderResearchMath(groupDecimalDigits(cell), false);
    return Object.freeze({ kind: "math", svg: markup.svg.replace(/data-research-svg="inline"/u, 'data-research-svg="cell"'), depthEm: markup.depthEm });
  })));
  const columns = table.columns.map(({ align }, column) => {
    const values = body.map((row) => row.cells[column]).filter(Boolean);
    const numeric = values.length > 0 && values.every(numericTex);
    return Object.freeze({ align: numeric ? "r" as const : column === 0 ? "l" as const : align, numeric });
  });
  const result = Object.freeze({
    columns,
    header,
    rows,
    mathml: whole.mathml,
    ...(whole.number ? { number: whole.number } : {}),
  });
  tableCache.set(tex, result);
  return result;
}

/** A row of a display set as rows: its TeX, the slice of the display's TeX from `start` to `end`;
 * the space a row break of the manuscript asks for above it beyond one line of mathematics; and,
 * for a constraint after the first, the connecting word and space it hangs under ("s.t." and its
 * quad), so the constraints of a problem start on one line. */
export type ResearchDisplayRow = Readonly<{ tex: string; start: number; end: number; extraEm?: number; hang?: string }>;
export type ResearchDisplayStackMarkup = Readonly<{
  /** Each row's drawing, from its own slice of the TeX, in display style, and the space above it
   * in ems of the math size: none above the first row; above a later one, one line of mathematics
   * less what the two drawings fill of their struts. */
  rows: ReadonlyArray<ResearchMathMarkup & Readonly<{ start: number; end: number; spaceEm: number }>>;
  /** The whole display's assistive expression and the original TeX, and its equation number. */
  mathml: string;
  number?: string;
}>;

type DisplayToken = Readonly<{ text: string; start: number; end: number; top: boolean }>;

/** The tokens of tex from `from` to `to`, each marked when it stands at the outer level: outside
 * every group, environment, \left…\right pair and bracket. Positions are offsets into tex. */
function displayTokens(tex: string, from = 0, to = tex.length): DisplayToken[] {
  const tokens: DisplayToken[] = [];
  let groups = 0;
  let environments = 0;
  let sized = 0;
  let brackets = 0;
  for (let index = from; index < to;) {
    const top = groups === 0 && environments === 0 && sized === 0 && brackets === 0;
    const outer = groups === 0 && environments === 0 && sized === 0;
    const rest = tex.slice(index, to);
    let text = rest[0];
    if (text === "\\") {
      const environment = /^\\(begin|end)\s*\{[A-Za-z*]+\}/u.exec(rest);
      text = environment?.[0] ?? /^\\(?:[A-Za-z]+|[\s\S])/u.exec(rest)?.[0] ?? "\\";
      if (environment) environments += environment[1] === "begin" ? 1 : -1;
      else if (text === "\\left" || text === "\\right") {
        // The delimiter after \left or \right belongs to it.
        text += /^\s*(?:\\(?:[A-Za-z]+|[\s\S])|\S)/u.exec(rest.slice(text.length))?.[0] ?? "";
        sized += text.startsWith("\\left") ? 1 : -1;
      } else if (outer && (text === "\\{" || text === "\\lbrace" || text === "\\langle")) brackets += 1;
      else if (outer && (text === "\\}" || text === "\\rbrace" || text === "\\rangle")) brackets = Math.max(0, brackets - 1);
    } else if (text === "{") groups += 1;
    else if (text === "}") groups -= 1;
    // A half-open interval closes on either bracket.
    else if (outer && (text === "(" || text === "[")) brackets += 1;
    else if (outer && (text === ")" || text === "]")) brackets = Math.max(0, brackets - 1);
    tokens.push({ text, start: index, end: index + text.length, top });
    index += text.length;
  }
  return tokens;
}

const RELATIONS = new Set([
  "=", "<", ">", "\\le", "\\leq", "\\ge", "\\geq", "\\lt", "\\gt", "\\leqslant", "\\geqslant", "\\ne", "\\neq", "\\ll", "\\gg",
  "\\in", "\\notin", "\\ni", "\\subset", "\\subseteq", "\\supset", "\\supseteq", "\\sim", "\\simeq", "\\approx", "\\cong",
  "\\equiv", "\\propto", "\\asymp", "\\prec", "\\preceq", "\\succ", "\\succeq", "\\vdash", "\\models", "\\perp", "\\mid",
  "\\to", "\\rightarrow", "\\longrightarrow", "\\Rightarrow", "\\Longrightarrow", "\\implies", "\\iff", "\\leftrightarrow",
  "\\Leftrightarrow", "\\Longleftrightarrow", "\\mapsto", "\\xrightarrow", "\\xleftarrow", "\\downarrow", "\\uparrow",
]);
const INEQUALITIES = new Set(["<", ">", "\\le", "\\leq", "\\ge", "\\geq", "\\lt", "\\gt", "\\leqslant", "\\geqslant"]);
const OPERATORS = new Set(["+", "-", "*", "/", "\\cdot", "\\times", "\\pm", "\\mp", "\\cup", "\\cap", "\\circ", "\\ast", "\\setminus", "\\oplus", "\\otimes"]);
const TEXT_COMMANDS = new Set(["\\text", "\\mbox", "\\hbox", "\\textrm", "\\textup", "\\textnormal"]);
/** The spaces of the manuscript a join between two formulas is made of; a quad or more, or a
 * control space, joins on its own, and thin spaces join as a run of two or more. */
const SPACE = /^\\(?:qquad|quad|enspace|[ ;:>,])$/u;
const WIDE_SPACE = /^\\(?:qquad|quad|enspace| )$/u;
/** The spaces that set off a connecting word on either side. */
const QUAD = /^\\(?:qquad|quad|enspace)$/u;
// A part that opens on one of these words qualifies the formula before it.
const QUALIFIER_WORD = /^(?:for|when|whenever|where|as|on|if|at|provided|unless|uniformly|almost)\b/iu;
const SUCH_THAT = /^(?:s\.t\.|subject to)$/iu;
const PUNCTUATION = new Set([",", ".", ";"]);

const GREEK = "alpha|beta|gamma|delta|epsilon|varepsilon|zeta|eta|theta|vartheta|iota|kappa|lambda|mu|nu|xi|pi|varpi|rho|varrho|sigma|varsigma|tau|upsilon|phi|varphi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Upsilon|Phi|Psi|Omega|ell";
const SYMBOL_BASE = `(?:[A-Za-z]|\\\\(?:${GREEK})(?![A-Za-z]))`;
const SYMBOL_ACCENT = `(?:\\\\(?:bar|hat|tilde|widehat|widetilde|overline|mathcal|mathbb|mathrm|mathbf|boldsymbol)\\s*(?:\\{\\s*${SYMBOL_BASE}\\s*\\}|${SYMBOL_BASE}))`;
const SYMBOL_SCRIPT = "(?:\\s*[_^]\\s*(?:\\{[^{}]*\\}|\\\\[A-Za-z]+|[A-Za-z0-9*]))";
/** A symbol: a letter, accented or not, with its primes, subscript and superscript. */
const SYMBOL = new RegExp(`^(?:${SYMBOL_ACCENT}|${SYMBOL_BASE})'*${SYMBOL_SCRIPT}{0,2}$`, "u");
/** A number, a fraction of numbers, or infinity. */
const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)$|^\\[td]?frac(?:\d|\{\d+\})(?:\d|\{\d+\})$|^-?\\infty$/u;
const isNumber = (term: string) => NUMBER.test(term.replace(/\s+/gu, ""));

const significant = (tokens: readonly DisplayToken[]) => tokens.filter((token) => token.text.trim());

const names = (source: string) => significant(displayTokens(source)).map((token) => token.text.replace(/\s+/gu, "")).filter((name) => name !== "{" && name !== "}");

/** Whether `symbol` occurs in `tex`, token for token, with groups set aside. */
function occursIn(symbol: string, tex: string) {
  const wanted = names(symbol);
  const within = names(tex);
  return wanted.length > 0 && within.some((_, index) => wanted.every((name, offset) => within[index + offset] === name));
}

/** Whether a range of `symbol` qualifies `row`: the symbol occurs in the row and is not what the
 * row states a relation of, as m_i is in m_i\ge0, where a range of m_i is a second statement. */
function bounds(symbol: string, row: string) {
  const subject = row.slice(0, displayTokens(row).find((token) => token.top && RELATIONS.has(token.text))?.start ?? 0);
  return occursIn(symbol, row) && names(symbol).join(" ") !== names(subject).join(" ");
}

/** The terms of tex between its outer-level tokens that `at` accepts. */
function termsOf(tex: string, at: (token: DisplayToken) => boolean) {
  const terms: string[] = [];
  let from = 0;
  for (const token of displayTokens(tex)) {
    if (!token.top || !at(token)) continue;
    terms.push(tex.slice(from, token.start).trim());
    from = token.end;
  }
  terms.push(tex.slice(from).trim());
  return terms;
}

/**
 * Whether a part qualifies the row before it rather than standing as a formula of its own: a
 * condition in parentheses, as (0\le\rho\le r_\varepsilon); a part that opens on a qualifying word
 * ("for", "when", "on") or on \forall; a range a symbol of the row keeps, as s\ge0 or
 * 0\le\theta\le1; or the values an index of the row runs over, as \ell=P,Q. After "s.t." every part
 * is a constraint of its own.
 */
function qualifies(part: string, row: string, constraints: boolean) {
  const tokens = significant(displayTokens(part));
  while (tokens.length && PUNCTUATION.has(tokens.at(-1)!.text)) tokens.pop();
  if (!tokens.length) return false;
  const [first] = tokens;
  if (first.text === "(" && tokens.slice(1).every((token) => !token.top)) return true;
  if (first.text === "\\forall") return true;
  if (TEXT_COMMANDS.has(first.text) && QUALIFIER_WORD.test(/^\s*\{([^{}]*)\}/u.exec(part.slice(first.end))?.[1].trim() ?? "")) return true;
  if (constraints) return false;
  const body = part.slice(first.start, tokens.at(-1)!.end);
  const relations = displayTokens(body).filter((token) => token.top && RELATIONS.has(token.text));
  if (!relations.length) return false;
  if (relations.every((token) => INEQUALITIES.has(token.text))) {
    const terms = termsOf(body, (token) => INEQUALITIES.has(token.text));
    return terms.every((term) => isNumber(term) || SYMBOL.test(term)) && terms.some((term) => SYMBOL.test(term) && bounds(term, row));
  }
  if (relations.length > 1 || relations[0].text !== "=") return false;
  const [index, values] = termsOf(body, (token) => token.text === "=");
  const list = termsOf(values, (token) => token.text === ",");
  return SYMBOL.test(index) && list.length > 1 && list.every((value) => SYMBOL.test(value) || isNumber(value) || /^\\[lc]?dots$/u.test(value)) && bounds(index, row);
}

/**
 * Whether the part after a space of the manuscript stands as a formula of its own beside the part
 * before it: the part before is complete, not ending on a relation, an operator or a word that
 * leads into what follows ("for" in m_i\ge0\quad\text{for}\ x<y); the part after holds a relation
 * of its own at its outer level, does not continue the one before (as \Longleftrightarrow or \le
 * after a space does), and does not qualify the row.
 */
function separates(before: string, after: string, row: string, constraints: boolean) {
  const previous = significant(displayTokens(before)).filter((token) => token.top);
  const next = significant(displayTokens(after));
  if (!previous.length || !next.length) return false;
  const last = previous.at(-1)!.text;
  if (RELATIONS.has(last) || OPERATORS.has(last)) return false;
  if (last === "{" && TEXT_COMMANDS.has(previous.at(-2)?.text ?? "")) return false;
  if (RELATIONS.has(next[0].text) || (OPERATORS.has(next[0].text) && next[0].text !== "-" && !PUNCTUATION.has(last))) return false;
  if (!next.some((token) => token.top && RELATIONS.has(token.text))) return false;
  return !qualifies(after, row, constraints);
}

type DisplayLine = Readonly<{ start: number; end: number; extraEm: number }>;

/** A display's lines: the display itself, or the rows of the one gathered environment it is, or of
 * the one aligned environment that sets every row flush at its start. Undefined for a display whose
 * rows an environment aligns at a relation. */
function displayLines(tex: string, from: number, to: number): DisplayLine[] | undefined {
  const tokens = significant(displayTokens(tex, from, to));
  if (!tokens.length) return [];
  const whole = [{ start: tokens[0].start, end: tokens.at(-1)!.end, extraEm: 0 }];
  const opening = /^\\begin\s*\{(gathered|aligned)\}$/u.exec(tokens[0].text);
  // The environment closes where the outer level returns; only sentence punctuation may follow it.
  const after = tokens.findIndex((token, index) => index > 0 && token.top);
  const closing = after < 0 ? tokens.length - 1 : after - 1;
  if (!opening || !/^\\end\s*\{(?:gathered|aligned)\}$/u.test(tokens[closing].text) || tokens.slice(closing + 1).some((token) => !PUNCTUATION.has(token.text))) return whole;
  const inner = displayTokens(tex, tokens[0].end, tokens[closing].start);
  const lines: DisplayLine[] = [];
  let line: DisplayToken[] = [];
  let extraEm = 0;
  // A row of a gathered environment, or a row of an aligned environment that opens on its one
  // alignment point, is a line; any other alignment leaves the display as it is.
  const close = () => {
    const own = significant(line);
    if (opening[1] === "aligned") {
      if (!own.length || own[0].text !== "&") return false;
      own.shift();
    }
    if (own.some((token) => token.top && token.text === "&")) return false;
    if (own.length) lines.push({ start: own[0].start, end: own.at(-1)!.end, extraEm });
    return true;
  };
  for (let index = 0; index < inner.length; index += 1) {
    const token = inner[index];
    if (!token.top || token.text !== "\\\\") {
      line.push(token);
      continue;
    }
    if (!close()) return undefined;
    line = [];
    // A row break may ask for more space: \\[2pt].
    const space = /^\s*\[([^\]]*)\]/u.exec(tex.slice(token.end, tokens[closing].start));
    extraEm = space ? lengthInEm(space[1].trim()) ?? 0 : 0;
    while (space && index + 1 < inner.length && inner[index + 1].end <= token.end + space[0].length) index += 1;
  }
  return close() ? lines : undefined;
}

/** The spaces of a line at which two parts meet, each with the connecting word it holds, if any. */
function lineJoins(tex: string, line: DisplayLine) {
  const tokens = displayTokens(tex, line.start, line.end);
  const blank = (token: DisplayToken | undefined) => token !== undefined && token.top && (SPACE.test(token.text) || !token.text.trim());
  const joins: Array<{ start: number; end: number; word?: string; wordStart?: number }> = [];
  for (let index = 0; index < tokens.length; index += 1) {
    if (!blank(tokens[index]) || !tokens[index].text.trim()) continue;
    let end = index;
    while (blank(tokens[end + 1])) end += 1;
    const run = tokens.slice(index, end + 1).filter((token) => token.text.trim());
    if (!run.some((token) => WIDE_SPACE.test(token.text)) && run.length < 2) {
      index = end;
      continue;
    }
    // A word set off by a quad on either side connects two formulas: \quad\text{s.t.}\quad.
    const word = tokens[end + 1];
    if (run.some((token) => QUAD.test(token.text)) && word?.top && TEXT_COMMANDS.has(word.text) && tokens[end + 2]?.text === "{") {
      let close = end + 2;
      for (let depth = 0; close < tokens.length; close += 1) {
        if (tokens[close].text === "{") depth += 1;
        else if (tokens[close].text === "}" && --depth === 0) break;
      }
      let next = close + 1;
      while (blank(tokens[next])) next += 1;
      if (tokens.slice(close + 1, next).some((token) => QUAD.test(token.text))) {
        joins.push({ start: tokens[index].start, end: tokens[next - 1].end, word: tex.slice(tokens[end + 2].end, tokens[close].start).trim(), wordStart: word.start });
        index = next - 1;
        continue;
      }
    }
    joins.push({ start: tokens[index].start, end: tokens[end].end });
    index = end;
  }
  return joins;
}

/**
 * The rows of a display whose outer level sets two or more formulas side by side, joined by a
 * space of the manuscript (\qquad, \quad, a control space or a run of thin spaces): each formula
 * its own slice of the TeX, the comma that closes it kept with it. A part that qualifies a formula
 * (a condition in parentheses, "for …", "when …", a range its symbol keeps) stays on its row; a
 * connecting word set off by quads on both sides ("equivalently", "so that", "s.t.") opens the
 * row it introduces. A single relation continued after a space (\Longleftrightarrow, \le) is one
 * formula. A display that is one gathered environment, or one aligned environment flush at its
 * rows' start, is read row by row. Undefined for a display of one formula a row.
 */
export function researchDisplayRows(tex: string): readonly ResearchDisplayRow[] | undefined {
  const number = EQUATION_NUMBER.exec(tex);
  const lines = displayLines(tex, 0, number ? number.index : tex.length);
  if (!lines?.length) return undefined;
  const rows: ResearchDisplayRow[] = [];
  const push = (start: number, end: number, extraEm: number, hang?: string) => {
    const text = tex.slice(start, end);
    const lead = text.length - text.trimStart().length;
    rows.push(Object.freeze({ tex: text.trim(), start: start + lead, end: start + lead + text.trim().length, ...(extraEm ? { extraEm } : {}), ...(hang ? { hang } : {}) }));
  };
  for (const line of lines) {
    const joins = lineJoins(tex, line);
    const parts = [line.start, ...joins.map((join) => join.end)].map((start, index) => ({ start, end: index < joins.length ? joins[index].start : line.end }));
    let rowStart = line.start;
    let extraEm = line.extraEm;
    // After "s.t." each constraint is a row, hung under the first.
    let constraints: string | undefined;
    let hang: string | undefined;
    joins.forEach((join, index) => {
      const before = tex.slice(parts[index].start, parts[index].end);
      const after = tex.slice(parts[index + 1].start, parts[index + 1].end);
      const row = tex.slice(rowStart, parts[index].end);
      const connects = join.word !== undefined && row.trim() !== "" && after.trim() !== "";
      if (!connects && !separates(before, after, row, constraints !== undefined)) return;
      push(rowStart, parts[index].end, extraEm, hang);
      extraEm = 0;
      rowStart = connects ? join.wordStart! : parts[index + 1].start;
      if (connects && SUCH_THAT.test(join.word!)) constraints = tex.slice(join.wordStart, parts[index + 1].start).trim();
      hang = connects ? undefined : constraints;
    });
    push(rowStart, line.end, extraEm, hang);
  }
  return rows.length > lines.length ? Object.freeze(rows) : undefined;
}

/** A row of displayed mathematics keeps at least TeX's strut: 0.75em above its baseline and 0.25em below. */
const STRUT_HEIGHT_EM = 0.75;
const STRUT_DEPTH_EM = 0.25;
const stackCache = new Map<string, ResearchDisplayStackMarkup | null>();

/**
 * A display of formulas set side by side, set as rows: each row drawn in display style from its
 * own slice of the TeX, the comma that closes a row kept with it as the display's closing
 * punctuation is not; a constraint after "s.t." hangs under the first. Rows stand one line of
 * mathematics apart, each as tall as an array row's strut or its drawing, as TeX sets aligned
 * rows, plus the space a row break asks for; the stack keeps its drawings' own extent above the
 * first row and below the last, as a display on one line does. One assistive expression carries
 * the whole display and its TeX.
 */
export function renderResearchDisplayStack(tex: string): ResearchDisplayStackMarkup | undefined {
  const cached = stackCache.get(tex);
  if (cached !== undefined) return cached ?? undefined;
  const rows = researchDisplayRows(tex);
  if (!rows) {
    stackCache.set(tex, null);
    return undefined;
  }
  const whole = renderResearchMath(tex, true);
  // A constraint after the first hangs under it, behind the invisible width of "s.t." and its space.
  const drawn = rows.map((row, index) => renderResearchMath(`${row.hang ? `\\hphantom{${row.hang}}` : ""}${index < rows.length - 1 ? row.tex.replace(/,$/u, "{,}") : row.tex}`, true));
  // A drawing's extent above and below its baseline, without its canvas gutter.
  const height = (markup: ResearchMathMarkup) => markup.heightEm - markup.depthEm - RESEARCH_MATH_GUTTER_EM;
  const depth = (markup: ResearchMathMarkup) => markup.depthEm - RESEARCH_MATH_GUTTER_EM;
  const result = Object.freeze({
    rows: drawn.map((markup, index) => Object.freeze({
      ...markup,
      svg: markup.svg.replace('data-research-svg="display"', 'data-research-svg="row"'),
      start: rows[index].start,
      end: rows[index].end,
      spaceEm: index === 0 ? 0 : Number((RESEARCH_MATH_ROW_SPACING_EM + (rows[index].extraEm ?? 0)
        + Math.max(0, STRUT_HEIGHT_EM - height(markup)) + Math.max(0, STRUT_DEPTH_EM - depth(drawn[index - 1]))).toFixed(4)),
    })),
    mathml: whole.mathml,
    ...(whole.number ? { number: whole.number } : {}),
  });
  stackCache.set(tex, result);
  return result;
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
