import { RESEARCH_MATH_GUTTER_EM, RESEARCH_MATH_INLINE_SPACE_EM, renderResearchMath } from "../../lib/content/research-math";
import { proseNumber } from "../../lib/content/research-number";
import styles from "./ResearchMath.module.css";

export function ResearchMath({ tex, display = false }: { tex: string; display?: boolean }) {
  const formula = renderResearchMath(tex, display);
  const assistive = <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: formula.mathml }} />;
  if (display) {
    return (
      <span className={`${styles.formula} ${styles.display}${formula.number ? ` ${styles.numbered}` : ""}`} data-research-formula="display">
        <span className={styles.expression} dangerouslySetInnerHTML={{ __html: formula.svg }} />
        {formula.number && <span className={styles.equationNumber} data-equation-number aria-hidden="true">({formula.number})</span>}
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
        marginInline: `${RESEARCH_MATH_INLINE_SPACE_EM - RESEARCH_MATH_GUTTER_EM}em`,
        verticalAlign: `${-formula.depthEm}em`,
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: formula.svg }} />
      {assistive}
    </span>
  );
}
