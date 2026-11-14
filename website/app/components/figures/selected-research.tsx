import type { CSSProperties } from "react";
import { BarAxis, BarHeader, BarRow, Bars, Dot, Figure, Legend, Mark, Panel, Plot, Range, Seg, Tx, linear, logarithmic, styles as kit } from "./kit";
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
      caption="Independent uniform losses on $[0,2]^3$ with $\beta=1$, $p=1/2$ and $\gamma=(1,1,2)$. Extrapolating the exact initial slope predicts a reversal at $s=5/32$; the proved critical budget lies in $[13/64,29/96]$, at least 30% beyond that prediction."
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
      <Panel view="width" active>
        <Bars label="Width contributions by Euler step. h=1/384: width 0.028009519599, 95.5% from the cost of the kink. h=1/768: 0.021667063872, 94.5%. h=1/1536: 0.021734290027, 92.8%." labelWidth="5rem" valueWidth="6.5rem" stack="narrow">
          {ASIAN_STEPS.map((row) => {
            let start = 0;
            return (
              <BarRow key={row.step} label={`$h=${row.step}$`} value={row.total.toFixed(5)} valueNote={`${row.share} from the kink`} grid={widthTicks.map((tick) => width(tick.at))}>
                {row.parts.map((part, index) => {
                  const from = start;
                  start += part;
                  return <Seg key={index} x={width} from={from} to={start} tone={ASIAN_PARTS[index].tone} tip={`h = ${row.step}, ${ASIAN_PARTS[index].name}\n${part.toFixed(12)}`} />;
                })}
              </BarRow>
            );
          })}
          <BarAxis x={width} ticks={widthTicks} title="Width, price units" />
        </Bars>
        <Legend items={ASIAN_PARTS.map((part) => ({ label: part.label, tone: part.tone }))} />
      </Panel>
      <Panel view="enclosure" active={false}>
        <Bars label="Proved intervals for the Euler gap, the price under the scheme minus the continuous price. h=1/384: −0.014169989568 to 0.013839530031. h=1/768: −0.011024692273 to 0.010642371599. h=1/1536: −0.010967952032 to 0.010766337995." labelWidth="5rem" valueWidth="6.5rem" stack="narrow">
          {ASIAN_STEPS.map((row) => (
            <BarRow key={row.step} label={`$h=${row.step}$`} value={row.total.toFixed(5)} valueNote="width" grid={signedTicks.map((tick) => signed(tick.at))} rules={[{ at: signed(0) }]}>
              <Range x={signed} from={row.enclosure[0]} to={row.enclosure[1]} tone="ink" tip={`h = ${row.step}\n[${row.enclosure[0]}, ${row.enclosure[1]}]`} />
            </BarRow>
          ))}
          <BarAxis x={signed} ticks={signedTicks} title="Euler gap $e_h$" />
        </Bars>
      </Panel>
    </Figure>
  );
}

/* Rough Heston, Table 3: complete unit-spread bounds against the 0.25-point task. */
const HESTON_STAGES = [
  { group: "Six months" },
  { id: "H0", text: "Global state propagation", joint: 1.397612096, note: "One-point budget not met" },
  { id: "H1", text: "Finite history, same global residual", joint: 0.378598956, note: "Principal propagation improvement; unchanged output and centre" },
  { id: "H2", text: "Local envelope, same reference nodes", joint: 0.367258782, note: "About 3% further bound reduction" },
  { id: "H3", text: "All finite high nodes, global envelope", joint: 0.132245064, marginal: 0.158585551, note: "High-frequency certification and centre change are included" },
  { id: "H4", text: "All finite high nodes, local envelope", joint: 0.115215934, marginal: 0.137896018, note: "Both methods certify 0.25 points" },
  { group: "Three months" },
  { id: "Q0", text: "Through 64, global envelope", joint: 1.207557898, marginal: 1.545191542, note: "0.25-point budget not met" },
  { id: "Q1", text: "Through 128, global envelope", joint: 0.351318692, marginal: 0.408293698, note: "0.25-point budget not met" },
  { id: "Q2", text: "Through 128, local envelope", joint: 0.233318843, marginal: 0.252393939, note: "Only the joint method certifies 0.25 points" },
] as const;

function HestonStageBounds() {
  const x = logarithmic(0.09, 2);
  const ticks = [0.1, 0.25, 0.5, 1, 2].map((at) => ({ at, label: String(at) }));
  const grid = [0.1, 0.5, 1, 2].map(x);
  const task = x(0.25);
  return (
    <Figure
      id="heston-stages"
      title="Complete unit-spread bounds through the ablation"
      caption="Each row is one configuration from Table 3, on a logarithmic scale; a bound left of the dashed line certifies the 0.25-point task. Finite-history propagation delivers the largest reduction, and at Q2 only the joint aggregation passes."
      legend={[{ label: "Complete joint bound", tone: "accent", shape: "dot" }, { label: "Matched signed marginal bound", tone: "steel", shape: "ring" }]}
    >
      <Bars label="Complete joint bounds in index points: H0 1.398, H1 0.379, H2 0.367, H3 0.132, H4 0.115, Q0 1.208, Q1 0.351, Q2 0.233. Marginal bounds: H3 0.159, H4 0.138, Q0 1.545, Q1 0.408, Q2 0.252. The task budget is 0.25 points." labelWidth="11.5rem" valueWidth="3rem" stack="narrow">
        <BarHeader marks={[{ at: task, label: "0.25-point task", tone: "accent", anchor: "left" }]} />
        {HESTON_STAGES.map((row, index) => {
          if (!("id" in row)) return <p key={index} className={kit.groupLabel}>{row.group}</p>;
          const marginal = "marginal" in row ? row.marginal : undefined;
          const passes = row.joint <= 0.25;
          const tip = `${row.id}: ${row.text}\nJoint ${row.joint}${marginal ? `\nMarginal ${marginal}` : ""}\n${row.note}`;
          return (
            <BarRow key={row.id} label={<><span className={styles.id}>{row.id}</span><span className={styles.stageText}>{row.text}</span></>} value={row.joint.toFixed(3)} grid={grid} rules={[{ at: task, tone: "accent" }]}>
              {marginal && <span className={`${styles.link} ${kit.steel}`} style={{ left: `${x(row.joint)}%`, width: `${x(marginal) - x(row.joint)}%` }} />}
              {marginal && <span className={`${kit.dot} ${kit.steel}`} data-ring="" data-tip={tip} style={{ left: `${x(marginal)}%`, top: "50%" }} />}
              <span className={`${kit.dot} ${passes ? kit.accent : kit.ink}`} data-tip={tip} style={{ left: `${x(row.joint)}%`, top: "50%" }} />
            </BarRow>
          );
        })}
        <BarAxis x={x} ticks={ticks} title="Index points, log scale" />
      </Bars>
    </Figure>
  );
}

/* Rough Heston, Tables 5 and 6: the five fixed candidates under both layers. */
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
      title="Objective enclosures for the five fixed candidates"
      caption="Normalized midpoint loss $J\times10^8$ under the fixed quotes. On the first layer three close candidates still overlap; the prespecified upgrade to $N_t=2048$ separates every pair and certifies $\alpha=0.520$ as the strict minimizer among the five fixed points."
      views={[{ id: "n1024", label: <>N<sub>t</sub> = 1024</> }, { id: "n2048", label: <>N<sub>t</sub> = 2048</> }]}
      defaultView="n2048"
      viewsLabel="Choose the generated layer"
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
              rowClass={`${"unresolved" in row ? styles.unresolved : ""} ${"best" in row ? styles.best : ""}`}
            >
              <span className={`${kit.range} ${styles.candidate}`} style={style} data-tip={`α = ${row.alpha}\nNt = 1024: [${row.n1024.join(", ")}]\nNt = 2048: [${row.n2048.join(", ")}]`} />
            </BarRow>
          );
        })}
        <BarAxis x={x} ticks={ticks} title="$J\times10^8$" />
      </Bars>
      <p className={styles.tally}>
        <span className={styles.layerA}>The joint certificate separates 7 of 10 pairs; the matched marginal, 3 of 10.</span>
        <span className={styles.layerB}>The joint certificate separates all 10 pairs; the matched marginal, 7 of 10.</span>
      </p>
    </Figure>
  );
}

/* Rough Heston, Table 10: the Q2 ledger, joint against signed marginal. */
const LEDGER_PARTS = [
  { name: "Absolute centre charge", tone: "ink", joint: 0.149775146827, marginal: 0.149775146827 },
  { name: "Used-node support", tone: "accent", joint: 0.045461793432, marginal: 0.064536889507 },
  { name: "Strip remainder", tone: "mist", joint: 0.00002665423, marginal: 0.00002665423 },
  { name: "True infinite-tail remainder", tone: "sky", joint: 0.038055248032, marginal: 0.038055248032 },
] as const;

function HestonLedger() {
  const x = linear(0, 0.3);
  const ticks = [0, 0.1, 0.2, 0.3].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(1) }));
  const grid = ticks.map((tick) => x(tick.at));
  const budget = x(0.25);
  const rows = [
    { name: "Joint", key: "joint", total: "0.233318843", verdict: "Passes" },
    { name: "Signed marginal", key: "marginal", total: "0.252393939", verdict: "Does not pass" },
  ] as const;
  return (
    <Figure
      id="heston-ledger"
      title="Q2 quarter-year ledger against the 0.25-point budget"
      caption="Both columns share the output, the reference centre, the 1025 node radii and every remainder. Only the aggregation of shared node errors differs, and that 0.019075095-point difference decides the task."
      legend={LEDGER_PARTS.filter((part) => part.tone !== "mist").map((part) => ({ label: part.name, tone: part.tone }))}
    >
      <Bars label="Q2 complete bounds in index points. Joint 0.233318843, which passes the 0.25 budget; signed marginal 0.252393939, which does not. Shared components: absolute centre charge 0.149775146827, strip remainder 0.000026654230, true infinite-tail remainder 0.038055248032. Used-node support: joint 0.045461793432, marginal 0.064536889507." labelWidth="8rem" valueWidth="7rem" stack>
        <BarHeader marks={[{ at: budget, label: "0.25-point budget", tone: "accent", anchor: "right" }]} />
        {rows.map((row) => {
          let start = 0;
          return (
            <BarRow key={row.key} label={row.name} value={row.total} valueNote={row.verdict} grid={grid} rules={[{ at: budget, tone: "accent" }]}>
              {LEDGER_PARTS.map((part) => {
                const from = start;
                start += part[row.key];
                return <Seg key={part.name} x={x} from={from} to={start} tone={part.tone} tip={`${row.name}: ${part.name}\n${part[row.key]}`} />;
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
  "asian-width": AsianWidthPlateau,
  "heston-stages": HestonStageBounds,
  "heston-candidates": HestonCandidateSeparation,
  "heston-ledger": HestonLedger,
} as const;
