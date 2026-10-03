import { AI_MATH_GUTTER_EM, renderAiResearchMath } from "../../lib/content/ai-math";
import styles from "./AiResearchMath.module.css";

export function AiResearchMath({ tex, display = false }: { tex: string; display?: boolean }) {
  const formula = renderAiResearchMath(tex, display);
  const scrollableInline = !display && formula.widthEm - 2 * AI_MATH_GUTTER_EM > 5;
  return (
    <span
      className={`${styles.formula} ${display ? styles.display : styles.inline}`}
      data-ai-formula={display ? "display" : "inline"}
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
      style={{
        marginInline: display ? undefined : `${0.125 - AI_MATH_GUTTER_EM}em`,
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
