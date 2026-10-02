import temml from "temml";

export function renderAiResearchMath(tex: string, displayMode = false) {
  const markup = temml.renderToString(tex, {
    displayMode,
    annotate: true,
    trust: false,
    throwOnError: true,
    strict: true,
    xml: true,
  });
  // Only adjust the root of Temml's trusted MathML output. The source TeX stays
  // intact in its annotation, including its equation numbers and whitespace.
  return markup.replace(/^<math\b([^>]*)>/u, (opening, attributes: string) => {
    const fontStyle = "font-family:var(--font-text);font-size:1em;";
    const root = /\bstyle="/u.test(attributes)
      ? opening.replace(/\bstyle="([^"]*)"/u, (_: string, style: string) => `style="${style}${fontStyle}"`)
      : opening.replace(/>$/u, ` style="${fontStyle}">`);
    return root.replace(/^<math/u, `<math data-ai-math="${displayMode ? "display" : "inline"}"`);
  });
}

export function AiResearchMath({ tex, display = false }: { tex: string; display?: boolean }) {
  return (
    <span
      style={display ? undefined : {
        display: "inline-flex",
        maxWidth: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        paddingBlock: "0.125em",
        marginBlock: "-0.125em",
        verticalAlign: "baseline",
      }}
      dangerouslySetInnerHTML={{ __html: renderAiResearchMath(tex, display) }}
    />
  );
}
