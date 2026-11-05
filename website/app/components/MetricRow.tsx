import type { Metric } from "../lib/content/experience-highlights";
import styles from "./MetricRow.module.css";

export function MetricRow({ metrics, size = "compact" }: { metrics: Metric[]; size?: "compact" | "display" }) {
  return (
    <dl className={`${styles.metrics} ${size === "display" ? styles.display : ""}`} data-metric-row>
      {metrics.map(({ value, label }) => {
        const [base, exponent] = value.split("^");
        return <div key={label}>
          <dt>{label}</dt>
          <dd>{base}{exponent && <sup>{exponent}</sup>}</dd>
        </div>;
      })}
    </dl>
  );
}
