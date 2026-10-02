import { AI_MATH_GUTTER_EM, renderAiResearchMath } from "../../lib/content/ai-math";

export function AiResearchMath({ tex, display = false }: { tex: string; display?: boolean }) {
  const formula = renderAiResearchMath(tex, display);
  const scrollableInline = !display && formula.widthEm - 2 * AI_MATH_GUTTER_EM > 6;
  return (
    <span
      data-ai-formula={display ? "display" : "inline"}
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
      style={{
        position: "relative",
        display: display ? "block" : "inline-block",
        width: display ? "max-content" : undefined,
        maxWidth: display ? undefined : "100%",
        overflowX: display ? undefined : "auto",
        overflowY: display ? undefined : "hidden",
        paddingBlock: "0.125em",
        marginBlock: "-0.125em",
        marginInline: display ? "auto" : `${-AI_MATH_GUTTER_EM}em`,
        lineHeight: 0,
        verticalAlign: display ? undefined : `${-formula.depthEm}em`,
      }}
    >
      <span dangerouslySetInnerHTML={{ __html: formula.svg }} />
      <span
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
        dangerouslySetInnerHTML={{ __html: formula.mathml }}
      />
    </span>
  );
}
