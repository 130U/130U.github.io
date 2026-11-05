import { Fragment, type CSSProperties } from "react";
import type { ArchitectureDiagram } from "../../lib/content/architecture-diagrams";
import { InlineMarkdown } from "../research/ResearchInline";
import styles from "./LogicDiagram.module.css";

const pad = (value: number) => String(value).padStart(2, "0");
type Position = "first" | "middle" | "last";
const position = (index: number, count: number): Position => index === 0 ? "first" : index === count - 1 ? "last" : "middle";

/**
 * A left-to-right logic diagram laid out on one CSS grid: node columns alternate
 * with connector columns, and every multi-node stage shares the same lane rows,
 * so arrows, fan-out buses and the feedback loop align without measuring.
 * Below 640px of width the same markup reflows into a vertical sequence.
 */
export function LogicDiagram({ diagram }: { diagram: ArchitectureDiagram }) {
  const { stages, loop } = diagram;
  const lanes = Math.max(...stages.map((stage) => stage.nodes.length));
  const nodeColumn = (stage: number) => 2 * stage + 1;
  const linkColumn = (stage: number) => 2 * stage + 2;
  const allLanes = `2 / span ${lanes}`;
  const canvas: CSSProperties = {
    gridTemplateColumns: stages.map((_, index) => index < stages.length - 1 ? "minmax(0, 1fr) var(--diagram-gap)" : "minmax(0, 1fr)").join(" "),
    gridTemplateRows: `auto repeat(${lanes}, auto)${loop ? " auto auto" : ""}`,
  };

  function links(stage: number) {
    const from = stages[stage].nodes.length;
    const to = stages[stage + 1].nodes.length;
    const gridColumn = linkColumn(stage);
    const span = (kind: string) => <span key={kind} className={`${styles.link} ${styles[kind]}`} style={{ gridColumn, gridRow: allLanes }} />;
    const lane = (kind: string, index: number) => (
      <span key={`${kind}-${index}`} className={`${styles.link} ${styles[kind]}`} data-position={position(index, lanes)} style={{ gridColumn, gridRow: index + 2 }}>
        {kind !== "straight" && <i className={styles.bus} />}
      </span>
    );
    const rows = Array.from({ length: lanes }, (_, index) => index);
    if (from === to) return from === 1 ? [span("straight")] : rows.map((index) => lane("straight", index));
    if (from === 1) return [span("stem"), ...rows.map((index) => lane("branchOut", index))];
    return [...rows.map((index) => lane("branchIn", index)), span("join")];
  }

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
              <div className={styles.stage} data-stage={stageIndex + 1} style={{ "--columns": stage.nodes.length > 3 ? 2 : stage.nodes.length } as CSSProperties}>
                <p className={styles.stageLabel} style={{ gridColumn: nodeColumn(stageIndex), gridRow: 1 }}>
                  <span className={styles.stageIndex} aria-hidden="true">{pad(stageIndex + 1)}</span>
                  {stage.label}
                </p>
                {stage.nodes.map((node, nodeIndex) => (
                  <div
                    className={styles.cell}
                    key={node.title}
                    data-single={single && lanes > 1 ? "" : undefined}
                    data-loop={loopEnd(stageIndex, nodeIndex)}
                    style={{ gridColumn: nodeColumn(stageIndex), gridRow: single ? allLanes : nodeIndex + 2 }}
                  >
                    <div className={stage.emphasis ? `${styles.node} ${styles.emphasis}` : styles.node}>
                      {node.tag && <span className={styles.tag}>{node.tag}</span>}
                      <span className={styles.nodeTitle}>{node.title}</span>
                      {node.detail && <span className={styles.nodeDetail}><InlineMarkdown text={node.detail} /></span>}
                    </div>
                  </div>
                ))}
              </div>
              {stageIndex < stages.length - 1 && links(stageIndex)}
            </Fragment>
          );
        })}
        {loop && <>
          <span className={`${styles.loop} ${styles.loopStart}`} style={{ gridColumn: nodeColumn(loop.to), gridRow: lanes + 2 }} />
          <span className={`${styles.loop} ${styles.loopSpan}`} style={{ gridColumn: `${nodeColumn(loop.to) + 1} / ${nodeColumn(loop.from)}`, gridRow: lanes + 2 }} />
          <span className={`${styles.loop} ${styles.loopEnd}`} style={{ gridColumn: nodeColumn(loop.from), gridRow: lanes + 2 }} />
          <p className={styles.loopLabel} style={{ gridColumn: `${nodeColumn(loop.to)} / ${nodeColumn(loop.from) + 1}`, gridRow: lanes + 3 }}>
            <span className={styles.loopReturn}>Returns to {pad(loop.to + 1)} {stages[loop.to].label}: </span>
            {loop.label}
          </p>
        </>}
      </div>
      <figcaption className={styles.caption}>{diagram.caption}</figcaption>
    </figure>
  );
}
