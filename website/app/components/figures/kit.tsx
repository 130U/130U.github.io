import type { CSSProperties, ReactNode } from "react";
import { InlineMarkdown } from "../research/ResearchInline";
import styles from "./Figure.module.css";

export { styles };

export type Tone = "ink" | "accent" | "sky" | "steel" | "mist";
export type View = { id: string; label: ReactNode };
export type LegendItem = { label: ReactNode; tone: Tone; shape?: "square" | "line" | "dash" | "dot" | "ring" | "hatch" | "box" };

/** Short copy that may contain inline TeX in the manuscripts' `$...$` form. */
export function Tx({ children }: { children: string }) {
  return children.includes("$") ? <InlineMarkdown text={children} /> : <>{children}</>;
}

const tone = (value: Tone) => styles[value];

/**
 * The shared figure frame. A figure with views renders every panel on the
 * server; the controller reveals the switch and swaps panels, and without
 * JavaScript the default panel stays visible.
 */
export function Figure({ id, title, caption, views, defaultView, viewsLabel, legend, children, className }: {
  id: string;
  title: string;
  caption: string;
  views?: View[];
  defaultView?: string;
  viewsLabel?: string;
  legend?: LegendItem[];
  children: ReactNode;
  className?: string;
}) {
  const view = defaultView ?? views?.[0]?.id;
  return (
    <figure className={`${styles.figure} ${className ?? ""}`} id={`figure-${id}`} data-article-figure={id} data-view={view}>
      <div className={styles.frame}>
        <div className={styles.head}>
          <p className={styles.title}><Tx>{title}</Tx></p>
          {views && (
            <div className={styles.switch} role="group" aria-label={viewsLabel ?? "Figure view"} data-fig-switch hidden>
              {views.map((item) => <button key={item.id} type="button" data-fig-view={item.id} aria-pressed={item.id === view}>{item.label}</button>)}
            </div>
          )}
        </div>
        {children}
        {legend && <Legend items={legend} />}
      </div>
      <figcaption className={styles.caption}><Tx>{caption}</Tx></figcaption>
    </figure>
  );
}

export function Panel({ view, active, children }: { view: string; active: boolean; children: ReactNode }) {
  return <div data-fig-panel={view} hidden={!active}>{children}</div>;
}

export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <ul className={styles.legend} aria-hidden="true">
      {items.map((item, index) => (
        <li key={index}><span className={`${styles.swatch} ${tone(item.tone)}`} data-shape={item.shape ?? "square"} />{typeof item.label === "string" ? <Tx>{item.label}</Tx> : item.label}</li>
      ))}
    </ul>
  );
}

/* ---------- Scales: domain value to percent of the plot area ---------- */

export type Scale = (value: number) => number;

export function linear(from: number, to: number): Scale {
  return (value) => ((value - from) / (to - from)) * 100;
}

export function logarithmic(from: number, to: number): Scale {
  const start = Math.log10(from);
  const span = Math.log10(to) - start;
  return (value) => ((Math.log10(value) - start) / span) * 100;
}

/** An SVG path in the 0–100 curve layer, with y measured upward. */
export function path(points: ReadonlyArray<readonly [number, number]>, x: Scale, y: Scale, close = false) {
  const d = points.map(([a, b], index) => `${index ? "L" : "M"}${x(a).toFixed(3)},${(100 - y(b)).toFixed(3)}`).join(" ");
  return close ? `${d} Z` : d;
}

export function sample(from: number, to: number, count: number, fn: (value: number) => number, spacing: "linear" | "log" = "linear") {
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const value = spacing === "log" ? 10 ** (Math.log10(from) + t * (Math.log10(to) - Math.log10(from))) : from + t * (to - from);
    return [value, fn(value)] as const;
  });
}

export type Tick = { at: number; label: ReactNode; solid?: boolean; edge?: "start" | "end"; minor?: boolean };

export type Crosshair = {
  x: number[];
  heading: string[];
  series: Array<{ name: string; tone: Tone; y: number[]; value: string[] }>;
};

/**
 * A chart area. Grid, ticks and every label are HTML; `curves` is SVG drawn in
 * a 0–100 box that stretches with the area while its strokes keep their width.
 */
export function Plot({ label, x, y, xTicks = [], yTicks = [], xTitle, yTitle, curves, crosshair, inset, height, children }: {
  label: string;
  x: Scale;
  y: Scale;
  xTicks?: Tick[];
  yTicks?: Tick[];
  xTitle?: string;
  yTitle?: string;
  curves?: ReactNode;
  crosshair?: Crosshair;
  inset?: { top?: number; right?: number; bottom?: number; left?: number };
  height?: string;
  children?: ReactNode;
}) {
  const style = {
    "--pt": inset?.top !== undefined ? `${inset.top}px` : undefined,
    "--pr": inset?.right !== undefined ? `${inset.right}px` : undefined,
    "--pb": inset?.bottom !== undefined ? `${inset.bottom}px` : undefined,
    "--pl": inset?.left !== undefined ? `${inset.left}px` : undefined,
    "--plot-h": height,
  } as CSSProperties;
  return (
    <div className={styles.plot} style={style} role="img" aria-label={label}>
      {yTitle && <span className={`${styles.pill} ${styles.yTitle}`} aria-hidden="true"><Tx>{yTitle}</Tx></span>}
      <div
        className={`${styles.area} ${crosshair ? styles.crosshair : ""}`}
        data-crosshair={crosshair ? JSON.stringify(crosshair) : undefined}
        aria-hidden="true"
      >
        {yTicks.map((tick, index) => <span key={`gy${index}`} className={styles.gridY} data-solid={tick.solid ? "" : undefined} style={{ top: `${100 - y(tick.at)}%` }} />)}
        {xTicks.map((tick, index) => <span key={`gx${index}`} className={styles.gridX} data-solid={tick.solid ? "" : undefined} style={{ left: `${x(tick.at)}%` }} />)}
        {yTicks.map((tick, index) => <span key={`ty${index}`} className={styles.tickY} style={{ top: `${100 - y(tick.at)}%` }}>{tick.label}</span>)}
        {xTicks.map((tick, index) => <span key={`tx${index}`} className={styles.tickX} data-edge={tick.edge} data-minor={tick.minor ?? (xTicks.length >= 4 && index % 2 === 1) ? "" : undefined} style={{ left: `${x(tick.at)}%` }}>{tick.label}</span>)}
        {curves && <svg className={styles.curves} viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">{curves}</svg>}
        {children}
      </div>
      {xTitle && <span className={`${styles.pill} ${styles.xTitle}`} aria-hidden="true"><Tx>{xTitle}</Tx></span>}
    </div>
  );
}

export function Dot({ left, top, tone: color = "ink", ring, tip, className }: { left: number; top: number; tone?: Tone; ring?: boolean; tip?: string; className?: string }) {
  return <span className={`${styles.dot} ${styles[color]} ${className ?? ""}`} data-ring={ring ? "" : undefined} data-tip={tip} style={{ left: `${left}%`, top: `${top}%` }} />;
}

/**
 * A label pinned to a point of the area. `anchor` names the side of the label
 * box that sits on the point: "left" puts the label to the right of it.
 */
export function Mark({ left, top, anchor = "left", tone: color = "ink", strong, wrap, tag, children, className }: {
  left: number;
  top: number;
  anchor?: "left" | "right" | "top" | "bottom" | "center" | "top-left" | "bottom-left" | "top-right" | "bottom-right";
  tone?: Tone;
  strong?: boolean;
  wrap?: boolean;
  tag?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const offsets: Record<string, [string, string]> = {
    left: ["8px", "-50%"],
    right: ["calc(-100% - 8px)", "-50%"],
    top: ["-50%", "8px"],
    bottom: ["-50%", "calc(-100% - 8px)"],
    center: ["-50%", "-50%"],
    "top-left": ["0%", "6px"],
    "bottom-left": ["0%", "calc(-100% - 6px)"],
    "top-right": ["-100%", "6px"],
    "bottom-right": ["-100%", "calc(-100% - 6px)"],
  };
  const [ax, ay] = offsets[anchor];
  return (
    <span
      className={`${styles.mark} ${styles[color]} ${strong ? styles.markStrong : ""} ${className ?? ""}`}
      data-wrap={wrap ? "" : undefined}
      data-tag={tag ? "" : undefined}
      style={{ left: `${left}%`, top: `${top}%`, "--ax": ax, "--ay": ay } as CSSProperties}
    >
      {typeof children === "string" ? <Tx>{children}</Tx> : children}
    </span>
  );
}

/* ---------- Bar rows: label | track | value, sharing one horizontal scale ---------- */

export function Bars({ label, stack, labelWidth, valueWidth, children, className }: {
  label: string;
  stack?: boolean | "narrow";
  labelWidth?: string;
  valueWidth?: string;
  children: ReactNode;
  className?: string;
}) {
  const style = { "--label-w": labelWidth, "--value-w": valueWidth } as CSSProperties;
  return <div className={`${styles.bars} ${className ?? ""}`} data-stack={stack === "narrow" ? "narrow" : stack ? "always" : undefined} style={style} role="img" aria-label={label}>{children}</div>;
}

export type Rule = { at: number; tone?: "ink" | "soft" | "accent" };

export function BarRow({ label, value, valueNote, grid = [], rules = [], rowClass, children }: {
  label: ReactNode;
  value?: ReactNode;
  valueNote?: ReactNode;
  grid?: number[];
  rules?: Rule[];
  rowClass?: string;
  children?: ReactNode;
}) {
  return <>
    <div className={`${styles.barLabel} ${rowClass ?? ""}`}><span className={styles.labelText}>{typeof label === "string" ? <Tx>{label}</Tx> : label}</span></div>
    <div className={`${styles.track} ${rowClass ?? ""}`}>
      {grid.map((left, index) => <span key={`g${index}`} className={styles.gridX} style={{ left: `${left}%` }} />)}
      {rules.map((rule, index) => <span key={`r${index}`} className={styles.rule} data-tone={rule.tone === "ink" ? undefined : rule.tone} style={{ left: `${rule.at}%` }} />)}
      {children}
    </div>
    <div className={`${styles.value} ${rowClass ?? ""}`}>{typeof value === "string" ? <Tx>{value}</Tx> : value}{valueNote && <small>{typeof valueNote === "string" ? <Tx>{valueNote}</Tx> : valueNote}</small>}</div>
  </>;
}

/** Labels for the dashed reference rules, set above the first row. */
export function BarHeader({ marks }: { marks: Array<{ at: number; label: string; tone?: Tone; anchor?: "left" | "right" | "center" }> }) {
  return <>
    <div className={styles.spacer} />
    <div className={styles.barHeader}>
      {marks.map((mark, index) => (
        <span key={index} className={`${styles.headerMark} ${styles[mark.tone ?? "ink"]}`} data-anchor={mark.anchor ?? "center"} style={{ left: `${mark.at}%` }}><Tx>{mark.label}</Tx></span>
      ))}
    </div>
    <div />
  </>;
}

export function BarAxis({ x, ticks, title }: { x: Scale; ticks: Tick[]; title?: string }) {
  return <>
    <div className={styles.spacer} />
    <div className={styles.axis}>
      {ticks.map((tick, index) => {
        const left = x(tick.at);
        const edge = tick.edge ?? (left < 5 ? "start" : left > 95 ? "end" : undefined);
        return <span key={index} className={styles.tickX} data-edge={edge} data-minor={tick.minor ?? (ticks.length >= 4 && index % 2 === 1) ? "" : undefined} style={{ left: `${left}%` }}>{tick.label}</span>;
      })}
    </div>
    <div />
    {title && <div className={styles.axisTitle}><span className={styles.pill}><Tx>{title}</Tx></span></div>}
  </>;
}

export function Seg({ x, from, to, tone: color, hatch, tip, className }: { x: Scale; from: number; to: number; tone: Tone; hatch?: boolean; tip?: string; className?: string }) {
  return <span className={`${styles.seg} ${styles[color]} ${className ?? ""}`} data-hatch={hatch ? "" : undefined} data-tip={tip} style={{ left: `${x(from)}%`, width: `${Math.max(x(to) - x(from), 0)}%` }} />;
}

export function Range({ x, from, to, tone: color, tip, className }: { x: Scale; from: number; to: number; tone: Tone; tip?: string; className?: string }) {
  return <span className={`${styles.range} ${styles[color]} ${className ?? ""}`} data-tip={tip} style={{ left: `${x(from)}%`, width: `${Math.max(x(to) - x(from), 0)}%` }} />;
}

/** Format a number for a chart label without changing its value's meaning. */
export function fixed(value: number, digits: number) {
  return value.toFixed(digits).replace(/^-/u, "−");
}

export function grouped(value: number) {
  return value.toLocaleString("en-US");
}

/** Standard normal CDF (Abramowitz–Stegun 7.1.26 on erf, error below 1.5e-7). */
export function normalCdf(value: number) {
  const z = Math.abs(value) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * z);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-z * z);
  return value >= 0 ? (1 + erf) / 2 : (1 - erf) / 2;
}
