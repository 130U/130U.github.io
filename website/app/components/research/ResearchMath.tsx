import type { CSSProperties } from "react";
import { RESEARCH_MATH_GUTTER_EM, renderResearchMath } from "../../lib/content/research-math";
import { proseNumber } from "../../lib/content/research-number";
import styles from "./ResearchMath.module.css";

/** An inline formula stands in its line as a word does: its canvas gutters lie in
 * negative margins, so the word space alone parts it from the words beside it.
 * `reserveCh` narrows a wide formula's scroll box so the punctuation glued to it stays on its line. */
export function ResearchMath({ tex, display = false, reserveCh }: { tex: string; display?: boolean; reserveCh?: number }) {
  const formula = renderResearchMath(tex, display);
  const assistive = <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: formula.mathml }} />;
  if (display) {
    return (
      <span className={`${styles.formula} ${styles.display}`} data-research-formula="display" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
        <span className={styles.expression} dangerouslySetInnerHTML={{ __html: formula.svg }} />
        <span className={styles.equationEdge} data-equation-edge="" data-equation-number={formula.number ? true : undefined} aria-hidden="true">{formula.number && `(${formula.number})`}</span>
        {assistive}
      </span>
    );
  }
  const scrollableInline = formula.widthEm - 2 * RESEARCH_MATH_GUTTER_EM > 5;
  const numeric = proseNumber(tex);
  if (numeric) {
    return <span
      className={`${styles.number}${scrollableInline ? ` ${styles.numberScroll}` : ""}`}
      data-research-formula="inline"
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
    >
      <span data-research-number aria-hidden="true">{numeric.base}{numeric.exponent !== undefined && <sup>{numeric.exponent}</sup>}{numeric.suffix}</span>
      {assistive}
    </span>;
  }
  return (
    <span
      className={`${styles.formula} ${styles.inline}`}
      data-research-formula="inline"
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
      style={{
        "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em`,
        marginInline: `${-RESEARCH_MATH_GUTTER_EM}em`,
        // The box's baseline is its lower margin edge, the expression's own depth below the text baseline.
        verticalAlign: `${Number((RESEARCH_MATH_GUTTER_EM - formula.depthEm).toFixed(6))}em`,
        // The box may span the line less the negative margins' overlap and the glued punctuation.
        ...(reserveCh ? { maxWidth: `calc(100% + ${2 * RESEARCH_MATH_GUTTER_EM}em - ${reserveCh}ch)` } : {}),
      } as CSSProperties}
    >
      <span dangerouslySetInnerHTML={{ __html: formula.svg }} />
      {assistive}
    </span>
  );
}
