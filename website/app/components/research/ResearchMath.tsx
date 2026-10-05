import { RESEARCH_MATH_GUTTER_EM, renderResearchMath } from "../../lib/content/research-math";
import styles from "./ResearchMath.module.css";

export function ResearchMath({ tex, display = false }: { tex: string; display?: boolean }) {
  const formula = renderResearchMath(tex, display);
  const scrollableInline = !display && formula.widthEm - 2 * RESEARCH_MATH_GUTTER_EM > 5;
  return (
    <span
      className={`${styles.formula} ${display ? styles.display : styles.inline}`}
      data-research-formula={display ? "display" : "inline"}
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
      style={{
        marginInline: display ? undefined : `${0.125 - RESEARCH_MATH_GUTTER_EM}em`,
        verticalAlign: display ? undefined : `calc(${-formula.depthEm} * var(--type-math))`,
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
