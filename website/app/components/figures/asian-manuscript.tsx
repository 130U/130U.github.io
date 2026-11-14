import type { ReactNode } from "react";
import data from "../../../content/selected-research/certified-valuation-of-arithmetic-asian-options.figures.json";
import { cubicLaw, kinkBoundPerStrike } from "../../lib/content/asian-kink-bound";
import type { ManuscriptFigureProps } from "./dependence-manuscript";
import { Dot, Figure, Mark, Plot, fixed, grouped, linear, logarithmic, path, styles as kit, type Crosshair } from "./kit";
import styles from "./Figures.module.css";

/* The four figures of "Certified Valuation of Arithmetic Asian Options", drawn
   natively. Figures 1, 3 and 4 plot the study results of
   130U/certified-valuation-arithmetic-asian-options at the pinned source
   commit (studies/results/gap-profile.json and euler-ladder.json), as
   scripts/import-selected-research.mjs extracts them; Figure 2 evaluates
   Proposition 4.1. Captions stay the manuscript's own. */

type Pair = readonly [number, number];
type Triple = readonly [number, number, number];
const pairs = (rows: number[][]) => rows.map(([first, second]): Pair => [first, second]);
const triples = (rows: number[][]) => rows.map(([first, second, third]): Triple => [first, second, third]);

const SUPERSCRIPT: Record<string, string> = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };

/** A value in scientific notation for a readout, such as 1.15 × 10⁻⁶. */
function scientific(value: number, digits = 2) {
  const [mantissa, exponent] = value.toExponential(digits).split("e");
  return `${mantissa.replace(/^-/u, "−")} × 10${[...String(Number(exponent))].map((glyph) => SUPERSCRIPT[glyph]).join("")}`;
}

const power = (exponent: number): ReactNode => <>10<sup>{String(exponent).replace(/^-/u, "−")}</sup></>;
const powerTicks = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => ({ at: 10 ** (from + index), label: power(from + index) }));

/* ---------- Figure 1: where exercising on the geometric average goes wrong ---------- */

function DisagreementFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const { strike, points } = data.disagreement;
  const [low, high] = data.disagreement.window as [number, number];
  const [floor, ceiling] = [-0.9, 2.2];
  const x = linear(low, high);
  const y = linear(floor, ceiling);
  const paths = pairs(points);
  // The strike separates the proxy cG from A on the paths inside the two wedges.
  const separated = ([proxy, average]: Pair) => (proxy > strike) !== (average > strike);
  const scatter = paths.filter((point) => !separated(point))
    .map(([proxy, average]) => `M${x(proxy).toFixed(2)},${(100 - y(average - proxy)).toFixed(2)}h0`).join("");
  return (
    <Figure
      id="asian-disagreement"
      caption={caption}
      manuscript={manuscript}
      legend={[
        { label: "Proxy says no, option in the money: forgo $A-K$", tone: "accent", shape: "dot" },
        { label: "Proxy says yes, option out of the money: lose $K-A$", tone: "ink", shape: "dot" },
        { label: "Both rules agree", tone: "steel", shape: "dot" },
        { label: "The strike separates $cG$ from $A$", tone: "accent", shape: "tint" },
      ]}
    >
      <Plot
        label={`Simulated paths with the scaled geometric average cG between ${low} and ${high}, plotted against the basis A minus cG, at strike ${strike}. The strike separates cG from A on the paths inside two wedges that meet at the strike: above the axis, where the proxy is below the strike and the option is in the money, and below it, where the proxy is above the strike and the option is out of the money.`}
        x={x}
        y={y}
        height="clamp(260px, 58cqi, 340px)"
        xTicks={[88, 90, 92, 94, 96, 98, 100, 102].map((at) => ({ at, label: String(at), edge: at === low ? "start" as const : at === high ? "end" as const : undefined }))}
        yTicks={[0, 1, 2].map((at) => ({ at, label: String(at), solid: at === 0 }))}
        yTitle="Basis $A-cG$"
        xTitle="Scaled geometric average $cG$"
        curves={<>
          <path className={styles.rangeFill} data-fill="" d={path([[strike, 0], [strike, ceiling], [strike - ceiling, ceiling]], x, y, true)} />
          <path className={styles.rangeFill} data-fill="" d={path([[strike, 0], [strike - floor, floor], [strike, floor]], x, y, true)} />
          <path className={kit.steel} data-scatter="" d={scatter} />
          <path className={kit.ink} data-dash="" d={path([[strike - ceiling, ceiling], [strike - floor, floor]], x, y)} />
          <path className={kit.ink} d={path([[strike, floor], [strike, ceiling]], x, y)} />
        </>}
      >
        {paths.filter(separated).map(([proxy, average]) => (
          <Dot
            key={`${proxy}-${average}`}
            left={x(proxy)}
            top={100 - y(average - proxy)}
            tone={proxy > strike ? "ink" : "accent"}
            className={`${styles.pathDot} ${kit.fade}`}
            tip={`cG = ${proxy.toFixed(2)}, A = ${average.toFixed(2)}\n${proxy > strike ? `Lost K − A = ${(strike - average).toFixed(2)}` : `Forgone A − K = ${(average - strike).toFixed(2)}`}`}
          />
        ))}
        <Mark left={x(strike)} top={0} anchor="below-right" className={kit.fade}>$cG=K$</Mark>
        <Mark left={x(strike - 1.9)} top={100 - y(1.9)} anchor="right" className={kit.fade}>$A=K$</Mark>
      </Plot>
    </Figure>
  );
}

/* ---------- Figure 2: the cubic law ---------- */

const OIL_VARIANCE = 49 / 400;
const DAYS_PER_MONTH = 21;
const LEAD_DAYS = [1, 2, 3, 5, 10, 21, 42, 63, 84, 105, 126, 189, 252, 378, 504];
const WINDOWS = [
  { fixings: 21, name: "One month, 21 fixings", tone: "accent" },
  { fixings: 63, name: "One quarter, 63 fixings", tone: "sky" },
  { fixings: 252, name: "One year, 252 fixings", tone: "ink" },
] as const;
// Table 1: the crude oil calls struck at 70, by lead time in months, with their proved bounds.
const OIL_STRIKE = 70;
const OIL_CALLS = [
  { months: 1, bound: "0.0000805" },
  { months: 3, bound: "0.0000462" },
  { months: 6, bound: "0.0000324" },
  { months: 12, bound: "0.0000224" },
] as const;

function leadName(days: number) {
  if (days < DAYS_PER_MONTH) return `${days} trading ${days === 1 ? "day" : "days"} ahead`;
  const months = days / DAYS_PER_MONTH;
  return `${months} ${months === 1 ? "month" : "months"} ahead`;
}

function CubicLawFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const x = logarithmic(0.045, 26);
  const y = logarithmic(1.5e-7, 2e-3);
  const months = (days: number) => days / DAYS_PER_MONTH;
  const curves = WINDOWS.map((window) => ({
    ...window,
    bound: LEAD_DAYS.map((days) => kinkBoundPerStrike(days, window.fixings, OIL_VARIANCE)),
    law: LEAD_DAYS.map((days) => cubicLaw(days, window.fixings, OIL_VARIANCE)),
  }));
  const line = (values: number[]) => path(values.map((value, index) => [months(LEAD_DAYS[index]), value] as const), x, y);
  const cent = 0.01 / OIL_STRIKE;
  const crosshair: Crosshair = {
    x: LEAD_DAYS.map((days) => x(months(days))),
    heading: LEAD_DAYS.map(leadName),
    series: curves.map((curve) => ({ name: curve.name, tone: curve.tone, y: curve.bound.map((value) => y(value)), value: curve.bound.map((value) => scientific(value)) })),
  };
  return (
    <Figure
      id="asian-cubic-law"
      caption={caption}
      manuscript={manuscript}
      legend={[
        ...WINDOWS.map((window) => ({ label: window.name, tone: window.tone, shape: "line" as const })),
        { label: "Leading term (4.4)", tone: "ink", shape: "dotted" },
        { label: "Crude oil options of Table 1", tone: "accent", shape: "dot" },
        { label: "One cent on a 70-dollar barrel", tone: "steel", shape: "dash" },
      ]}
    >
      <Plot
        label="The bound on the cost of the kink per unit of strike in Black's model at 35 percent volatility, against the time before the first fixing from one day to 24 months, on logarithmic scales, for averaging windows of one month, one quarter and one year. Each curve falls with the square root of the lead time and lies close to its leading term. The one-month curve passes through the four crude oil options of Table 1, two orders of magnitude below one cent on a 70-dollar barrel; the one-year curve crosses that level."
        x={x}
        y={y}
        height="clamp(270px, 60cqi, 350px)"
        xTicks={[
          { at: months(1), label: "1 day", edge: "start" },
          { at: months(5), label: "1 week" },
          ...[1, 3, 6, 12].map((at) => ({ at, label: String(at) })),
          { at: 24, label: "24", edge: "end" },
        ]}
        yTicks={powerTicks(-6, -3)}
        yTitle="Bound per unit of strike"
        xTitle="Time before the first fixing, months"
        crosshair={crosshair}
        curves={<>
          <path className={kit.steel} data-dash="" d={path([[0.045, cent], [26, cent]], x, y)} />
          {curves.map((curve) => <path key={`law-${curve.fixings}`} className={kit[curve.tone]} data-dotted="" d={line(curve.law)} />)}
          {curves.map((curve) => <path key={curve.fixings} className={kit[curve.tone]} d={line(curve.bound)} />)}
        </>}
      >
        {OIL_CALLS.map((call) => (
          <Dot
            key={call.months}
            left={x(call.months)}
            top={100 - y(Number(call.bound) / OIL_STRIKE)}
            tone="accent"
            className={kit.fade}
            tip={`Crude oil call, ${call.months} ${call.months === 1 ? "month" : "months"} ahead\nBound ${call.bound} on a strike of ${OIL_STRIKE}`}
          />
        ))}
      </Plot>
    </Figure>
  );
}

/* ---------- Figure 3: the cost of the kink across strikes ---------- */

function ProfileFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const { logBound, quadraticBound } = data.profile;
  const rows = triples(data.profile.rows);
  const base = 2e-10;
  const x = logarithmic(55, 190);
  const y = logarithmic(base, 4e-4);
  // A falling curve ends where it meets the base of the plot.
  const aboveBase = (points: ReadonlyArray<Pair>) => {
    const kept: Pair[] = [];
    for (const [index, [strike, value]] of points.entries()) {
      if (value >= base) { kept.push([strike, value]); continue; }
      const [before, above] = points[index - 1];
      const share = Math.log(above / base) / Math.log(above / value);
      kept.push([before * (strike / before) ** share, base]);
      break;
    }
    return kept;
  };
  const cost = aboveBase(rows.map(([strike, value]) => [strike, value / strike]));
  const secondOrder = aboveBase(rows.map(([strike, , value]) => [strike, value / strike]));
  const bound = rows.map(([strike]): Pair => [strike, Math.min(logBound, quadraticBound / strike ** 2)]);
  const read = rows.filter(([strike, value, term]) => value / strike >= base && term / strike >= base);
  const crosshair: Crosshair = {
    x: read.map(([strike]) => x(strike)),
    heading: read.map(([strike]) => `K = ${strike.toFixed(1)}`),
    series: [
      { name: "Bound", tone: "ink", y: read.map(([strike]) => y(Math.min(logBound, quadraticBound / strike ** 2))), value: read.map(([strike]) => scientific(Math.min(logBound, quadraticBound / strike ** 2))) },
      { name: "Cost of the kink", tone: "accent", y: read.map(([strike, value]) => y(value / strike)), value: read.map(([strike, value]) => scientific(value / strike)) },
    ],
  };
  return (
    <Figure
      id="asian-profile"
      caption={caption}
      manuscript={manuscript}
      legend={[
        { label: "Cost of the kink, $R_c(K)/K$", tone: "accent", shape: "line" },
        { label: "Second-order term of (3.8)", tone: "ink", shape: "dotted" },
        { label: "Theorem 3.3, the smaller of its two bounds", tone: "ink", shape: "line" },
        { label: "Conservation law (3.4)", tone: "accent", shape: "tint" },
      ]}
    >
      <Plot
        label="The cost of the kink per unit of strike across strikes from 55 to 190, on logarithmic scales, for the twelve-fixing Heston contract. The cost peaks near strike 77 and falls steeply above 140; the second-order term follows it closely; the smaller of the two bounds of Theorem 3.3 lies above both at every strike. Dashed rules mark the strikes 95 and 110 of the spread."
        x={x}
        y={y}
        height="clamp(270px, 60cqi, 350px)"
        xTicks={[60, 80, 95, 110, 140, 180].map((at) => ({ at, label: String(at), minor: at === 80 || at === 140 }))}
        yTicks={powerTicks(-9, -4)}
        yTitle="Per unit of strike"
        xTitle="Strike $K$, logarithmic scale"
        crosshair={crosshair}
        curves={<>
          <path className={styles.rangeFill} data-fill="" d={path([...cost, [cost[0][0], base]], x, y, true)} />
          <path className={kit.ink} d={path(bound, x, y)} />
          <path className={kit.accent} d={path(cost, x, y)} />
          <path className={kit.ink} data-dotted="" d={path(secondOrder, x, y)} />
        </>}
      >
        {[95, 110].map((strike) => <span key={strike} className={styles.vline} style={{ left: `${x(strike)}%` }} />)}
      </Plot>
    </Figure>
  );
}

/* ---------- Figure 4: three sizes of Euler error ---------- */

// Table 5: the larger endpoint, in absolute value, of each proved interval for the Euler gap.
const PROVED_GAP = [
  { steps: 384, bound: "0.014169989568" },
  { steps: 768, bound: "0.011024692273" },
  { steps: 1536, bound: "0.010967952032" },
] as const;

function EulerLadderFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const { firstOrder, certified } = data.ladder;
  const rungs = pairs(data.ladder.rungs);
  const kink = triples(data.ladder.kink);
  const x = logarithmic(9, 33000);
  const y = logarithmic(3e-8, 5e-2);
  const [first, last] = [rungs[0][0], rungs[rungs.length - 1][0]];
  return (
    <Figure
      id="asian-euler-ladder"
      caption={caption}
      manuscript={manuscript}
      legend={[
        { label: "Bias of the proxy value, sign reversed", tone: "accent", shape: "ring" },
        { label: "The same, from the certified finite sums", tone: "accent", shape: "dot" },
        { label: "Proved bound on the Euler gap of the option", tone: "ink", shape: "square" },
        { label: "Simulated change in the cost of the kink", tone: "steel", shape: "triangle" },
        { label: "First-order term of (6.4), $0.15563\\,h$", tone: "steel", shape: "dash" },
      ]}
    >
      <Plot
        label="Three sizes of Euler error against the number of Euler steps per year, on logarithmic scales. The bias of the proxy value halves with each halving of the step and follows the first-order line across the ladder of twelve steps. The proved bounds on the Euler gap of the option at 384, 768 and 1,536 steps lie between 0.010 and 0.015, well above the bias. The simulated changes in the cost of the kink at 192 to 1,536 steps lie near one millionth, well below it."
        x={x}
        y={y}
        height="clamp(270px, 60cqi, 350px)"
        xTicks={[12, 48, 192, 768, 3072, 12288].map((at) => ({ at, label: grouped(at), minor: at !== 12 && at !== 768 && at !== 12288 }))}
        yTicks={powerTicks(-7, -2)}
        yTitle="Price units"
        xTitle="Euler steps per year"
        curves={<path className={kit.steel} data-dash="" d={path([[first, -firstOrder / first], [last, -firstOrder / last]], x, y)} />}
      >
        {kink.map(([steps, change, error]) => (
          <Dot
            key={`kink-${steps}`}
            left={x(steps)}
            top={100 - y(Math.abs(change) + 2 * error)}
            tone="steel"
            shape="triangle"
            className={kit.fade}
            tip={`${grouped(steps)} steps per year\nChange in the cost of the kink ${scientific(change, 1)}\nStandard error ${scientific(error, 1)}`}
          />
        ))}
        {rungs.map(([steps, bias]) => (
          <Dot
            key={`bias-${steps}`}
            left={x(steps)}
            top={100 - y(-bias)}
            tone="accent"
            ring={!certified.includes(steps)}
            className={kit.fade}
            tip={`${grouped(steps)} steps per year\nBias of the proxy value ${fixed(bias, 9)}`}
          />
        ))}
        {PROVED_GAP.map(({ steps, bound }) => (
          <Dot
            key={`proved-${steps}`}
            left={x(steps)}
            top={100 - y(Number(bound))}
            tone="ink"
            shape="square"
            className={kit.fade}
            tip={`${grouped(steps)} steps per year\nProved bound on the Euler gap ${bound}`}
          />
        ))}
      </Plot>
    </Figure>
  );
}

export const asianManuscriptFigures = {
  "asian-disagreement": DisagreementFigure,
  "asian-cubic-law": CubicLawFigure,
  "asian-profile": ProfileFigure,
  "asian-euler-ladder": EulerLadderFigure,
} as const;
