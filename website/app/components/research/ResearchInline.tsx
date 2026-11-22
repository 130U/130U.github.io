import { Fragment, type ReactNode } from "react";
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

// An identifier longer than a phone's line, written in camel case
// (AnalyticDiscreteGeometricAveragePriceAsianHestonEngine), breaks only before
// one of its inner capitals.
const LONG_IDENTIFIER = /\b[A-Za-z]{30,}\b/gu;

function BreakIdentifiers({ text }: { text: string }) {
  const breaks = [...text.matchAll(LONG_IDENTIFIER)].flatMap((match) => [...match[0].matchAll(/(?<=[a-z])[A-Z]/gu)].map((capital) => match.index + capital.index));
  if (!breaks.length) return text;
  return [0, ...breaks].map((start, index) => <Fragment key={start}>{index > 0 && <wbr />}{text.slice(start, breaks[index])}</Fragment>);
}

export function KeepRanges({ text }: { text: string }) {
  if (!RANGE.test(text)) return <BreakIdentifiers text={text} />;
  return text.split(RANGE).map((part, index) => index % 2 ? <span key={index} className={styles.range}>{part}</span> : <BreakIdentifiers key={index} text={part} />);
}

// A word that joins numbers with a hyphen or a dash (373-81, 2019-2024, 62-345.600,
// 120–150), a number and a word (50-member, tier-1), or a one- or two-letter
// prefix or an acronym and its word (e-commerce, co-founder, IPhO-level) holds
// one line. An ordinary compound (real-world) may still break after its hyphen,
// as printed text does. Only words that stand between spaces are held, so the
// text and its word boundaries stay exactly as written.
const NUMBER_JOIN = /(?<=^|\s)(\S*(?:\d[-–][\d\p{L}]|\p{L}-\d|(?<!\p{L})\p{L}{1,2}-\p{L}|\p{Lu}\p{L}*\p{Lu}\p{L}*-\p{L})\S*)(?=\s|$)/u;

export function KeepNumberJoins({ text }: { text: string }) {
  if (!NUMBER_JOIN.test(text)) return text;
  return text.split(NUMBER_JOIN).map((part, index) => index % 2 && part.length <= 24 ? <span key={index} className={styles.range}>{part}</span> : part);
}

// A web address or identifier written out as a link's text breaks only where a
// printed reference list breaks one: after "//" or the scheme's colon, before a
// slash, question mark, number sign or ampersand, and on either side of an equals
// sign. A part between those marks longer than sixteen characters may also break
// before a period, comma, hyphen, underscore, tilde or percent sign, and a part
// longer than any line (a hash) every twelve characters. An address never breaks
// after its own hyphen, which would read as a hyphenated word.
const ADDRESS = /^(?:https?:\/\/|doi:|arxiv:|www\.)\S+$/iu;
const ADDRESS_BREAK = /(?<=:\/\/|^(?:doi|arxiv):|=)|(?<![:/])(?=\/)|(?=[?#&=])/iu;
const PART_BREAK = /(?=[.,\-_~%])/u;
const SHORT_PART = 16;
const LONG_PART = 24;
const PART_CHUNK = /.{1,12}/gu;

export function isAddress(text: string) {
  return ADDRESS.test(text);
}

export function addressParts(text: string) {
  const parts = text.split(ADDRESS_BREAK).filter(Boolean)
    .flatMap((part) => part.length > SHORT_PART ? part.split(PART_BREAK).filter(Boolean) : [part])
    .flatMap((part) => part.length > LONG_PART ? part.match(PART_CHUNK)! : [part]);
  // A short ending (".pdf", ".x") stays with the part before it.
  if (parts.length > 1 && parts[parts.length - 1].length <= 5) parts.splice(-2, 2, parts.at(-2)! + parts.at(-1)!);
  return parts;
}

export function AddressText({ text }: { text: string }) {
  return addressParts(text).map((part, index) => <Fragment key={index}>{index > 0 && <wbr />}{part}</Fragment>);
}

// Punctuation that closes against a formula, and brackets that open onto one,
// share its line as they do in the papers. A formula wide enough to fill a
// phone's line keeps that punctuation too: its scroll box leaves room for it.
// A number set in the prose face takes the punctuation that closes against it;
// no line breaks after an opening bracket, so a number needs no glue there.
const CLOSING = /^[.,;:!?%)\]}’”]+/u;
const OPENING = /[([{‘“]$/u;
const GLUED_WIDTH_EM = 14 + 2 * RESEARCH_MATH_GUTTER_EM;

function gluable(inline: ArticleInline | undefined): inline is Extract<ArticleInline, { type: "math" }> {
  return inline?.type === "math" && inline.tex.trim() !== "\\square";
}

/** The width a wide formula leaves on its line for the punctuation glued to it, in ch. */
function reserveFor(tex: string, glued: string) {
  return renderResearchMath(tex).widthEm > GLUED_WIDTH_EM ? glued.length + 0.5 : undefined;
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
    if (before?.type === "text" && !proseNumber(inline.tex)) {
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
      return <span key={index} className={styles.glued}>{opening}<ResearchMath tex={inline.tex} reserveCh={reserveFor(inline.tex, `${opening ?? ""}${closing ?? ""}`)} />{closing}</span>;
    }
    if (inline.type === "line-break") return <br key={index} />;
    if (inline.type === "strong") return <strong key={index}><InlineContent inlines={inline.inlines} /></strong>;
    if (inline.type === "emphasis") return <em key={index}><InlineContent inlines={inline.inlines} /></em>;
    if (inline.type === "code") return <code key={index}>{inline.text}</code>;
    if (inline.type === "link") {
      const [label] = inline.inlines;
      if (inline.inlines.length === 1 && label.type === "text" && isAddress(label.text)) return <a key={index} href={inline.href} title={inline.title} className={styles.address}><AddressText text={label.text} /></a>;
      return <a key={index} href={inline.href} title={inline.title}><InlineContent inlines={inline.inlines} /></a>;
    }
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
