import type { ArchitectureFlow as Flow } from "../../lib/content/architecture-flows";
import styles from "./ArchitectureFlow.module.css";

export function ArchitectureFlow({ flow }: { flow: Flow }) {
  return (
    <figure className={styles.flow} data-architecture-flow>
      <ol className={styles.stages}>
        {flow.stages.map((labels) => (
          <li key={labels[0]}>
            {labels.map((label) => <span key={label}>{label}</span>)}
          </li>
        ))}
      </ol>
      <figcaption>{flow.caption}</figcaption>
    </figure>
  );
}
