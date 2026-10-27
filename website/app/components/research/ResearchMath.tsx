import { RESEARCH_MATH_GUTTER_EM, renderResearchMath } from "../../lib/content/research-math";
import { proseNumber } from "../../lib/content/research-number";
import styles from "./ResearchMath.module.css";

export function ResearchMath({ tex, display = false }: { tex: string; display?: boolean }) {
  const formula = renderResearchMath(tex, display);
  const numeric = display ? undefined : proseNumber(tex);
  if (numeric) {
    return <span className={styles.number} data-research-formula="inline">
      <span data-research-number aria-hidden="true">{numeric.base}{numeric.exponent !== undefined && <sup>{numeric.exponent}</sup>}{numeric.suffix}</span>
      <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: formula.mathml }} />
    </span>;
  }
  const scrollableInline = !display && formula.widthEm - 2 * RESEARCH_MATH_GUTTER_EM > 5;
  return (
    <span
      className={`${styles.formula} ${display ? styles.display : styles.inline}`}
      data-research-formula={display ? "display" : "inline"}
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
      style={{
        marginInline: display ? undefined : `${0.125 - RESEARCH_MATH_GUTTER_EM}em`,
        verticalAlign: display ? undefined : `${-formula.depthEm}em`,
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: formula.svg }} />
      <span
        className={styles.assistive}
        dangerouslySetInnerHTML={{ __html: formula.mathml }}
      />
    </span>
  );
}
