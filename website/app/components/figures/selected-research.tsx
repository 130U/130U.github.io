import type { CSSProperties, ReactNode } from "react";
import { BarAxis, BarHeader, BarRow, Bars, Dot, Figure, Legend, Mark, Panel, Plot, Range, Seg, Tx, classes, linear, logarithmic, styles as kit, type Scale } from "./kit";
import results from "./Results.module.css";
import styles from "./Figures.module.css";

/* Critical Dependence Stress: the benchmark's headline comparison. The
   prediction is a single budget, the proved critical budget a band, and the
   gap between them the result. */
function DependenceBudgetRuler() {
  const x = linear(0, 0.32);
  const y = linear(0, 1);
  const slope = 5 / 32;
  const [low, high] = [13 / 64, 29 / 96];
  return (
    <Figure
      id="dependence-budget"
      className={styles.ruler}
      title="Uniform benchmark: the critical budget against its initial-slope prediction"
      caption="Independent uniform losses on $[0,2]^3$ with $\beta=1$, $p=1/2$ and $\gamma=(1,1,2)$. The proved critical budget lies at least 30% beyond the reversal that the exact initial slope predicts."
    >
      <Plot
        label="Rescaled stress budget. Initial-slope extrapolation reaches zero at 5/32; the proved critical budget lies between 13/64 and 29/96, at least 30% beyond it."
        x={x}
        y={y}
        height="clamp(224px, 42cqi, 244px)"
        inset={{ top: 4, left: 14, right: 14 }}
        xTicks={[0, 0.1, 0.2, 0.3].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(1), edge: at === 0 ? "start" as const : undefined }))}
        yTicks={[{ at: 0, label: "", solid: true }]}
        xGrid={false}
        xTitle="Rescaled stress budget $s$"
      >
        <span className={`${styles.budgetBand} ${kit.fade}`} data-tip={"Proved critical budget s*\n[13/64, 29/96] = [0.203125, 0.302083…]"} style={{ left: `${x(low)}%`, width: `${x(high) - x(low)}%` }} />
        <span className={styles.budgetBar} style={{ left: `${x(low)}%`, width: `${x(high) - x(low)}%` }} />
        <span className={styles.budgetRule} style={{ left: `${x(slope)}%` }} />
        <span className={`${styles.budgetGap} ${kit.fade}`} style={{ left: `${x(slope)}%`, width: `${x(low) - x(slope)}%`, top: `${100 - y(0.36)}%` }} />
        <Mark left={(x(slope) + x(low)) / 2} top={100 - y(0.36)} anchor="bottom" tone="accent" strong className={kit.fade}>+30%</Mark>
        <Dot left={x(slope)} top={100} tone="ink" tip={"Initial-slope extrapolation\ns = 5/32 = 0.15625"} />
        <Mark left={x(slope)} top={0} anchor="top-right" wrap className={`${styles.budgetLabel} ${styles.budgetLabelEnd}`} style={{ maxWidth: `calc(${x(slope)}% + 10px)` }}><>Initial-slope extrapolation<br /><Tx>$5/32$</Tx></></Mark>
        <Mark left={x(low)} top={0} anchor="top-left" tone="accent" wrap className={styles.budgetLabel} style={{ maxWidth: `calc(${100 - x(low)}% + 12px)` }}><>Proved critical budget<br /><Tx>$[13/64,29/96]$</Tx></></Mark>
      </Plot>
    </Figure>
  );
}

/* ---------- Number lines whose intervals carry their endpoints ----------
   A key interval is read where it lies: its two endpoints stand over its caps,
   the lower one starting at its cap and the upper one ending at its own. */

type LineRule = { at: number; tone?: "soft" | "accent" };

/** Grid lines and reference rules behind one row, through its name and its marks. */
function RowLines({ grid, rules = [] }: { grid: number[]; rules?: LineRule[] }) {
  return (
    <span className={results.lines} aria-hidden="true">
      {grid.map((left, index) => <span key={`g${index}`} className={kit.gridX} style={{ left: `${left}%` }} />)}
      {rules.map((rule, index) => <span key={`r${index}`} className={kit.rule} data-tone={rule.tone} style={{ left: `${rule.at}%` }} />)}
    </span>
  );
}

/** One interval: its name, its endpoints over its caps, and the capped line. */
function IntervalRow({ x, from, to, ends, name, number, tone, emphasis, tip, grid, rules, overlay, children }: {
  x: Scale;
  from: number;
  to: number;
  ends: readonly [string, string];
  name: string;
  number?: string;
  tone: "accent" | "sky" | "ink";
  emphasis?: boolean;
  tip: string;
  grid: number[];
  rules?: LineRule[];
  overlay?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className={results.span} data-key={emphasis ? "" : undefined}>
      <RowLines grid={grid} rules={rules} />
      <p className={results.name}><span>{number && <span className={results.number}>{number}</span>}<Tx>{name}</Tx></span></p>
      <div className={results.field}>
        {overlay}
        <span className={kit.fade}>
          <span className={results.end} data-result-label="" data-side="low" style={{ left: `${x(from)}%` }}>{ends[0]}</span>
          <span className={results.end} data-result-label="" data-side="high" style={{ left: `${x(to)}%` }}>{ends[1]}</span>
        </span>
        <div className={`${kit.track} ${results.bar}`}>
          <Range x={x} from={from} to={to} tone={tone} tip={tip} />
          {children}
        </div>
      </div>
    </div>
  );
}

/** Tick labels under a number line, on the figures' axis rule. */
function LineAxis({ x, ticks }: { x: Scale; ticks: Array<{ at: number; label: string }> }) {
  return (
    <div className={`${kit.axis} ${results.axis}`}>
      {ticks.map((tick) => {
        const left = x(tick.at);
        return <span key={tick.label} className={kit.tickX} data-edge={left < 5 ? "start" : left > 95 ? "end" : undefined} style={{ left: `${left}%` }}>{tick.label}</span>;
      })}
    </div>
  );
}

/* Asian options, Section 1.2: the interval (1.3) for the continuous price of the
   95–110 spread and the interval under the scheme on one price axis, each with
   its endpoints over its caps, and a strip magnified around the proxy value
   with the simulated price (Section 5.5). Every value is the manuscript's. */
const SPREAD = {
  continuous: [6.508371733, 6.518868974],
  scheme: [6.507844281, 6.519014106],
  proxy: 6.513251661289,
  radius: 0.00021,
  simulated: 6.51335,
  library: 6.52,
} as const;

function AsianIntervalLine() {
  const interval = ([low, high]: readonly [number, number]) => `[${low}, ${high}]`;
  const ends = ([low, high]: readonly [number, number]) => [low.toFixed(9), high.toFixed(9)] as const;
  const x = linear(6.5075, 6.5205);
  const ticks = [6.51, 6.515, 6.52].map((at) => ({ at, label: at.toFixed(3) }));
  const grid = ticks.map((tick) => x(tick.at));
  const rules: LineRule[] = [{ at: x(SPREAD.library), tone: "soft" }];
  // The strip magnifies a window of 0.0006 around the proxy value, placed so
  // that each mark keeps room for its note on a phone.
  const zoom = [6.51301, 6.51361] as const;
  const zoomed = linear(...zoom);
  const lensTicks = [6.5131, 6.5133, 6.5135].map((at) => ({ at, label: at.toFixed(4) }));
  const windowBand = <span className={results.lensWindow} data-lens-window="" aria-hidden="true" style={{ left: `${x(zoom[0])}%`, width: `${x(zoom[1]) - x(zoom[0])}%` }} />;
  const proxyTip = `Proxy value ${SPREAD.proxy}\nknown to ±.00021`;
  const simulatedTip = `Simulated price, close to ${SPREAD.simulated}\n.000102 above the proxy value, standard error .000004`;
  return (
    <Figure
      id="asian-interval"
      title="Price of the 95–110 spread under Heston"
      caption="The interval (1.3) for the continuous price and the interval for the price under absorbed Euler with $h=1/768$; 6.52 lies outside both. The magnified strip shows the proxy value and the simulated price: almost all of the width of (1.3) is the allowance for the two costs of the kink."
    >
      <div className={results.panel}>
        <div role="img" aria-label={`The continuous price lies in ${interval(SPREAD.continuous)}, the interval (1.3); the price under absorbed Euler with step 1/768 lies in ${interval(SPREAD.scheme)}. Both contain the proxy value ${SPREAD.proxy} and exclude 6.52.`}>
          <div className={results.header} aria-hidden="true"><span style={{ left: `${x(SPREAD.library)}%` }}>A library that prints 6.52</span></div>
          <IntervalRow x={x} from={SPREAD.continuous[0]} to={SPREAD.continuous[1]} ends={ends(SPREAD.continuous)} number="(1.3)" name="Continuous price" tone="accent" emphasis grid={grid} rules={rules} overlay={windowBand}
            tip={`Continuous price, (1.3)\n${interval(SPREAD.continuous)}\nAllowance .004670 below the proxy value and .005407 above`}>
            <span className={`${kit.dot} ${kit.ink}`} data-tip={proxyTip} style={{ left: `${x(SPREAD.proxy)}%`, top: "50%" }} />
          </IntervalRow>
          <IntervalRow x={x} from={SPREAD.scheme[0]} to={SPREAD.scheme[1]} ends={ends(SPREAD.scheme)} name="Price under absorbed Euler, $h=1/768$" tone="sky" grid={grid} rules={rules} overlay={windowBand}
            tip={`Price under absorbed Euler, h = 1/768\n${interval(SPREAD.scheme)}`} />
          <LineAxis x={x} ticks={ticks} />
        </div>
        {/* The window runs down through the axis row, clear of its labels, and opens onto the strip. */}
        <svg className={`${results.lensLink} ${kit.fade}`} data-lens-link="" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <polygon points={`${x(zoom[0])},0 ${x(zoom[1])},0 ${x(zoom[1])},30 100,60 0,60 ${x(zoom[0])},30`} />
          <polyline points={`${x(zoom[0])},0 ${x(zoom[0])},30 0,60`} />
          <polyline points={`${x(zoom[1])},0 ${x(zoom[1])},30 100,60`} />
        </svg>
        <div className={results.strip} role="img" aria-label={`Magnified around the proxy value: the proxy value ${SPREAD.proxy}, known to plus or minus ${SPREAD.radius}, and the simulated price, close to ${SPREAD.simulated}, which exceeds the proxy value by 0.000102 with standard error 0.000004.`}>
          <div className={results.span}>
            <RowLines grid={lensTicks.map((tick) => zoomed(tick.at))} />
            <div className={results.field} data-plain="">
              <div className={`${kit.track} ${results.bar}`}>
                <Range x={zoomed} from={SPREAD.proxy - SPREAD.radius} to={SPREAD.proxy + SPREAD.radius} tone="ink" tip={proxyTip} />
                <span className={`${kit.dot} ${kit.ink}`} data-tip={proxyTip} style={{ left: `${zoomed(SPREAD.proxy)}%`, top: "50%" }} />
                <span className={`${kit.dot} ${kit.ink}`} data-ring="" data-tip={simulatedTip} style={{ left: `${zoomed(SPREAD.simulated)}%`, top: "50%" }} />
              </div>
              <span className={`${results.note} ${kit.fade}`} data-side="left" aria-hidden="true" data-result-label="" style={{ left: `calc(${zoomed(SPREAD.proxy)}% - 6px)` }}>Proxy value<small><Tx>{"$\\pm.00021$"}</Tx></small></span>
              <span className={`${results.note} ${kit.fade}`} aria-hidden="true" data-result-label="" style={{ left: `calc(${zoomed(SPREAD.simulated)}% + 6px)` }}>Simulated price<small>close to 6.51335</small></span>
            </div>
          </div>
          <LineAxis x={zoomed} ticks={lensTicks} />
        </div>
      </div>
    </Figure>
  );
}

/* Asian options, Section 4.2 and Table 1: for the four monthly crude oil calls,
   the proved bound against the Rogers–Shi first-order estimate in cents per
   barrel, a quote step, on a logarithmic scale. Positions are Table 1's price
   columns divided by the 0.01 quote step; the labels quote Table 1's Quote
   steps column and the text. */
const QUOTE_STEP = 0.01;
const CRUDE_CALLS = [
  { name: "Crude oil call, 1 month ahead", lead: "1 month ahead", bound: "0.0000805", steps: "0.0081", simulated: "0.0000523", ratio: "1.54", first: "0.0259" },
  { name: "Crude oil call, 3 months ahead", lead: "3 months ahead", bound: "0.0000462", steps: "0.0047", simulated: "0.0000388", ratio: "1.19", first: "0.0262" },
  { name: "Crude oil call, 6 months ahead", lead: "6 months ahead", bound: "0.0000324", steps: "0.0033", simulated: "0.0000293", ratio: "1.10", first: "0.0261" },
  { name: "Crude oil call, 12 months ahead", lead: "12 months ahead", bound: "0.0000224", steps: "0.0023", simulated: "0.0000210", ratio: "1.07", first: "0.0256" },
] as const;

function AsianFirstOrder() {
  const q = logarithmic(0.001, 10);
  const ticks = [0.001, 0.01, 0.1, 1, 10].map((at) => ({ at, label: String(at) }));
  const grid = ticks.map((tick) => q(tick.at));
  const cents = (price: string) => q(Number(price) / QUOTE_STEP);
  const bounds = CRUDE_CALLS.map((call) => cents(call.bound));
  const firsts = CRUDE_CALLS.map((call) => cents(call.first));
  return (
    <Figure
      id="asian-first-order"
      title="Proved and first-order bounds for the monthly crude oil calls"
      caption="The four monthly crude oil calls of Table 1, in cents per barrel, the quote step. First order is the Rogers–Shi form of the classical first-order bound, $E[\mathrm{sd}(A\mid G)]/2$."
    >
      <div className={results.panel} role="img" aria-label="Monthly crude oil calls one to twelve months ahead, in cents per barrel on a logarithmic scale. Proved bound: 0.0081, 0.0047, 0.0033 and 0.0023 cents. Classical first-order estimate: 2.6 cents at every lead time, 320 to 1,140 times larger. A quote step is one cent per barrel.">
        <div className={results.header} aria-hidden="true">
          <span data-anchor="start" data-tone="accent" style={{ left: `${Math.min(...bounds)}%` }}>Proved bound</span>
          <span style={{ left: `${Math.max(...firsts)}%` }}>First order</span>
        </div>
        {CRUDE_CALLS.map((call) => (
          <div key={call.name} className={results.span}>
            <RowLines grid={grid} />
            <p className={results.name}><span>{call.lead}</span></p>
            <div className={results.field} data-plain="">
              <div className={`${kit.track} ${results.bar}`}>
                <span className={`${styles.link} ${kit.steel}`} style={{ left: `${cents(call.bound)}%`, width: `${cents(call.first) - cents(call.bound)}%` }} />
                <span className={`${kit.dot} ${kit.accent}`} data-tip={`${call.name}\nProved bound ${call.bound}, ${call.steps} quote steps\n${call.ratio} times the simulated cost ${call.simulated}`} style={{ left: `${cents(call.bound)}%`, top: "50%" }} />
                <span className={`${kit.dot} ${kit.ink}`} data-shape="square" data-tip={`${call.name}\nFirst-order bound ${call.first}`} style={{ left: `${cents(call.first)}%`, top: "50%" }} />
              </div>
              <span className={`${results.note} ${results.beside} ${kit.fade}`} aria-hidden="true" data-result-label="" style={{ left: `calc(${cents(call.bound)}% + 9px)` }}>{call.steps}</span>
              <span className={`${results.note} ${results.beside} ${kit.fade}`} aria-hidden="true" data-result-label="" style={{ left: `calc(${cents(call.first)}% + 9px)` }}>2.6</span>
            </div>
          </div>
        ))}
        <div className={results.span}>
          <RowLines grid={grid} />
          <div className={results.field} data-plain="">
            <span className={`${results.gap} ${kit.fade}`} style={{ left: `${Math.max(...bounds)}%`, width: `${Math.min(...firsts) - Math.max(...bounds)}%` }}><span data-result-label="">320 to 1,140 times larger</span></span>
          </div>
        </div>
        <LineAxis x={q} ticks={ticks} />
        <div className={results.axisTitle} aria-hidden="true"><span className={kit.pill}>Cents per barrel, log scale</span></div>
      </div>
    </Figure>
  );
}

/* Asian options, Tables 5 and 6: the proved interval for the Euler gap and its width by Euler step. */
const ASIAN_STEPS = [
  { step: "1/384", total: 0.028009519599, share: "95.5%", enclosure: [-0.014169989568, 0.013839530031], parts: [0.026754977094, 0.000265787793, 0.000028191423, 0.000177646019, 0.000782917272] },
  { step: "1/768", total: 0.021667063872, share: "94.5%", enclosure: [-0.011024692273, 0.010642371599], parts: [0.020478587752, 0.000008620825, 0.000028191423, 0.000368746602, 0.000782917272] },
  { step: "1/1536", total: 0.021734290027, share: "92.8%", enclosure: [-0.010967952032, 0.010766337995], parts: [0.020171631177, 0.000000265628, 0.000028191423, 0.000751284529, 0.000782917272] },
] as const;
const ASIAN_PARTS = [
  { name: "Cost of the kink", label: "Cost of the kink", tone: "accent" },
  { name: "Projection", label: "Projection", tone: "steel" },
  { name: "Frequency tail under P", label: "Frequency tail under $P$", tone: "mist" },
  { name: "Frequency tail under Q", label: "Frequency tail under $Q$", tone: "sky" },
  { name: "Periodization", label: "Periodization", tone: "ink" },
] as const;

function AsianWidthPlateau() {
  const width = linear(0, 0.03);
  const widthTicks = [0, 0.01, 0.02, 0.03].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(2) }));
  const signed = linear(-0.016, 0.016);
  const signedTicks = [-0.015, 0, 0.015].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(3).replace(/^-/u, "−"), solid: at === 0 }));
  // The change between the two finest steps, term by term (Table 6, columns 1/768 and 1/1536).
  const [coarse, fine] = [ASIAN_STEPS[1], ASIAN_STEPS[2]];
  const change = linear(0.0213, 0.0218);
  const changeTicks = [0.0213, 0.0215, 0.0217].map((at) => ({ at, label: at.toFixed(4), minor: at === 0.0215 }));
  const changes = [0, 1, 3].map((part) => ({ ...ASIAN_PARTS[part], delta: fine.parts[part] - coarse.parts[part] }));
  let running = coarse.total;
  const steps = changes.map((item) => {
    const from = running;
    running += item.delta;
    return { ...item, from, to: running };
  });
  const signedDelta = (value: number) => `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(6)}`;
  return (
    <Figure
      id="asian-width"
      title="Width of the proved interval by Euler step"
      caption="The allowance for the cost of the kink supplies most of each width, which settles near 0.0217. From $h=1/768$ to $h=1/1536$ that allowance and the projection term shrink while the frequency tail under $Q$ doubles."
      views={[{ id: "width", label: "Width Budget" }, { id: "change", label: "Finest-Step Change" }, { id: "enclosure", label: "Gap Interval" }]}
      viewsLabel="Show the width budget, the change at the finest step or the interval for the Euler gap"
    >
      <Panel view="change" active={false}>
        <Bars label={`Change in width from h=1/768 to h=1/1536: cost of the kink ${signedDelta(changes[0].delta)}, projection ${signedDelta(changes[1].delta)}, frequency tail under Q ${signedDelta(changes[2].delta)}; width from 0.021667063872 to 0.021734290027.`} valueWidth="6.5rem" stack>
          <BarRow label="Width at $h=1/768$" value={coarse.total.toFixed(5)} grid={changeTicks.map((tick) => change(tick.at))}>
            <span className={`${kit.dot} ${kit.ink}`} data-tip={`Width at h = 1/768\n${coarse.total}`} style={{ left: `${change(coarse.total)}%`, top: "50%" }} />
          </BarRow>
          {steps.map((item) => (
            <BarRow key={item.name} label={item.label} value={signedDelta(item.delta)} grid={changeTicks.map((tick) => change(tick.at))} rules={[{ at: change(item.from), tone: "soft" }]}>
              <Seg x={change} from={Math.min(item.from, item.to)} to={Math.max(item.from, item.to)} tone={item.tone} hatch={item.delta < 0} tip={`${item.name}\n${signedDelta(item.delta)}`} />
            </BarRow>
          ))}
          <BarRow label="Width at $h=1/1536$" value={fine.total.toFixed(5)} grid={changeTicks.map((tick) => change(tick.at))} rules={[{ at: change(fine.total), tone: "soft" }]}>
            <span className={`${kit.dot} ${kit.ink}`} data-tip={`Width at h = 1/1536\n${fine.total}`} style={{ left: `${change(fine.total)}%`, top: "50%" }} />
          </BarRow>
          <BarAxis x={change} ticks={changeTicks} title="Width, price units" />
        </Bars>
        <p className={styles.tally}><Tx>{"Hatched terms shrink; the periodization term and the frequency tail under $P$ are unchanged."}</Tx></p>
      </Panel>
      {/* One message: the kink supplies most of each width. The four smaller
          terms share one tone here; the change view names them, and each
          segment's readout carries its exact value. */}
      <Panel view="width" active>
        <Bars label="Width contributions by Euler step. h=1/384: width 0.028009519599, 95.5% from the cost of the kink. h=1/768: 0.021667063872, 94.5%. h=1/1536: 0.021734290027, 92.8%." labelWidth="5rem" valueWidth="6.5rem" stack="narrow">
          {ASIAN_STEPS.map((row) => {
            let start = 0;
            return (
              <BarRow key={row.step} label={`$h=${row.step}$`} value={row.total.toFixed(5)} grid={widthTicks.map((tick) => width(tick.at))}>
                {row.parts.map((part, index) => {
                  const from = start;
                  start += part;
                  return <Seg key={index} x={width} from={from} to={start} tone={index === 0 ? "accent" : "steel"} tip={`h = ${row.step}, ${ASIAN_PARTS[index].name}\n${part.toFixed(12)}${index === 0 ? `\n${row.share} of the width` : ""}`} />;
                })}
              </BarRow>
            );
          })}
          <BarAxis x={width} ticks={widthTicks} title="Width, price units" />
        </Bars>
        <Legend items={[{ label: "Cost of the kink", tone: "accent" }, { label: "Four other terms", tone: "steel" }]} />
      </Panel>
      <Panel view="enclosure" active={false}>
        <Bars label="Proved intervals for the Euler gap, the price under the scheme minus the continuous price. h=1/384: −0.014169989568 to 0.013839530031. h=1/768: −0.011024692273 to 0.010642371599. h=1/1536: −0.010967952032 to 0.010766337995." labelWidth="5rem" valueWidth="0px" stack="narrow">
          {ASIAN_STEPS.map((row) => (
            <BarRow key={row.step} label={`$h=${row.step}$`} grid={signedTicks.map((tick) => signed(tick.at))} rules={[{ at: signed(0) }]}>
              <Range x={signed} from={row.enclosure[0]} to={row.enclosure[1]} tone="ink" tip={`h = ${row.step}\n[${row.enclosure[0]}, ${row.enclosure[1]}]`} />
            </BarRow>
          ))}
          <BarAxis x={signed} ticks={signedTicks} title="Euler gap $e_h$" />
        </Bars>
      </Panel>
    </Figure>
  );
}

/* Rough Heston, Table 2: complete bounds for the 4400–4500 spread against a quarter-point tolerance. */
const HESTON_STAGES = [
  { group: "Six months" },
  { id: "H0", text: "Uniform state bound", joint: 1.397612096, marginal: 2.679930311, note: "none" },
  { id: "H1", text: "Theorem 3.1, global residual", joint: 0.378598956, marginal: 0.476401716, note: "1/2 point, both" },
  { id: "H2", text: "Theorem 3.1, 128 time bins", joint: 0.367258782, note: "1/2 point" },
  { id: "H3", text: "Reference through 128, upper band global", joint: 0.132245064, marginal: 0.158585551, note: "1/4 point, both" },
  { id: "H4", text: "Reference through 128, 128 bins", joint: 0.115215934, marginal: 0.137896018, note: "1/4 point, both" },
  { group: "Three months" },
  { id: "Q0", text: "Reference through 64, global", joint: 1.207557898, marginal: 1.545191542, note: "none" },
  { id: "Q1", text: "Reference through 128, global", joint: 0.351318692, marginal: 0.408293698, note: "1/2 point, both" },
  { id: "Q2", text: "Reference through 128, 128 bins", joint: 0.233318843, marginal: 0.252393939, note: "1/4 point, joint only" },
] as const;

function HestonStageBounds() {
  const x = logarithmic(0.09, 3);
  const ticks = [0.1, 0.25, 0.5, 1, 2].map((at) => ({ at, label: String(at) }));
  const grid = [0.1, 0.5, 1, 2].map(x);
  const tolerance = x(0.25);
  return (
    <Figure
      id="heston-stages"
      title="Complete bounds on the 4400–4500 spread, certificate by certificate"
      caption="Each row is a certificate of Table 2; a bound left of the dashed line certifies a quarter point. The forward-variance weight of Theorem 3.1, from H0 to H1, gives the largest reduction."
      legend={[{ label: "Joint bound", tone: "accent", shape: "dot" }, { label: "Leg-by-leg bound", tone: "steel", shape: "ring" }]}
    >
      {/* Table 2 stands just above, so the rows carry no value column: each
          marker's readout gives the exact bounds. */}
      <Bars label="Joint bounds in index points: H0 1.398, H1 0.379, H2 0.367, H3 0.132, H4 0.115, Q0 1.208, Q1 0.351, Q2 0.233. Leg-by-leg bounds: H0 2.680, H1 0.476, H3 0.159, H4 0.138, Q0 1.545, Q1 0.408, Q2 0.252. The tolerance is a quarter point." labelWidth="17rem" valueWidth="0px" stack="narrow">
        <BarHeader marks={[{ at: tolerance, label: "Quarter-point tolerance", tone: "accent", anchor: "left" }]} />
        {HESTON_STAGES.map((row, index) => {
          if (!("id" in row)) return <p key={index} className={kit.groupLabel}>{row.group}</p>;
          const marginal = "marginal" in row ? row.marginal : undefined;
          const certified = row.joint <= 0.25;
          const tip = `${row.id}: ${row.text}\nJoint ${row.joint}${marginal ? `\nLeg by leg ${marginal}` : ""}\nTolerance met: ${row.note}`;
          return (
            <BarRow key={row.id} label={<><span className={styles.id}>{row.id}</span><span className={styles.stageText}>{row.text}</span></>} grid={grid} rules={[{ at: tolerance, tone: "accent" }]}>
              {marginal && <span className={`${styles.link} ${kit.steel}`} style={{ left: `${x(row.joint)}%`, width: `${x(marginal) - x(row.joint)}%` }} />}
              {marginal && <span className={`${kit.dot} ${kit.steel}`} data-ring="" data-tip={tip} style={{ left: `${x(marginal)}%`, top: "50%" }} />}
              <span className={`${kit.dot} ${certified ? kit.accent : kit.ink}`} data-tip={tip} style={{ left: `${x(row.joint)}%`, top: "50%" }} />
            </BarRow>
          );
        })}
        <BarAxis x={x} ticks={ticks} title="Index points, log scale" />
      </Bars>
    </Figure>
  );
}

/* Rough Heston, Section 7.6 and Table 1: at alpha = 0.52 on bank H0, the certified
   model price of the 4400 and 4500 calls against the quoted band, in points from
   the ask. The section states how far above the ask each interval starts, and
   the drawing carries it on to the end of the axis; the excess stands over the
   interval's cap. */
const MISFIT = [
  { strike: "4400", bid: "91.10", ask: "92.40", width: 1.3, excess: 0.49, lower: "\nLower end 92.886, ask 92.396" },
  { strike: "4500", bid: "55.00", ask: "56.20", width: 1.21, excess: 0.067, lower: "" },
] as const;

function HestonMisfit() {
  const x = linear(-1.4, 1);
  const ticks = [-1, -0.5, 0, 0.5, 1].map((at) => ({ at, label: at === 0 ? "0" : String(at).replace("-", "−") }));
  const grid = ticks.map((tick) => x(tick.at));
  const ask: LineRule[] = [{ at: x(0) }];
  return (
    <Figure
      id="heston-misfit"
      title="Certified model price against the quoted band, $\alpha=0.52$"
      caption="Index points from the quoted ask of each six-month call, on the coarsest bank H0. The certified interval for the 4400 call starts at 92.886 against an ask of 92.396; at the other ten strikes it meets the quoted band."
    >
      <div className={results.panel} role="img" aria-label="In index points from the quoted ask. The 4400 call: quoted band 1.30 points wide, from bid 91.10 to ask 92.40; the certified model price is at least 0.490 above the ask, with lower end 92.886 against an ask of 92.396. The 4500 call: quoted band 1.21 points wide, from 55.00 to 56.20; the certified model price is at least 0.067 above the ask.">
        <div className={results.header} aria-hidden="true"><span data-tone="ink" style={{ left: `${x(0)}%` }}>Quoted ask</span></div>
        {MISFIT.map((row, index) => (
          <div key={row.strike} className={results.span}>
            <RowLines grid={grid} rules={ask} />
            <p className={results.name}><span>{row.strike} call</span></p>
            <div className={results.field}>
              <span className={kit.fade}>
                {index === 0 && <span className={results.end} data-result-label="" data-tone="muted" style={{ left: `${x(-row.width)}%` }}>Bid–ask band</span>}
                <span className={results.end} data-result-label="" data-tone="accent" style={{ left: `${x(row.excess)}%` }}>{`≥ ${row.excess.toFixed(3)}`}</span>
              </span>
              <div className={`${kit.track} ${results.bar}`}>
                <Seg x={x} from={-row.width} to={0} tone="mist" tip={`${row.strike} call, quoted band\nBid ${row.bid}, ask ${row.ask}, width ${row.width.toFixed(2)}`} />
                <span className={`${results.openRange} ${kit.accent}`} data-tip={`${row.strike} call, certified model price\nAt least ${row.excess.toFixed(3)} above the ask${row.lower}`} style={{ left: `${x(row.excess)}%`, width: `${100 - x(row.excess)}%` }} />
              </div>
            </div>
          </div>
        ))}
        <LineAxis x={x} ticks={ticks} />
        <div className={results.axisTitle} aria-hidden="true"><span className={kit.pill}>Index points from the quoted ask</span></div>
      </div>
    </Figure>
  );
}

/* Rough Heston, Table 9: the objective enclosures of five roughness candidates at both levels. */
const HESTON_CANDIDATES = [
  { alpha: "0.520", n1024: [4.825094, 6.77835], n2048: [5.293449, 6.024095], unresolved: true, best: true },
  { alpha: "0.525", n1024: [5.645378, 7.501414], n2048: [6.09792, 6.798485], unresolved: true },
  { alpha: "0.530", n1024: [6.748974, 8.517584], n2048: [7.187004, 7.859529], unresolved: true },
  { alpha: "0.540", n1024: [9.807435, 11.422182], n2048: [10.218707, 10.839486] },
  { alpha: "0.550", n1024: [14.000658, 15.482012], n2048: [14.387007, 14.96068] },
] as const;

function HestonCandidateSeparation() {
  const x = linear(4, 16);
  const ticks = [4, 8, 12, 16].map((at) => ({ at, label: String(at) }));
  const grid = ticks.map((tick) => x(tick.at));
  const interval = ([low, high]: readonly [number, number] | readonly number[]) => `[${low.toFixed(3)}, ${high.toFixed(3)}]`;
  return (
    <Figure
      id="heston-candidates"
      className={styles.candidates}
      title="Objective enclosures for five roughness candidates"
      caption="Normalised least-squares distance to the mid prices, as $J\times10^8$. At $N_t=1024$ three close candidates overlap; at $N_t=2048$ the five enclosures are disjoint and ordered, and $\alpha=0.520$ is the certified minimiser on this grid."
      views={[{ id: "n1024", label: <>N<sub>t</sub> = 1024</> }, { id: "n2048", label: <>N<sub>t</sub> = 2048</> }]}
      defaultView="n2048"
      viewsLabel="Choose the number of time cells"
    >
      <Bars label="Joint objective enclosures, J times 10 to the 8. With 1024 cells: alpha 0.520 from 4.825 to 6.778, 0.525 from 5.645 to 7.501, 0.530 from 6.749 to 8.518, 0.540 from 9.807 to 11.422, 0.550 from 14.001 to 15.482. With 2048 cells: 0.520 from 5.293 to 6.024, 0.525 from 6.098 to 6.798, 0.530 from 7.187 to 7.860, 0.540 from 10.219 to 10.839, 0.550 from 14.387 to 14.961." labelWidth="5rem" valueWidth="8.5rem" stack="narrow">
        {HESTON_CANDIDATES.map((row) => {
          const style = {
            "--from-a": `${x(row.n1024[0])}%`, "--width-a": `${x(row.n1024[1]) - x(row.n1024[0])}%`,
            "--from-b": `${x(row.n2048[0])}%`, "--width-b": `${x(row.n2048[1]) - x(row.n2048[0])}%`,
          } as CSSProperties;
          return (
            <BarRow
              key={row.alpha}
              label={`$\\alpha=${row.alpha}$`}
              value={<><span className={styles.layerA}>{interval(row.n1024)}</span><span className={styles.layerB}>{interval(row.n2048)}</span></>}
              grid={grid}
              rowClass={classes("unresolved" in row && styles.unresolved, "best" in row && styles.best)}
            >
              <span className={`${kit.range} ${styles.candidate}`} style={style} data-tip={`α = ${row.alpha}\nNt = 1024: [${row.n1024.join(", ")}]\nNt = 2048: [${row.n2048.join(", ")}]`} />
            </BarRow>
          );
        })}
        <BarAxis x={x} ticks={ticks} title="$J\times10^8$" />
      </Bars>
      <p className={styles.tally}>
        <span className={styles.layerA}>The joint enclosures separate 7 of 10 pairs; the leg-by-leg enclosures, 3 of 10.</span>
        <span className={styles.layerB}>The joint enclosures separate all 10 pairs; the leg-by-leg enclosures, 7 of 10.</span>
      </p>
    </Figure>
  );
}

/* Rough Heston, Table 4: the ledger of the three-month spread (Q2), joint against leg-by-leg. */
const LEDGER_PARTS = [
  { name: "Absolute centre", tone: "ink", joint: 0.149775147, marginal: 0.149775147 },
  { name: "Node support, 1,025 nodes", tone: "accent", joint: 0.045461793, marginal: 0.06453689 },
  { name: "Strip remainder", tone: "mist", joint: 0.000026654, marginal: 0.000026654 },
  { name: "Exact infinite tail", tone: "sky", joint: 0.038055248, marginal: 0.038055248 },
] as const;

function HestonLedger() {
  const x = linear(0, 0.3);
  const ticks = [0, 0.1, 0.2, 0.3].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(1) }));
  const grid = ticks.map((tick) => x(tick.at));
  const tolerance = x(0.25);
  // Each total is printed to the third decimal, which places it on either side
  // of a quarter point; the segments' readouts and Table 4 carry every digit.
  const rows = [
    { name: "Joint", key: "joint", total: 0.233318843, verdict: "Certified" },
    { name: "Leg-by-leg", key: "marginal", total: 0.252393939, verdict: "Not certified" },
  ] as const;
  return (
    <Figure
      id="heston-ledger"
      title="Netting brings the three-month bound (Q2) below a quarter point"
      caption="Both bars share the stored output, the reference centre, all 1,025 node radii and every remainder; only the aggregation of the node errors differs, and netting lowers that term by 30 per cent."
      legend={LEDGER_PARTS.filter((part) => part.tone !== "mist").map((part) => ({ label: part.name, tone: part.tone }))}
    >
      <Bars label="Complete bounds of the three-month spread in index points. Joint 0.233318843, below a quarter point; leg-by-leg 0.252393939, above it. Shared components: absolute centre 0.149775147, strip remainder 0.000026654, exact infinite tail 0.038055248. Node support: joint 0.045461793, leg-by-leg 0.064536890." labelWidth="8rem" valueWidth="7rem" stack>
        <BarHeader marks={[{ at: tolerance, label: "Quarter-point tolerance", tone: "accent", anchor: "right" }]} />
        {rows.map((row) => {
          let start = 0;
          return (
            <BarRow key={row.key} label={row.name} value={row.total.toFixed(3)} valueNote={row.verdict} grid={grid} rules={[{ at: tolerance, tone: "accent" }]}>
              {LEDGER_PARTS.map((part) => {
                const from = start;
                start += part[row.key];
                return <Seg key={part.name} x={x} from={from} to={start} tone={part.tone} tip={`${row.name}: ${part.name}\n${part[row.key].toFixed(9)}\nComplete bound ${row.total.toFixed(9)}`} />;
              })}
            </BarRow>
          );
        })}
        <BarAxis x={x} ticks={ticks} title="Index points" />
      </Bars>
    </Figure>
  );
}

export const selectedResearchFigures = {
  "dependence-budget": DependenceBudgetRuler,
  "asian-interval": AsianIntervalLine,
  "asian-first-order": AsianFirstOrder,
  "asian-width": AsianWidthPlateau,
  "heston-stages": HestonStageBounds,
  "heston-candidates": HestonCandidateSeparation,
  "heston-misfit": HestonMisfit,
  "heston-ledger": HestonLedger,
} as const;
