import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { ArchitectureDiagram } from "../../lib/content/architecture-diagrams";
import { parseResearchMarkdown } from "../../lib/content/research-markdown";
import { RESEARCH_MATH_GUTTER_EM, renderResearchMath } from "../../lib/content/research-math";
import styles from "./LogicDiagram.module.css";

const pad = (value: number) => String(value).padStart(2, "0");

/*
 * Wires. Every connector is drawn in SVG with crisp edges, as 1px bars placed by
 * percentages of its grid area and pixel offsets, so a line keeps one width and
 * one color at every device scale. Where two bars of one line meet, one runs to
 * the centre line of the other or past it; the colors are opaque, so the overlap
 * cannot show and no rounding can open a gap. Arrowheads are drawn on the
 * geometric centre line of the bar they end.
 */
type At = readonly [percent: number, px: number];
const at = (percent: number, px = 0): At => [percent, px];
const pct = (value: number) => `${Number(value.toFixed(4))}%`;

/** A 1px bar along one axis from `from` to `to`, centred across that axis on `across`. */
function Bar({ axis, from, to, across }: { axis: "h" | "v"; from: At; to: At; across: At }) {
  const span = to[0] - from[0];
  const extra = to[1] - from[1];
  // A percentage length cannot shed pixels, so a bar extends from its start's pixel offset.
  if (span < 0 || extra < 0) throw new Error("A diagram bar runs forward from its start.");
  const [main, cross] = axis === "h" ? (["x", "y"] as const) : (["y", "x"] as const);
  const [length, thickness] = axis === "h" ? (["width", "height"] as const) : (["height", "width"] as const);
  const place = { [main]: pct(from[0]), [cross]: pct(across[0]) };
  return (
    <svg {...place} overflow="visible">
      {span > 0 && <rect {...{ [main]: from[1], [cross]: across[1] - 0.5, [length]: pct(span), [thickness]: 1 }} />}
      {extra > 0 && (
        <svg {...{ [main]: pct(span) }} overflow="visible">
          <rect {...{ [main]: from[1], [cross]: across[1] - 0.5, [length]: extra, [thickness]: 1 }} />
        </svg>
      )}
    </svg>
  );
}

/** An arrowhead 6px long and 7px wide whose tip stands at the point given. */
function Arrow({ x, y, direction }: { x: At; y: At; direction: "right" | "up" }) {
  const d = direction === "right" ? "M-6 -3.5L0 0L-6 3.5Z" : "M-3.5 6L0 0L3.5 6Z";
  return (
    <svg x={pct(x[0])} y={pct(y[0])} overflow="visible" data-arrow={direction}>
      <path d={d} transform={x[1] || y[1] ? `translate(${x[1]} ${y[1]})` : undefined} shapeRendering="geometricPrecision" />
    </svg>
  );
}

function Wires({ wire, className, style, children }: { wire: string; className: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <svg className={`${styles.wires} ${className}`} style={style} data-wire={wire} aria-hidden="true" focusable="false" shapeRendering="crispEdges">
      {children}
    </svg>
  );
}

/**
 * The connectors between two stages, one drawing over every lane row of the
 * connector column. Lane rows share one height, so lane i of n is centred at
 * (2i + 1) / 2n of the drawing, and a single node at its middle.
 */
function Links({ from, to }: { from: number; to: number }) {
  const lane = (index: number, count: number) => at(((2 * index + 1) / (2 * count)) * 100);
  const rows = (count: number) => Array.from({ length: count }, (_, index) => lane(index, count));
  const middle = at(50);
  const bus = (count: number) => <Bar axis="v" from={lane(0, count)} to={lane(count - 1, count)} across={middle} />;
  // A line into the next stage runs to the node's edge under its arrowhead, whose tip meets the node.
  const into = (y: At, start: At) => (
    <Fragment key={`into-${y[0]}`}>
      <Bar axis="h" from={start} to={at(100)} across={y} />
      <Arrow x={at(100)} y={y} direction="right" />
    </Fragment>
  );
  if (from === to) return <>{rows(from).map((y) => into(y, at(0)))}</>;
  if (from === 1) {
    return (
      <>
        <Bar axis="h" from={at(0)} to={at(50, 0.5)} across={middle} />
        {bus(to)}
        {rows(to).map((y) => into(y, at(50, -0.5)))}
      </>
    );
  }
  return (
    <>
      {rows(from).map((y) => <Bar key={`out-${y[0]}`} axis="h" from={at(0)} to={at(50, 0.5)} across={y} />)}
      {bus(from)}
      {into(middle, at(50, -0.5))}
    </>
  );
}

/** Parallel nodes side by side at mid widths: two columns for four, otherwise one per node. */
const columns = (nodes: number) => nodes > 3 ? 2 : nodes;

/**
 * The step between two stages of the vertical sequence: a line down the
 * column's centre from the stage above to an arrowhead 8px over the next
 * stage's rule. Where the stage above sets its nodes side by side, each node
 * drops into a short bus over the line, so the step leaves the whole stage.
 */
function Step({ columns: count }: { columns: number }) {
  const centres = Array.from({ length: count }, (_, index) => at(((2 * index + 1) / (2 * count)) * 100));
  return (
    <Wires wire="step" className={styles.step}>
      <g className={styles.stepStem}><Bar axis="v" from={at(0)} to={at(100)} across={at(50)} /></g>
      {count > 1 && (
        <g className={styles.stepBus}>
          {centres.map((x) => <Bar key={x[0]} axis="v" from={at(0)} to={at(0, 8.5)} across={x} />)}
          <Bar axis="h" from={centres[0]} to={centres[count - 1]} across={at(0, 8)} />
          <Bar axis="v" from={at(0, 8)} to={at(0, 32)} across={at(50)} />
        </g>
      )}
      <svg x="50%" y="100%" overflow="visible" data-arrow="down">
        <path d="M-3.5 -6L0 0L3.5 -6Z" shapeRendering="geometricPrecision" />
      </svg>
    </Wires>
  );
}

/*
 * Mathematics in diagram text. A formula sits on the text's baseline: its
 * drawing's canvas gutters lie in negative margins and its lower margin edge
 * stands the expression's depth below the baseline, as in running text. It is
 * set at the site's math size, and a formula wider than its node is set smaller
 * to fit, never wider than the node. A formula wider than seven ems may break
 * after a relation at its outer level, as TeX breaks a formula in a line: the
 * relation keeps its space, and the formula reads as one expression to
 * assistive technology.
 */
const BREAK_WIDTH_EM = 7;
const RELATION = /^(?:=|<|>|\\(?:leq?|geq?|neq|vdash|to|in)(?![A-Za-z]))/u;
const CLOSING = /^[.,;:!?)\]]+/u;

function relationPieces(tex: string) {
  const pieces: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < tex.length; index += 1) {
    const char = tex[index];
    if (char === "\\" && /^\\(?:left|right)(?![A-Za-z])/u.test(tex.slice(index))) depth += tex.startsWith("\\left", index) ? 1 : -1;
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    const relation = depth === 0 ? RELATION.exec(tex.slice(index))?.[0] : undefined;
    if (char === "\\" && !relation) {
      index += (/^\\(?:[A-Za-z]+|.)/u.exec(tex.slice(index))?.[0].length ?? 1) - 1;
      continue;
    }
    if (!relation) continue;
    const end = index + relation.length;
    if (tex.slice(end).trim()) {
      pieces.push(`${tex.slice(start, end)}{}`);
      start = end;
    }
    index = end - 1;
  }
  pieces.push(tex.slice(start));
  return pieces.filter((piece) => piece.trim());
}

function MathPiece({ tex, reserve }: { tex: string; reserve: number }) {
  const drawing = renderResearchMath(tex);
  const ink = drawing.widthEm - 2 * RESEARCH_MATH_GUTTER_EM;
  const style = {
    "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em`,
    "--ink": Number(ink.toFixed(4)),
    ...(reserve ? { "--reserve": `${reserve}em` } : {}),
    marginInline: `${-RESEARCH_MATH_GUTTER_EM}em`,
    // The box's baseline is its lower margin edge, the expression's own depth below the text baseline.
    verticalAlign: `${Number((RESEARCH_MATH_GUTTER_EM - drawing.depthEm).toFixed(6))}em`,
  } as CSSProperties;
  return <span className={styles.mathPiece} style={style} data-diagram-math-piece dangerouslySetInnerHTML={{ __html: drawing.svg }} />;
}

function DiagramMath({ tex, closing }: { tex: string; closing?: string }) {
  const whole = renderResearchMath(tex);
  const pieces = whole.widthEm - 2 * RESEARCH_MATH_GUTTER_EM > BREAK_WIDTH_EM ? relationPieces(tex) : [tex];
  // Punctuation that closes against the formula stays on its last line, and the fit leaves it room.
  const reserve = closing ? 0.5 * closing.length : 0;
  const last = pieces.length - 1;
  // The assistive expression follows the drawing, before the punctuation that closes against it.
  const assistive = <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: whole.mathml }} />;
  return (
    <span className={styles.math} data-research-formula="inline" data-diagram-math>
      {pieces.map((piece, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {index < last && <MathPiece tex={piece} reserve={0} />}
          {index === last && (closing
            ? <span className={styles.glued}><MathPiece tex={piece} reserve={reserve} />{assistive}{closing}</span>
            : <><MathPiece tex={piece} reserve={0} />{assistive}</>)}
        </Fragment>
      ))}
    </span>
  );
}

/** Words, with each hyphenated compound held on one line where its node has room for it. */
const COMPOUND = /([\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)+)/u;

function Words({ text }: { text: string }) {
  if (!COMPOUND.test(text)) return text;
  return text.split(COMPOUND).map((part, index) => index % 2 ? <span key={index} className={styles.compound} data-compound>{part}</span> : part);
}

/** Diagram text: words and inline TeX, as the manuscripts write them. */
function DiagramText({ text }: { text: string }) {
  const blocks = parseResearchMarkdown(text, { joinSoftLines: true });
  if (blocks.length !== 1 || blocks[0].type !== "paragraph") throw new Error("Diagram text must be one paragraph.");
  const inlines = blocks[0].inlines;
  return inlines.map((inline, index) => {
    if (inline.type === "math") {
      const next = inlines[index + 1];
      const closing = next?.type === "text" ? CLOSING.exec(next.text)?.[0] : undefined;
      return <DiagramMath key={index} tex={inline.tex} closing={closing} />;
    }
    if (inline.type !== "text") throw new Error("Diagram text holds words and inline mathematics only.");
    const previous = inlines[index - 1];
    const glued = previous?.type === "math" ? CLOSING.exec(inline.text)?.[0].length ?? 0 : 0;
    return <Words key={index} text={inline.text.slice(glued)} />;
  });
}

/**
 * A left-to-right logic diagram laid out on one CSS grid: node columns alternate
 * with connector columns, and every multi-node stage shares the same lane rows,
 * which share one height, so arrows, fan-out buses and the feedback loop align
 * without measuring. Below 720px of width the same markup reflows into a
 * vertical sequence.
 */
export function LogicDiagram({ diagram }: { diagram: ArchitectureDiagram }) {
  const { stages, loop } = diagram;
  const lanes = Math.max(...stages.map((stage) => stage.nodes.length));
  const nodeColumn = (stage: number) => 2 * stage + 1;
  const linkColumn = (stage: number) => 2 * stage + 2;
  const allLanes = `2 / span ${lanes}`;
  const loopRow = lanes + 2;
  const canvas: CSSProperties = {
    gridTemplateColumns: stages.map((_, index) => index < stages.length - 1 ? "minmax(0, 1fr) var(--diagram-gap)" : "minmax(0, 1fr)").join(" "),
    // The loop's return rule runs 28px below the lane rows, its label beneath it.
    gridTemplateRows: `auto repeat(${lanes}, 1fr)${loop ? " 28px auto" : ""}`,
  };

  function loopEnd(stage: number, node: number) {
    if (!loop || node !== stages[stage].nodes.length - 1) return undefined;
    return stage === loop.from ? "source" : stage === loop.to ? "target" : undefined;
  }

  return (
    <figure className={styles.diagram} data-logic-diagram data-architecture-flow>
      <p className={styles.label}>{diagram.label}</p>
      <div className={styles.canvas} style={canvas}>
        {stages.map((stage, stageIndex) => {
          const single = stage.nodes.length === 1;
          return (
            <Fragment key={stage.label}>
              <div className={styles.stage} data-stage={stageIndex + 1} style={{ "--columns": columns(stage.nodes.length) } as CSSProperties}>
                {stageIndex > 0 && <Step columns={columns(stages[stageIndex - 1].nodes.length)} />}
                <p className={styles.stageLabel} style={{ gridColumn: nodeColumn(stageIndex), gridRow: 1 }}>
                  <span className={styles.stageIndex} aria-hidden="true">{pad(stageIndex + 1)}</span>
                  {stage.label}
                </p>
                {stage.nodes.map((node, nodeIndex) => {
                  const end = loopEnd(stageIndex, nodeIndex);
                  const centred = single && lanes > 1;
                  return (
                    <div
                      className={styles.cell}
                      key={node.title}
                      data-single={centred ? "" : undefined}
                      data-loop={end}
                      style={{ gridColumn: nodeColumn(stageIndex), gridRow: single ? allLanes : nodeIndex + 2 }}
                    >
                      {end && centred && <span className={styles.spacer} />}
                      <div className={stage.emphasis ? `${styles.node} ${styles.emphasis}` : styles.node} data-node>
                        {node.tag && <span className={styles.tag}><Words text={node.tag} /></span>}
                        <span className={styles.nodeTitle}><Words text={node.title} /></span>
                        {node.detail && <span className={styles.nodeDetail}><DiagramText text={node.detail} /></span>}
                      </div>
                      {end && (
                        // The loop's leg from the node's lower edge to the foot of the lane rows.
                        <span className={styles.leg}>
                          <Wires wire="loop" className={styles.legWires}>
                            {end === "target" && <Arrow x={at(50)} y={at(0)} direction="up" />}
                            <Bar axis="v" from={at(0)} to={at(100, 1)} across={at(50)} />
                          </Wires>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              {stageIndex < stages.length - 1 && (
                <Wires wire={`link-${stageIndex + 1}`} className={styles.link} style={{ gridColumn: `${linkColumn(stageIndex)} / span 1`, gridRow: allLanes }}>
                  <Links from={stage.nodes.length} to={stages[stageIndex + 1].nodes.length} />
                </Wires>
              )}
            </Fragment>
          );
        })}
        {loop && <>
          {/* The return rule: down from the source, along the foot of the stages between, up into the target.
              A positioned grid child takes its area from both lines, so each names its span. */}
          <Wires wire="loop" className={styles.loop} style={{ gridColumn: `${nodeColumn(loop.to)} / span 1`, gridRow: `${loopRow} / span 1` }}>
            <Bar axis="v" from={at(0, -1)} to={at(100, -1)} across={at(50)} />
            <Bar axis="h" from={at(50, -0.5)} to={at(100, 1)} across={at(100, -0.5)} />
          </Wires>
          <Wires wire="loop" className={styles.loop} style={{ gridColumn: `${nodeColumn(loop.to) + 1} / ${nodeColumn(loop.from)}`, gridRow: `${loopRow} / span 1` }}>
            <Bar axis="h" from={at(0, -1)} to={at(100, 1)} across={at(100, -0.5)} />
          </Wires>
          <Wires wire="loop" className={styles.loop} style={{ gridColumn: `${nodeColumn(loop.from)} / span 1`, gridRow: `${loopRow} / span 1` }}>
            <Bar axis="v" from={at(0, -1)} to={at(100, -1)} across={at(50)} />
            <Bar axis="h" from={at(0, -1)} to={at(50, 0.5)} across={at(100, -0.5)} />
          </Wires>
          <p className={styles.loopLabel} style={{ gridColumn: `${nodeColumn(loop.to)} / ${nodeColumn(loop.from) + 1}`, gridRow: loopRow + 1 }}>
            <span className={styles.loopReturn}>Returns to {pad(loop.to + 1)} {stages[loop.to].label}: </span>
            {loop.label}
          </p>
        </>}
      </div>
      <figcaption className={styles.caption}>{diagram.caption}</figcaption>
    </figure>
  );
}
