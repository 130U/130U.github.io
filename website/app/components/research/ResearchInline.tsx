import type { ReactNode } from "react";
import type { ArticleInline } from "../../lib/content/article-headings";
import { parseResearchMarkdown } from "../../lib/content/research-markdown";
import { ResearchMath } from "./ResearchMath";
import styles from "./ResearchArticle.module.css";

function ProofEnd({ source }: { source?: ReactNode }) {
  return <span className={styles.proofEnd} data-proof-end>{source && <span hidden>{source}</span>}<abbr title="End of proof">Q.E.D.</abbr></span>;
}

export function InlineContent({ inlines }: { inlines: ArticleInline[] }) {
  return inlines.map((inline, index) => {
    if (inline.type === "math") return inline.tex.trim() === "\\square"
      ? <ProofEnd key={index} source={<ResearchMath tex={inline.tex} />} />
      : <ResearchMath key={index} tex={inline.tex} />;
    if (inline.type === "line-break") return <br key={index} />;
    if (inline.type === "strong") return <strong key={index}><InlineContent inlines={inline.inlines} /></strong>;
    if (inline.type === "emphasis") return <em key={index}><InlineContent inlines={inline.inlines} /></em>;
    if (inline.type === "code") return <code key={index}>{inline.text}</code>;
    if (inline.type === "link") return <a key={index} href={inline.href} title={inline.title}><InlineContent inlines={inline.inlines} /></a>;
    if (inline.type === "text") return inline.text.split(/(∎)/u).map((part, partIndex) => part === "∎" ? <ProofEnd key={`${index}-${partIndex}`} /> : part);
  });
}

/** Render approved copy with the same inline mathematics as the manuscript. */
export function InlineMarkdown({ text }: { text: string }) {
  const blocks = parseResearchMarkdown(text, { joinSoftLines: true });
  if (blocks.length !== 1 || blocks[0].type !== "paragraph") {
    throw new Error("Experience inline copy must contain exactly one paragraph.");
  }
  return <InlineContent inlines={blocks[0].inlines} />;
}
