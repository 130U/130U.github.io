import data from "../../../content/selected-research/certified-joint-pricing-errors-in-rough-heston.figures.json";
import { ROUGH_HESTON, forwardVariance, halfShareDamping, herfindahlLevel, nettingRatio, position } from "../../lib/content/rough-heston-curves";
import type { ManuscriptFigureProps } from "./dependence-manuscript";
import { Figure, Mark, Plot, Schematic, Tx, linear, path, styles as kit, type Crosshair } from "./kit";
import styles from "./Figures.module.css";

/* The four figures of "Certified Joint Pricing Errors in Rough Heston", drawn
   natively as scripts/build_figures.py of 130U/certified-rough-heston-valuation
   draws them at the pinned source commit. Figure 1 evaluates the curve (7.1)
   and the series (3.9); Figures 2 to 4 plot the saved banks, as
   scripts/import-selected-research.mjs extracts them, with the netting ratio
   (5.7). Captions stay the manuscript's own. */

type Pair = readonly [number, number];

/* ---------- Figure 1: the price of a unit Riccati residual ---------- */

function ResidualKernelFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const horizon = 0.5;
  const x = linear(0, horizon);
  const y = linear(0.024, 0.042);
  // Both curves steepen toward maturity, so the samples crowd there.
  const elapsed = Array.from({ length: 81 }, (_, index) => horizon * (index / 80) ** 2);
  const curve = (lambda: number) => elapsed.map((t): Pair => [horizon - t, forwardVariance(t, lambda)]).reverse();
  const pricing = curve(0);
  const halfShare = curve(halfShareDamping);
  const read = Array.from({ length: 21 }, (_, index) => (horizon * index) / 20);
  const readout = (lambda: number) => read.map((s) => forwardVariance(horizon - s, lambda));
  const crosshair: Crosshair = {
    x: read.map((s) => x(s)),
    heading: read.map((s) => `s = ${s.toFixed(3)}`),
    series: [
      { name: "Pricing measure", tone: "ink", y: readout(0).map((value) => y(value)), value: readout(0).map((value) => value.toFixed(4)) },
      { name: "Half-share measure", tone: "accent", y: readout(halfShareDamping).map((value) => y(value)), value: readout(halfShareDamping).map((value) => value.toFixed(4)) },
    ],
  };
  return (
    <Figure
      id="rough-residual-kernel"
      caption={caption}
      manuscript={manuscript}
      legend={[
        { label: "Pricing measure, $\\xi(T-s)$", tone: "ink", shape: "line" },
        { label: "Half-share measure, $\\xi^{\\lambda_*}(T-s)$", tone: "accent", shape: "line" },
      ]}
    >
      <Plot
        label="The weight on a unit Riccati residual against the time to maturity at which the residual occurs, over a six-month horizon. Both weights are forward variance curves: the curve under the pricing measure falls from about 0.040 six months before maturity to 0.0262 at maturity, and the curve under the half-share measure lies below it, by about 0.003 at six months."
        x={x}
        y={y}
        height="clamp(250px, 56cqi, 320px)"
        xTicks={[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(1), edge: at === 0 ? "start" as const : at === horizon ? "end" as const : undefined }))}
        yTicks={[0.025, 0.03, 0.035, 0.04].map((at) => ({ at, label: at.toFixed(3) }))}
        yTitle="Weight on a unit residual"
        xTitle="Time to maturity $s$, years"
        crosshair={crosshair}
        curves={<>
          <path className={styles.rangeFill} data-fill="" d={path([...pricing, ...[...halfShare].reverse()], x, y, true)} />
          <path className={kit.accent} d={path(halfShare, x, y)} />
          <path className={kit.ink} d={path(pricing, x, y)} />
        </>}
      />
    </Figure>
  );
}

/* ---------- Figure 2: netting ratios and the node charge by frequency ---------- */

const POSITIONS = [
  { name: "Call spread 4400/4500", tone: "ink", weights: position({ 4400: 1, 4500: -1 }) },
  { name: "Butterfly 4300/4400/4500", tone: "accent", weights: position({ 4300: 1, 4400: -2, 4500: 1 }) },
  { name: "Equal-weight basket, twelve strikes", tone: "sky", weights: ROUGH_HESTON.strikes.map(() => 1 / 12) },
] as const;
const TOP_FREQUENCY = 128;
const BAND = 4;

function NettingRatioFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const { shares } = data.netting;
  const x = linear(0, TOP_FREQUENCY);
  const y = linear(0, 1);
  const frequencies = Array.from({ length: 4 * TOP_FREQUENCY + 1 }, (_, index) => index / 4);
  const profile: Pair[] = [[0, 0], ...shares.flatMap((share, band): Pair[] => [[BAND * band, share], [BAND * (band + 1), share]]), [TOP_FREQUENCY, 0]];
  const read = Array.from({ length: TOP_FREQUENCY / BAND + 1 }, (_, index) => BAND * index);
  const shareAt = (u: number) => shares[Math.min(u / BAND, shares.length - 1)];
  const crosshair: Crosshair = {
    x: read.map((u) => x(u)),
    heading: read.map((u) => `u = ${u}`),
    series: [
      ...POSITIONS.map((item) => ({ name: item.name, tone: item.tone, y: read.map((u) => y(nettingRatio(item.weights, u))), value: read.map((u) => nettingRatio(item.weights, u).toFixed(3)) })),
      { name: `Node charge, band of ${BAND} from u`, tone: "steel" as const, y: read.map((u) => y(shareAt(u))), value: read.map((u) => `${(100 * shareAt(u)).toFixed(1)}%`) },
    ],
  };
  return (
    <Figure
      id="rough-netting-ratio"
      caption={caption}
      manuscript={manuscript}
      legend={[
        ...POSITIONS.map((item) => ({ label: item.name, tone: item.tone, shape: "line" as const })),
        { label: "Herfindahl level of each position, at the right edge", tone: "ink", shape: "square" },
        { label: "Share of the leg-by-leg node charge by band of four, on the same scale", tone: "accent", shape: "tint" },
      ]}
    >
      <Plot
        label="Netting ratios against the frequency from 0 to 128 for three positions on the strike ladder, with the share of the leg-by-leg node charge in each band of four units of frequency. The call spread rises from near zero to near one at the top of the grid; the butterfly follows its square; the basket starts at one and oscillates below a quarter. Short bars at the right edge mark the Herfindahl levels 0.707, 0.612 and 0.289. Three quarters of the node charge lies between 64 and 96."
        x={x}
        y={y}
        height="clamp(270px, 60cqi, 350px)"
        xTicks={[0, 32, 64, 96, 128].map((at) => ({ at, label: String(at), minor: false, edge: at === 0 ? "start" as const : at === TOP_FREQUENCY ? "end" as const : undefined }))}
        yTicks={[0, 0.25, 0.5, 0.75, 1].map((at) => ({ at, label: at === 0 ? "0" : at === 1 ? "1" : String(at), solid: at === 0 }))}
        yTitle="Netting ratio $\chi_w(u)$"
        xTitle="Frequency $u$"
        crosshair={crosshair}
        curves={<>
          <path className={styles.rangeFill} data-fill="" d={path(profile, x, y, true)} />
          {POSITIONS.map((item) => <path key={`level-${item.name}`} className={kit[item.tone]} data-thick="" d={path([[TOP_FREQUENCY - 8, herfindahlLevel(item.weights)], [TOP_FREQUENCY, herfindahlLevel(item.weights)]], x, y)} />)}
          {POSITIONS.map((item) => <path key={item.name} className={kit[item.tone]} d={path(frequencies.map((u): Pair => [u, nettingRatio(item.weights, u)]), x, y)} />)}
        </>}
      />
    </Figure>
  );
}

/* ---------- Figure 3: the joint error set and its bounding box ---------- */

function JointErrorSetFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const { half, joint, legByLeg } = data.errorSet;
  const boundary = data.errorSet.boundary.map(([first, second]): Pair => [first, second]);
  const span = 1.62 * Math.max(...half);
  const side = 300;
  const X = (value: number) => ((value + span) / (2 * span)) * side;
  const Y = (value: number) => ((span - value) / (2 * span)) * side;
  const at = (first: number, second: number) => ({ left: (X(first) / side) * 100, top: (Y(second) / side) * 100 });
  const outline = (points: ReadonlyArray<Pair>) => `${points.map(([first, second], index) => `${index ? "L" : "M"}${X(first).toFixed(2)},${Y(second).toFixed(2)}`).join(" ")} Z`;
  const box: Pair[] = [[-half[0], -half[1]], [half[0], -half[1]], [half[0], half[1]], [-half[0], half[1]]];
  // The support of a set in the direction of the spread is the line 4400 error minus 4500 error = support.
  const supportLine = (support: number) => ({ x1: X(support - span), y1: Y(-span), x2: X(span), y2: Y(span - support) });
  const ticks = [-0.03, 0, 0.03];
  const tickLabel = (value: number) => (value === 0 ? "0" : value.toFixed(2).replace(/^-/u, "−"));
  return (
    <Figure id="rough-joint-error-set" caption={caption} manuscript={manuscript}>
      <div className={styles.corner}>
        <Schematic
          label="The set of possible errors of the 4400 call and the 4500 call from the node radii of the three-month certificate, a rounded convex body inside its dashed bounding box. Two parallel lines in the direction of the spread touch the body and the corner of the box: the body's support is 0.045461793 index points and the box's is 0.064536890."
          size={[side, side]}
          inset={{ top: 12, left: 44, right: 10, bottom: 30 }}
          yTitle="Error of the 4500 call, index points"
          xTitle="Error of the 4400 call, index points"
          art={<>
            <path className={styles.discrepancyShade} data-fill="" d={outline(boundary)} />
            <path className={kit.accent} d={outline(boundary)} />
            <path className={kit.ink} data-dash="" d={outline(box)} />
            <line className={kit.accent} {...supportLine(joint)} />
            <line className={kit.ink} data-dash="" {...supportLine(legByLeg)} />
            <line data-axis="" x1={0} y1={0} x2={0} y2={side} />
            <line data-axis="" x1={0} y1={side} x2={side} y2={side} />
          </>}
        >
          {ticks.map((value) => <Mark key={`y${value}`} left={0} top={at(0, value).top} anchor="right" className={kit.muted}>{tickLabel(value)}</Mark>)}
          {ticks.map((value) => <Mark key={`x${value}`} left={at(value, 0).left} top={100} anchor="top" className={kit.muted}>{tickLabel(value)}</Mark>)}
          <Mark {...at(0, 0)} anchor="center" tone="accent">Joint set</Mark>
          <Mark {...at(-half[0], half[1])} anchor="bottom-left">Bounding box</Mark>
        </Schematic>
        <dl className={styles.bounds}>
          <div>
            <dt><span className={`${kit.swatch} ${kit.accent}`} data-shape="line" />Joint support of the spread</dt>
            <dd data-tone="accent"><Tx>{"$0.045461793$ index points"}</Tx></dd>
            <dd>The width of the joint set in the direction of the spread.</dd>
          </div>
          <div>
            <dt><span className={`${kit.swatch} ${kit.ink}`} data-shape="dash" />Leg-by-leg support</dt>
            <dd><Tx>{"$0.064536890$ index points"}</Tx></dd>
            <dd>The width of the bounding box in the same direction.</dd>
          </div>
        </dl>
      </div>
    </Figure>
  );
}

/* ---------- Figure 4: positions certified against the tolerance ---------- */

const TOLERANCE_LIMIT = 1.25;
const POSITIONS_FIXED = 28;

function PassCountsFigure({ manuscript, caption }: ManuscriptFigureProps) {
  const x = linear(0, TOLERANCE_LIMIT);
  const y = linear(0, POSITIONS_FIXED + 1);
  const count = (thresholds: readonly number[], tolerance: number) => thresholds.filter((value) => value <= tolerance).length;
  // A count steps up by one at each exact threshold.
  const steps = (thresholds: readonly number[]): Pair[] => [
    [0, 0],
    ...thresholds.filter((value) => value <= TOLERANCE_LIMIT).flatMap((value, index): Pair[] => [[value, index], [value, index + 1]]),
    [TOLERANCE_LIMIT, count(thresholds, TOLERANCE_LIMIT)],
  ];
  const read = Array.from({ length: 25 }, (_, index) => (index + 1) / 20);
  return (
    <Figure
      id="rough-pass-counts"
      caption={caption}
      manuscript={manuscript}
      legend={[
        { label: "Joint", tone: "accent", shape: "line" },
        { label: "Leg by leg", tone: "ink", shape: "line" },
        { label: "Gain from netting", tone: "accent", shape: "tint" },
      ]}
    >
      <div className={styles.stack}>
        {data.passCounts.map((candidate, index) => {
          const joint = steps(candidate.joint);
          const legByLeg = steps(candidate.legByLeg);
          const crosshair: Crosshair = {
            x: read.map((tolerance) => x(tolerance)),
            heading: read.map((tolerance) => `Tolerance ${tolerance.toFixed(2)}`),
            series: [
              { name: "Joint", tone: "accent", y: read.map((tolerance) => y(count(candidate.joint, tolerance))), value: read.map((tolerance) => String(count(candidate.joint, tolerance))) },
              { name: "Leg by leg", tone: "ink", y: read.map((tolerance) => y(count(candidate.legByLeg, tolerance))), value: read.map((tolerance) => String(count(candidate.legByLeg, tolerance))) },
            ],
          };
          const first = index === 0;
          const last = index === data.passCounts.length - 1;
          const alpha = candidate.alpha.toFixed(2);
          return (
            <div key={alpha} className={styles.panel}>
              <p className={styles.panelTitle}><Tx>{`$\\alpha=${alpha}$`}</Tx></p>
              <Plot
                label={`Positions certified out of 28 against the tolerance in index points at roughness ${alpha}. At tolerances of 1/4, 1/2 and 1 point the joint bound certifies ${[0.25, 0.5, 1].map((tolerance) => count(candidate.joint, tolerance)).join(", ")} positions and the leg-by-leg bound ${[0.25, 0.5, 1].map((tolerance) => count(candidate.legByLeg, tolerance)).join(", ")}.`}
                x={x}
                y={y}
                height={first || last ? "clamp(200px, 40cqi, 230px)" : "clamp(160px, 32cqi, 185px)"}
                inset={{ top: first ? 42 : 10, bottom: last ? 58 : 30 }}
                xTicks={[0, 0.25, 0.5, 0.75, 1, 1.25].map((at) => ({ at, label: at === 0 ? "0" : String(at), minor: at === 0.25 || at === 0.75 || at === 1.25, edge: at === 0 ? "start" as const : at === TOLERANCE_LIMIT ? "end" as const : undefined }))}
                yTicks={[0, 7, 14, 21, 28].map((at) => ({ at, label: String(at), solid: at === 0 }))}
                yTitle={first ? "Positions certified" : undefined}
                xTitle={last ? "Tolerance, index points" : undefined}
                crosshair={crosshair}
                curves={<>
                  <path className={styles.rangeFill} data-fill="" d={path([...joint, ...[...legByLeg].reverse()], x, y, true)} />
                  <path className={kit.ink} d={path(legByLeg, x, y)} />
                  <path className={kit.accent} d={path(joint, x, y)} />
                </>}
              />
            </div>
          );
        })}
      </div>
    </Figure>
  );
}

export const roughManuscriptFigures = {
  "rough-residual-kernel": ResidualKernelFigure,
  "rough-netting-ratio": NettingRatioFigure,
  "rough-joint-error-set": JointErrorSetFigure,
  "rough-pass-counts": PassCountsFigure,
} as const;
