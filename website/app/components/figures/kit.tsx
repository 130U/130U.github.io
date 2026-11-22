import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { ArticleInline } from "../../lib/content/article-headings";
import { InlineContent, InlineMarkdown, KeepRanges } from "../research/ResearchInline";
import { ZoomGlyph } from "../ZoomGlyph";
import zoomStyles from "../research/Stage.module.css";
import { digitRuns, hasLongFraction } from "./digit-runs";
import styles from "./Figure.module.css";

export { styles };

type Tone = "ink" | "accent" | "sky" | "steel" | "mist" | "green";
export type View = { id: string; label: ReactNode };
type LegendItem = { label: ReactNode; tone: Tone; shape?: "square" | "line" | "thick" | "dash" | "dotted" | "dot" | "ring" | "triangle" | "hatch" | "box" | "tint" | "range" };

/**
 * Figure text whose numbers of five or more digits after the point stand in
 * the groups a research table sets, parted by TeX's thin space through spans
 * alone, so the text copied is the manuscript's.
 */
export function Digits({ text }: { text: string }) {
  return <>{digitRuns(text).map((run, index) => (run.group ? <span key={index} className={styles.digitGroup} data-digit-group="">{run.text}</span> : run.text))}</>;
}

/** Short copy that may contain inline TeX in the manuscripts' `$...$` form; a
    long number in plain copy stands in digit groups. */
export function Tx({ children }: { children: string }) {
  if (children.includes("$")) return <InlineMarkdown text={children} />;
  return hasLongFraction(children) ? <Digits text={children} /> : <KeepRanges text={children} />;
}

/** A figure's title, each hyphenated compound held on one line, so a word
    such as "three-month" never breaks at its hyphen. A title may wrap. */
function Title({ text }: { text: string }) {
  if (text.includes("$")) return <Tx>{text}</Tx>;
  return <>{text.split(/(\S+-\S+)/u).map((part, index) => (index % 2 ? <span key={index} className={styles.keep}>{part}</span> : <KeepRanges key={index} text={part} />))}</>;
}

const FIGURE_LABEL = /^(Figure \d+\.)\s*/u;

/**
 * A manuscript caption with its "Figure N." set as the label all three papers
 * share. The rest reads as one caption, so emphasis on its opening words
 * belongs to the label alone.
 */
export function FigureCaption({ inlines }: { inlines: ArticleInline[] }) {
  const [first, ...rest] = inlines;
  const lead = first?.type === "strong" ? first.inlines[0] : first;
  const match = lead?.type === "text" ? FIGURE_LABEL.exec(lead.text) : null;
  if (!match || lead?.type !== "text") return <InlineContent inlines={inlines} />;
  const remainder = (text: string): ArticleInline[] => (text ? [{ type: "text", text }] : []);
  const body: ArticleInline[] = first.type === "strong"
    ? [...remainder(lead.text.slice(match[0].length)), ...first.inlines.slice(1), ...rest]
    : [...remainder(lead.text.slice(match[0].length)), ...rest];
  return <><span className={styles.captionLabel} data-figure-label>{match[1]}</span> <InlineContent inlines={body} /></>;
}

const tone = (value: Tone) => styles[value];

/**
 * Text in a figure holds one line, except a title and prose: a sentence, a
 * question, a node's description. A panel's title and prose carry this
 * attribute (the figure's own title carries data-figure-title), and the
 * browser layout check holds every other text of a figure to one line.
 */
export const wraps = { "data-figure-wraps": "" } as const;

/** A class list of the names given, leaving out absent ones. */
export const classes =(...names: (string | false | undefined)[]) => names.filter(Boolean).join(" ");

/**
 * The shared figure frame. A figure with views renders every panel on the
 * server; the controller reveals the switch and swaps panels, and without
 * JavaScript the default panel stays visible.
 *
 * The site's own figures carry their title and caption. A manuscript figure
 * (`manuscript`) takes the manuscript's caption, passed as rendered inline
 * content, and its block anchor and marker attributes.
 */
export function Figure({ id, title, caption, views, defaultView, viewsLabel, legend, children, className, manuscript }: {
  id: string;
  title?: string;
  caption: string | ReactNode;
  views?: View[];
  defaultView?: string;
  viewsLabel?: string;
  legend?: LegendItem[];
  children: ReactNode;
  className?: string;
  manuscript?: { anchor?: string; captionId: string; attributes: Record<string, string | number> };
}) {
  const view = defaultView ?? views?.[0]?.id;
  const identity = manuscript
    ? { id: manuscript.anchor, "data-manuscript-figure": id, ...manuscript.attributes }
    : { id: `figure-${id}`, "data-article-figure": id };
  return (
    <figure className={classes(styles.figure, className)} {...identity} data-figure={id} data-view={view}>
      <div className={styles.frame}>
        <button type="button" className={`${zoomStyles.control} ${styles.zoom}`} data-figure-zoom aria-label="Zoom in" aria-haspopup="dialog" hidden><ZoomGlyph /></button>
        {(title || views) && (
          <div className={styles.head}>
            {title && <p className={styles.title} data-figure-title><Title text={title} /></p>}
            {views && (
              <div className={styles.switch} role="group" aria-label={viewsLabel ?? "Figure view"} data-fig-switch data-count={views.length} hidden>
                {views.map((item) => <button key={item.id} type="button" data-fig-view={item.id} aria-pressed={item.id === view}>{item.label}</button>)}
              </div>
            )}
          </div>
        )}
        {children}
        {legend && <Legend items={legend} />}
      </div>
      <figcaption className={styles.caption} id={manuscript?.captionId}>{typeof caption === "string" ? <Tx>{caption}</Tx> : caption}</figcaption>
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
        <li key={index}><span className={`${styles.swatch} ${tone(item.tone)}`} data-shape={item.shape ?? "square"} /><span>{typeof item.label === "string" ? <Tx>{item.label}</Tx> : item.label}</span></li>
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

/** An axis tick. `grid: false` keeps its label but draws no grid line, where a
    reference rule drawn at that value stands in for it. */
type Tick = { at: number; label: ReactNode; solid?: boolean; edge?: "start" | "end"; minor?: boolean; grid?: boolean };

/**
 * Whether a narrow axis may hide a tick: one marked minor, or, on seven ticks
 * or more, every other interior tick, and on an even count the one before the
 * last as well, so no two shown ticks stand a single step apart. An end tick
 * always stays, so the axis keeps the value its scale ends on.
 */
function minorTick(ticks: Tick[], index: number) {
  const last = ticks.length - 1;
  if (index === 0 || index === last) return false;
  return ticks[index].minor ?? (ticks.length >= 7 && (index % 2 === 1 || (last % 2 === 1 && index === last - 1)));
}

export type Crosshair = {
  x: number[];
  heading: string[];
  series: Array<{ name: string; tone: Tone; y: number[]; value: string[] }>;
};

/**
 * A chart area. Grid, ticks and every label are HTML; `curves` is SVG drawn in
 * a 0–100 box that stretches with the area while its strokes keep their width.
 */
export function Plot({ label, x, y, xTicks = [], yTicks = [], xGrid = true, xTitle, yTitle, curves, crosshair, inset, height, children }: {
  label: string;
  x: Scale;
  y: Scale;
  xTicks?: Tick[];
  yTicks?: Tick[];
  xGrid?: boolean;
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
        className={classes(styles.area, crosshair && styles.crosshair)}
        data-crosshair={crosshair ? JSON.stringify(crosshair) : undefined}
        aria-hidden="true"
      >
        {yTicks.map((tick, index) => tick.grid !== false && <span key={`gy${index}`} className={styles.gridY} data-solid={tick.solid ? "" : undefined} style={{ top: `${100 - y(tick.at)}%` }} />)}
        {xGrid && xTicks.map((tick, index) => tick.grid !== false && <span key={`gx${index}`} className={styles.gridX} data-solid={tick.solid ? "" : undefined} style={{ left: `${x(tick.at)}%` }} />)}
        {yTicks.map((tick, index) => <span key={`ty${index}`} className={styles.tickY} style={{ top: `${100 - y(tick.at)}%` }}>{tick.label}</span>)}
        {xTicks.map((tick, index) => <span key={`tx${index}`} className={styles.tickX} data-edge={tick.edge} data-minor={minorTick(xTicks, index) ? "" : undefined} style={{ left: `${x(tick.at)}%` }}>{tick.label}</span>)}
        {curves && <svg className={styles.curves} viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">{curves}</svg>}
        {children}
      </div>
      {xTitle && <span className={`${styles.pill} ${styles.xTitle}`} aria-hidden="true"><Tx>{xTitle}</Tx></span>}
    </div>
  );
}

export function Dot({ left, top, tone: color = "ink", ring, shape, tip, className }: { left: number; top: number; tone?: Tone; ring?: boolean; shape?: "square" | "triangle"; tip?: string; className?: string }) {
  return <span className={classes(styles.dot, styles[color], className)} data-ring={ring ? "" : undefined} data-shape={shape} data-tip={tip} style={{ left: `${left}%`, top: `${top}%` }} />;
}

/**
 * A label pinned to a point of the area. `anchor` names the side of the label
 * box that sits on the point: "left" puts the label to the right of it. In a
 * plot the label is knocked out of the grid lines behind it; one set on a
 * tinted region, or held clear of a rule by its own padding, is drawn without
 * a knockout (`knockout={false}`) and stands clear of the lines instead. A
 * label holds one line: where it lacks room, the figure places it elsewhere,
 * shortens it to its value (`Wide`) or keys it in a narrow layout.
 */
export function Mark({ left, top, anchor = "left", tone: color = "ink", strong, tag, knockout = true, children, className, style }: {
  left: number;
  top: number;
  anchor?: "left" | "right" | "top" | "bottom" | "center" | "top-left" | "bottom-left" | "top-right" | "bottom-right" | "above-right" | "above-left" | "below-right" | "below-left";
  tone?: Tone;
  strong?: boolean;
  tag?: boolean;
  knockout?: boolean;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
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
    // Diagonal anchors clear a dot on a falling or rising curve.
    "above-right": ["5px", "calc(-100% - 5px)"],
    "above-left": ["calc(-100% - 5px)", "calc(-100% - 5px)"],
    "below-right": ["5px", "5px"],
    "below-left": ["calc(-100% - 5px)", "5px"],
  };
  const [ax, ay] = offsets[anchor];
  return (
    <span
      className={classes(styles.mark, styles[color], strong && styles.markStrong, className)}
      data-tag={tag ? "" : undefined}
      data-bare={knockout ? undefined : ""}
      style={{ ...style, left: `${left}%`, top: `${top}%`, "--ax": ax, "--ay": ay } as CSSProperties}
    >
      {typeof children === "string" ? <Tx>{children}</Tx> : children}
    </span>
  );
}

/* ---------- Bar rows: label | track | value, sharing one horizontal scale ----------
   Each row is one subgrid line, so labels, tracks and values align across rows.
   Stacked rows set the label and value on one line above a full-width track. */

export function Bars({ label, stack, labelWidth, valueWidth, children, className }: {
  label: string;
  stack?: boolean | "narrow";
  labelWidth?: string;
  valueWidth?: string;
  children: ReactNode;
  className?: string;
}) {
  const style = { "--label-w": labelWidth, "--value-w": valueWidth } as CSSProperties;
  return <div className={classes(styles.bars, className)} data-stack={stack === "narrow" ? "narrow" : stack ? "always" : undefined} style={style} role="img" aria-label={label}>{children}</div>;
}

type Rule = { at: number; tone?: "ink" | "soft" | "accent" };

/** Grid lines that keep clear of the reference rules: one within five percent
    of the scale of a rule gives way to it, so the two never read as one doubled
    line. The tick label stays. */
export function clearOf(grid: number[], rules: ReadonlyArray<{ at: number }>) {
  return grid.filter((left) => rules.every((rule) => Math.abs(rule.at - left) >= 5));
}

/** Grid lines behind a row's bar, and reference rules through the whole row:
    in a stacked figure a rule runs on through the label and value lines,
    behind their knocked-out text, up to the header that names it. */
function Lines({ grid, rules }: { grid: number[]; rules: Rule[] }) {
  return <>
    <span className={styles.lines} aria-hidden="true">
      {clearOf(grid, rules).map((left, index) => <span key={index} className={styles.gridX} style={{ left: `${left}%` }} />)}
    </span>
    {rules.length > 0 && <span className={styles.rules} aria-hidden="true">
      {rules.map((rule, index) => <span key={index} className={styles.rule} data-tone={rule.tone === "ink" ? undefined : rule.tone} style={{ left: `${rule.at}%` }} />)}
    </span>}
  </>;
}

export function BarRow({ label, value, valueNote, grid = [], rules = [], rowClass, children }: {
  label: ReactNode;
  value?: ReactNode;
  valueNote?: ReactNode;
  grid?: number[];
  rules?: Rule[];
  rowClass?: string;
  children?: ReactNode;
}) {
  return (
    <div className={classes(styles.row, rowClass)}>
      <Lines grid={grid} rules={rules} />
      <div className={styles.barLabel}><span className={styles.labelText}>{typeof label === "string" ? <Tx>{label}</Tx> : label}</span></div>
      <div className={styles.track}>{children}</div>
      {(value !== undefined || valueNote !== undefined) && <div className={styles.value}>
        {value !== undefined && <span>{typeof value === "string" ? <Tx>{value}</Tx> : value}</span>}
        {valueNote !== undefined && <small>{typeof valueNote === "string" ? <Tx>{valueNote}</Tx> : valueNote}</small>}
      </div>}
    </div>
  );
}

/** A group's name above its rows; the reference rules run on through it. */
export function BarGroup({ label, rules = [] }: { label: string; rules?: Rule[] }) {
  return (
    <div className={classes(styles.row, styles.group)}>
      <Lines grid={[]} rules={rules} />
      <p className={styles.groupLabel}><span className={styles.labelText}><Tx>{label}</Tx></span></p>
    </div>
  );
}

/**
 * Names above the first row: a column's head, which starts or ends at its
 * position, or a reference rule's name, which stands beside the top of its
 * rule (`rule`), 6px clear of it on the anchored side, or centered over it.
 */
export function BarHeader({ marks }: { marks: Array<{ at: number; label: string; tone?: Tone; anchor?: "left" | "right" | "center"; rule?: Rule["tone"] }> }) {
  return (
    <div className={styles.row}>
      <div className={styles.barHeader}>
        {marks.map((mark, index) => {
          const anchor = mark.anchor ?? "center";
          return <Fragment key={index}>
            {mark.rule && <span className={styles.rule} data-tone={mark.rule === "ink" ? undefined : mark.rule} data-anchor={anchor} style={{ left: `${mark.at}%` }} />}
            <span className={`${styles.headerMark} ${styles[mark.tone ?? "ink"]}`} data-anchor={anchor} data-rule={mark.rule ? "" : undefined} style={{ left: `${mark.at}%` }}><Tx>{mark.label}</Tx></span>
          </Fragment>;
        })}
      </div>
    </div>
  );
}

export function BarAxis({ x, ticks, title }: { x: Scale; ticks: Tick[]; title?: string }) {
  return <>
    <div className={styles.row}>
      <div className={styles.axis}>
        {ticks.map((tick, index) => {
          const left = x(tick.at);
          const edge = tick.edge ?? (left < 5 ? "start" : left > 95 ? "end" : undefined);
          return <span key={index} className={styles.tickX} data-edge={edge} data-minor={minorTick(ticks, index) ? "" : undefined} style={{ left: `${left}%` }}>{tick.label}</span>;
        })}
      </div>
    </div>
    {title && <div className={styles.axisTitle}><span className={styles.pill}><Tx>{title}</Tx></span></div>}
  </>;
}

/* ---------- Schematic: a fixed-aspect drawing with HTML labels ----------
   The SVG scales uniformly, so arrowheads and angles keep their shape; labels
   are HTML at their true size, placed in percent of the drawing. */

export function Schematic({ label, size, inset, xTitle, yTitle, art, children, className }: {
  label: string;
  size: readonly [number, number];
  inset?: { top?: number; right?: number; bottom?: number; left?: number };
  xTitle?: string;
  yTitle?: string;
  art: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const [width, height] = size;
  const style = {
    "--pt": inset?.top !== undefined ? `${inset.top}px` : undefined,
    "--pr": inset?.right !== undefined ? `${inset.right}px` : undefined,
    "--pb": inset?.bottom !== undefined ? `${inset.bottom}px` : undefined,
    "--pl": inset?.left !== undefined ? `${inset.left}px` : undefined,
  } as CSSProperties;
  return (
    <div className={classes(styles.schematic, className)} style={style} role="img" aria-label={label}>
      {yTitle && <span className={styles.pill} aria-hidden="true"><Tx>{yTitle}</Tx></span>}
      <div className={styles.schematicArea} style={{ aspectRatio: `${width} / ${height}` }} aria-hidden="true">
        <svg className={styles.schematicArt} viewBox={`0 0 ${width} ${height}`} focusable="false">{art}</svg>
        {children}
      </div>
      {xTitle && <span className={styles.pill} aria-hidden="true"><Tx>{xTitle}</Tx></span>}
    </div>
  );
}

/** An arrow in schematic units, with a filled head at its end. */
export function Arrow({ from, to, head = 6, both, className, dash }: { from: readonly [number, number]; to: readonly [number, number]; head?: number; both?: boolean; className?: string; dash?: boolean }) {
  const tip = (end: readonly [number, number], start: readonly [number, number]) => {
    const angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    const wing = (side: number) => [end[0] - head * Math.cos(angle) + side * head * 0.42 * Math.sin(angle), end[1] - head * Math.sin(angle) - side * head * 0.42 * Math.cos(angle)];
    const [a, b] = [wing(1), wing(-1)];
    return `${end[0].toFixed(2)},${end[1].toFixed(2)} ${a[0].toFixed(2)},${a[1].toFixed(2)} ${b[0].toFixed(2)},${b[1].toFixed(2)}`;
  };
  const shorten = (end: readonly [number, number], start: readonly [number, number]) => {
    const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
    const t = (length - head * 0.8) / length;
    return [start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t] as const;
  };
  const end = shorten(to, from);
  const start = both ? shorten(from, to) : from;
  return (
    <g className={className}>
      <line x1={start[0]} y1={start[1]} x2={end[0]} y2={end[1]} data-dash={dash ? "" : undefined} />
      <polygon points={tip(to, from)} data-head="" />
      {both && <polygon points={tip(from, to)} data-head="" />}
    </g>
  );
}

export function Seg({ x, from, to, tone: color, hatch, tip, className }: { x: Scale; from: number; to: number; tone: Tone; hatch?: boolean; tip?: string; className?: string }) {
  return <span className={classes(styles.seg, styles[color], className)} data-hatch={hatch ? "" : undefined} data-tip={tip} style={{ left: `${x(from)}%`, width: `${Math.max(x(to) - x(from), 0)}%` }} />;
}

export function Range({ x, from, to, tone: color, tip, className }: { x: Scale; from: number; to: number; tone: Tone; tip?: string; className?: string }) {
  return <span className={classes(styles.range, styles[color], className)} data-tip={tip} style={{ left: `${x(from)}%`, width: `${Math.max(x(to) - x(from), 0)}%` }} />;
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
