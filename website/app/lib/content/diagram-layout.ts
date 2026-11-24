import type { ArchitectureDiagram } from "./architecture-diagrams";

/**
 * The interface face's advance widths, in thousandths of an em, for the
 * printable ASCII characters (space to tilde) at weights 400 and 500, as
 * InterVariable sets them. A logic diagram measures its node titles with them,
 * so it knows where a stage's nodes can stand side by side with every title on
 * one line; the browser layout check holds the result.
 */
const ADVANCE_400 = [281, 288, 466, 633, 642, 982, 644, 300, 365, 365, 501, 662, 288, 460, 288, 360, 631, 407, 610, 618, 646, 593, 620, 566, 619, 620, 288, 302, 662, 662, 662, 511, 966, 690, 654, 730, 722, 601, 590, 746, 743, 269, 571, 672, 565, 903, 753, 765, 639, 765, 644, 642, 646, 744, 690, 985, 682, 679, 629, 365, 360, 365, 471, 456, 323, 562, 612, 571, 612, 583, 370, 613, 591, 242, 242, 549, 242, 876, 591, 600, 612, 612, 376, 528, 327, 591, 562, 818, 546, 562, 552, 426, 333, 426, 662];
const ADVANCE_500 = [267, 304, 494, 639, 646, 993, 653, 313, 369, 369, 521, 667, 303, 462, 303, 370, 646, 415, 616, 627, 656, 603, 630, 571, 629, 630, 303, 315, 667, 667, 667, 527, 982, 709, 657, 733, 722, 603, 589, 748, 745, 272, 575, 688, 565, 913, 756, 767, 642, 769, 648, 646, 653, 740, 709, 1003, 701, 696, 641, 369, 370, 369, 477, 463, 337, 568, 618, 577, 618, 587, 379, 620, 602, 252, 252, 559, 252, 888, 602, 604, 618, 618, 387, 539, 340, 602, 575, 829, 557, 575, 559, 440, 346, 440, 667];

/** The width in pixels of one line of text in the interface face. */
export function interfaceWidth(text: string, size: number, weight: 400 | 500, letterSpacing = 0) {
  const advances = weight === 500 ? ADVANCE_500 : ADVANCE_400;
  let thousandths = 0;
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code < 32 || code > 126) throw new Error(`No advance width for "${char}" in "${text}".`);
    thousandths += advances[code - 32] + letterSpacing * 1000;
  }
  return (thousandths / 1000) * size;
}

/*
 * Where a logic diagram's text holds one line (docs/design.md, Logic diagrams).
 * Lengths are pixels at the reading size, 16px to the rem; the diagram's
 * breakpoints are set in rem, so the ratios hold at any text size. A node's
 * title is set at the interface size, 15px and weight 500, a lane's name at
 * the label size, 13px; a node adds 30px of padding and border to its text.
 */
export const HORIZONTAL_FROM = 860;
export const SIDE_BY_SIDE_FROM = 480;
const NODE_INSET = 30;
const NODE_GAP = 8;

type Stage = ArchitectureDiagram["stages"][number];
type Node = Stage["nodes"][number];

/** A node's widest line of short text: its title, or its lane's name. */
function nodeTextWidth(node: Node) {
  return Math.max(interfaceWidth(node.title, 15, 500, -0.003), node.tag ? interfaceWidth(node.tag, 13, 400) : 0);
}

/** Parallel nodes side by side: two columns for four, otherwise one per node. */
export const stageColumns = (nodes: number) => (nodes > 3 ? 2 : nodes);

/**
 * Whether a stage's parallel nodes stand side by side in the vertical
 * sequence: only where, at its narrowest such width, every node in a row holds
 * its title on one line (with a pixel to spare for rounding).
 */
export function sideBySide(stage: Stage) {
  if (stage.nodes.length < 2) return false;
  const columns = stageColumns(stage.nodes.length);
  const widest = Math.max(...stage.nodes.map(nodeTextWidth));
  return columns * (Math.ceil(widest) + 1 + NODE_INSET) + (columns - 1) * NODE_GAP <= SIDE_BY_SIDE_FROM;
}

/**
 * The width the left-to-right diagram needs: each stage's column takes at
 * least its widest node, and the connector columns their gap at that width
 * (clamp(28px, 4.6cqi, 44px)).
 */
export function horizontalWidth(diagram: ArchitectureDiagram, width = HORIZONTAL_FROM) {
  const gap = Math.min(44, Math.max(28, 0.046 * width));
  const columns = diagram.stages.reduce((sum, stage) => sum + Math.ceil(Math.max(...stage.nodes.map(nodeTextWidth))) + 1 + NODE_INSET, 0);
  return columns + (diagram.stages.length - 1) * gap;
}
