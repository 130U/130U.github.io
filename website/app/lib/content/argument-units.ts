import type { ResearchBlock, ResearchInline } from "./research-markdown";

// The units of an argument: a statement (a bold Theorem, Lemma, Proposition,
// Corollary, Definition, Assumption, Remark or Example), a proof, and a paragraph
// that opens on a run-in head (a bold or italic phrase followed by its text). A
// manuscript sets each off from the paragraph before it, as amsthm and LaTeX's
// run-in sections do, and a proof's last paragraph, which carries its end mark,
// from the paragraph after it.
const STATEMENT = /^(?:Theorem|Lemma|Proposition|Corollary|Definition|Assumption|Remark|Example)\b/u;
const PROOF = /^Proof\b/u;

type ArgumentUnit = "statement" | "proof" | "head";

function plainText(inlines: readonly ResearchInline[]): string {
  return inlines.map((inline) => {
    if (inline.type === "text" || inline.type === "code") return inline.text;
    if (inline.type === "math") return inline.tex;
    return "inlines" in inline ? plainText(inline.inlines) : "";
  }).join("");
}

/** The unit of an argument a paragraph opens, if any. */
export function argumentUnit(block: ResearchBlock): ArgumentUnit | undefined {
  if (block.type !== "paragraph") return undefined;
  const [first, ...rest] = block.inlines;
  if (first?.type !== "strong" && first?.type !== "emphasis") return undefined;
  const label = plainText(first.inlines).trim();
  if (first.type === "strong" && STATEMENT.test(label)) return "statement";
  if (PROOF.test(label)) return "proof";
  return plainText(rest).trim() ? "head" : undefined;
}

/** Whether a paragraph carries a proof's end mark (∎ or \square). */
export function closesProof(block: ResearchBlock): boolean {
  if (block.type !== "paragraph") return false;
  const marks = (inlines: readonly ResearchInline[]): boolean => inlines.some((inline) => (inline.type === "text" && inline.text.includes("∎"))
    || (inline.type === "math" && inline.tex.trim() === "\\square")
    || ("inlines" in inline && marks(inline.inlines)));
  return marks(block.inlines);
}
