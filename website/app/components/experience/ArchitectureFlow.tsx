import type { ArchitectureFlow as Flow } from "../../lib/content/experience-highlights";
import styles from "./ArchitectureFlow.module.css";

export function ArchitectureFlow({ flow }: { flow: Flow }) {
  return (
    <figure className={styles.flow} data-architecture-flow>
      <ol className={styles.stages}>
        {flow.stages.map((nodes) => (
          <li className={styles.stage} key={nodes[0].title}>
            {nodes.map(({ title, detail, accent }) => (
              <div className={`${styles.node} ${accent ? styles.accent : ""}`} key={title}>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </li>
        ))}
      </ol>
      <div className={styles.feedback}><span>{flow.feedback}</span></div>
      <figcaption>{flow.caption}</figcaption>
    </figure>
  );
}
