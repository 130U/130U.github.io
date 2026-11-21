import type { CSSProperties, ReactNode } from "react";
import { renderResearchMath } from "../../lib/content/research-math";
import type { AlignedNumber, Pad } from "../../lib/content/research-number";
import mathStyles from "./ResearchMath.module.css";
import styles from "./ResearchArticle.module.css";

/** Invisible generated text that pads a value to its column's alignment; it is neither copied nor read. */
function padText(pad: Pad, key: string) {
  if (!pad.text && !pad.gaps) return null;
  return <span key={key} className={styles.pad} data-table-pad={pad.text} data-when={pad.when} data-weight={pad.bold === undefined ? undefined : pad.bold ? "bold" : "regular"} style={pad.gaps ? { "--pad-gaps": pad.gaps } as CSSProperties : undefined} />;
}

/** The marks and digits of a value, adjacent text joined into one run, so the page's text is the written number. */
function parts(value: AlignedNumber) {
  const list: (string | ReactNode)[] = [];
  const add = (part: string | ReactNode) => {
    if (part === null || part === "") return;
    if (typeof part === "string" && typeof list.at(-1) === "string") list[list.length - 1] += part;
    else list.push(part);
  };
  value.fields.forEach((field, index) => {
    add(value.interval && index === 1 ? <span key={`break-${index}`} className={styles.fieldBreak} data-field-break="">{field.separator}</span> : field.separator);
    add(padText(field.before, `before-${index}`));
    add(`${field.open}${field.sign}${field.integer}${field.fraction === undefined ? "" : `.${field.groups[0]}`}`);
    field.groups.slice(1).forEach((group, position) => add(<span key={`group-${index}-${position}`} className={styles.digitGroup} data-digit-group="">{group}</span>));
    add(field.close);
    add(padText(field.after, `after-${index}`));
  });
  value.tail.forEach((pad, index) => add(padText(pad, `tail-${index}`)));
  return list;
}

/**
 * A value in a research table, in tabular figures with its digits after the
 * point grouped in threes by spacing alone, padded to its column's decimal
 * point. An interval may break after its comma, where its table would
 * otherwise scroll. A value the manuscript writes as a formula keeps that
 * formula's MathML and TeX for assistive technology and copying, as a number in
 * prose does; `display` is the TeX of a display the value's row presents.
 */
export function TableValue({ value, display }: { value: AlignedNumber; display?: string }) {
  const tex = display ?? value.tex;
  if (tex === undefined) {
    const text = <span className={styles.value} data-table-value="">{parts(value)}</span>;
    return value.bold ? <strong>{text}</strong> : text;
  }
  const visible = <span className={styles.value} data-table-value="" data-research-number="" aria-hidden="true">{parts(value)}</span>;
  return (
    <span className={mathStyles.number} data-research-formula="inline">
      {value.bold ? <strong>{visible}</strong> : visible}
      <span className={mathStyles.assistive} dangerouslySetInnerHTML={{ __html: renderResearchMath(tex, display !== undefined).mathml }} />
    </span>
  );
}
