import type { ReactNode } from "react";
import type { ArticleInline } from "../../lib/content/article-headings";
import { parseResearchMarkdown } from "../../lib/content/research-markdown";
import { RESEARCH_MATH_GUTTER_EM, renderResearchMath } from "../../lib/content/research-math";
import { proseNumber } from "../../lib/content/research-number";
import { ResearchMath } from "./ResearchMath";
import styles from "./ResearchArticle.module.css";

function ProofEnd({ source }: { source?: ReactNode }) {
  return <span className={styles.proofEnd} data-proof-end>{source && <span hidden>{source}</span>}<abbr title="End of proof">Q.E.D.</abbr></span>;
}

// A number range such as 4400–4500 holds one line.
const RANGE = /(\d[\d,.]*–\d[\d,.]*)/u;

export function KeepRanges({ text }: { text: string }) {
  if (!RANGE.test(text)) return text;
  return text.split(RANGE).map((part, index) => index % 2 ? <span key={index} className={styles.range}>{part}</span> : part);
}

// Punctuation that closes against a formula, and brackets that open onto one,
// share its line as they do in the papers. A formula wide enough to fill a
// phone's line keeps its break opportunities.
const CLOSING = /^[.,;:!?%)\]}’”]+/u;
const OPENING = /[([{‘“]$/u;
const GLUED_WIDTH_EM = 14 + 2 * RESEARCH_MATH_GUTTER_EM;

function gluable(inline: ArticleInline | undefined): inline is Extract<ArticleInline, { type: "math" }> {
  return inline?.type === "math" && inline.tex.trim() !== "\\square" && !proseNumber(inline.tex) && renderResearchMath(inline.tex).widthEm <= GLUED_WIDTH_EM;
}

function textNodes(text: string, key: number) {
  return text.split(/(∎)/u).map((part, index) => part === "∎" ? <ProofEnd key={`${key}-${index}`} /> : <KeepRanges key={`${key}-${index}`} text={part} />);
}

export function InlineContent({ inlines }: { inlines: ArticleInline[] }) {
  // Characters each text run gives to the formula before or after it.
  const lead = new Map<number, string>();
  const tail = new Map<number, string>();
  inlines.forEach((inline, index) => {
    if (!gluable(inline)) return;
    const before = inlines[index - 1];
    const after = inlines[index + 1];
    if (before?.type === "text") {
      const opening = OPENING.exec(before.text)?.[0];
      if (opening) tail.set(index - 1, opening);
    }
    if (after?.type === "text") {
      const closing = CLOSING.exec(after.text)?.[0];
      if (closing) lead.set(index + 1, closing);
    }
  });
  return inlines.map((inline, index) => {
    if (inline.type === "math") {
      if (inline.tex.trim() === "\\square") return <ProofEnd key={index} source={<ResearchMath tex={inline.tex} />} />;
      const opening = tail.get(index - 1);
      const closing = lead.get(index + 1);
      if (!opening && !closing) return <ResearchMath key={index} tex={inline.tex} />;
      return <span key={index} className={styles.glued}>{opening}<ResearchMath tex={inline.tex} tightStart={Boolean(opening)} tightEnd={Boolean(closing)} />{closing}</span>;
    }
    if (inline.type === "line-break") return <br key={index} />;
    if (inline.type === "strong") return <strong key={index}><InlineContent inlines={inline.inlines} /></strong>;
    if (inline.type === "emphasis") return <em key={index}><InlineContent inlines={inline.inlines} /></em>;
    if (inline.type === "code") return <code key={index}>{inline.text}</code>;
    if (inline.type === "link") return <a key={index} href={inline.href} title={inline.title}><InlineContent inlines={inline.inlines} /></a>;
    if (inline.type === "text") {
      const start = lead.get(index)?.length ?? 0;
      const end = inline.text.length - (tail.get(index)?.length ?? 0);
      return textNodes(inline.text.slice(start, Math.max(start, end)), index);
    }
  });
}

/** Render copy with the same inline mathematics as the manuscript. */
export function InlineMarkdown({ text }: { text: string }) {
  const blocks = parseResearchMarkdown(text, { joinSoftLines: true });
  if (blocks.length !== 1 || blocks[0].type !== "paragraph") {
    throw new Error("Experience inline copy must contain exactly one paragraph.");
  }
  return <InlineContent inlines={blocks[0].inlines} />;
}
