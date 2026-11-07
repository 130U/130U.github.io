import type { CSSProperties } from "react";
import { BarAxis, BarHeader, BarRow, Bars, Dot, Figure, Legend, Mark, Panel, Plot, Range, Seg, Tx, fixed, grouped, linear, logarithmic, normalCdf, path, sample, styles as kit, type Crosshair } from "./kit";
import styles from "./Figures.module.css";

/* ---------- Expert data production ---------- */

const AUDIT_POLICIES = [
  { name: "Uniform sampling", sd: 0.568, change: "Baseline", strata: [14.81, 14.81, 14.81], tone: "steel" },
  { name: "Prioritize predicted error", sd: 0.657, change: "+33.77% variance", strata: [3.0, 11.56, 43.33], tone: "ink" },
  { name: "Residual- and cost-aware", sd: 0.515, change: "−17.79% variance", strata: [7.89, 19.37, 21.84], tone: "accent" },
  { name: "Reversed residual ordering", sd: 0.983, change: "+199.66% variance", strata: [23.0, 11.77, 3.0], tone: "ink" },
  { name: "Reversed, 70% uniform weight", sd: 0.615, change: "+17.07% variance", strata: [17.27, 13.9, 11.27], tone: "ink" },
] as const;
const STRATA = [
  { label: "Stratum 1: 6,000 items, unit cost 1", tone: "steel" },
  { label: "Stratum 2: 3,000 items, unit cost 1.5", tone: "sky" },
  { label: "Stratum 3: 1,000 items, unit cost 3", tone: "ink" },
] as const;

export function AuditPolicies() {
  const sd = linear(0, 1);
  const sdTicks = [0, 0.25, 0.5, 0.75, 1].map((at) => ({ at, label: at === 0 ? "0" : String(at) }));
  const share = linear(0, 50);
  const shareTicks = [0, 25, 50].map((at) => ({ at, label: `${at}%`, minor: at === 25 }));
  return (
    <Figure
      id="audit-policies"
      title="Five audit policies at the same expected cost"
      caption="Each policy spends the budget $B=2{,}000$ with the floor $\pi_{\min}=3\%$. Residual- and cost-aware allocation is the only policy more precise than uniform sampling; prioritizing predicted error oversamples the expensive third stratum, and reversing the residual ordering triples the variance."
      views={[{ id: "precision", label: "Precision" }, { id: "sampling", label: "Sampling by Stratum" }]}
      viewsLabel="Show precision or sampling probabilities"
    >
      <Panel view="precision" active>
        <Bars label="Standard deviation of the corrected estimate in percentage points: uniform 0.568, prioritize predicted error 0.657, residual- and cost-aware 0.515, reversed residual ordering 0.983, reversed with 70% uniform weight 0.615." labelWidth="12rem" valueWidth="8.5rem" stack>
          <BarHeader marks={[{ at: sd(0.568), label: "Uniform baseline", tone: "steel", anchor: "left" }]} />
          {AUDIT_POLICIES.map((policy) => (
            <BarRow key={policy.name} label={policy.name} value={policy.sd.toFixed(3)} valueNote={policy.change} grid={sdTicks.map((tick) => sd(tick.at))} rules={[{ at: sd(0.568), tone: "soft" }]}>
              <Seg x={sd} from={0} to={policy.sd} tone={policy.tone} tip={`${policy.name}\nStandard deviation ${policy.sd.toFixed(3)} pp\n${policy.change}`} />
            </BarRow>
          ))}
          <BarAxis x={sd} ticks={sdTicks} title="Standard deviation, pp" />
        </Bars>
      </Panel>
      <Panel view="sampling" active={false}>
        <Bars label="Sampling probabilities for strata 1, 2 and 3: uniform 14.81% each; prioritize predicted error 3.00%, 11.56%, 43.33%; residual- and cost-aware 7.89%, 19.37%, 21.84%; reversed 23.00%, 11.77%, 3.00%; reversed with 70% uniform weight 17.27%, 13.90%, 11.27%." labelWidth="12rem" valueWidth="8.5rem" stack>
          {AUDIT_POLICIES.map((policy) => (
            <BarRow key={policy.name} label={policy.name} value={policy.strata.map((value) => value.toFixed(2)).join(" / ")} valueNote="percent" grid={shareTicks.map((tick) => share(tick.at))}>
              {policy.strata.map((value, index) => (
                <span key={index} className={`${kit.seg} ${kit[STRATA[index].tone]} ${styles.mini}`} data-row={index} data-tip={`${policy.name}\n${STRATA[index].label}\n${value.toFixed(2)}%`} style={{ left: 0, width: `${share(value)}%` }} />
              ))}
            </BarRow>
          ))}
          <BarAxis x={share} ticks={shareTicks} title="Sampling probability" />
        </Bars>
        <Legend items={STRATA.map((stratum) => ({ label: stratum.label, tone: stratum.tone }))} />
      </Panel>
    </Figure>
  );
}

export function ResidualMoment() {
  const x = linear(0, 1);
  const y = linear(0, 0.3);
  const curve = sample(0, 1, 101, (q) => q * (1 - q));
  const crosshair: Crosshair = {
    x: curve.filter((_, index) => index % 5 === 0).map(([q]) => x(q)),
    heading: curve.filter((_, index) => index % 5 === 0).map(([q]) => `q = f = ${q.toFixed(2)}`),
    series: [{ name: "m", tone: "accent", y: curve.filter((_, index) => index % 5 === 0).map(([, m]) => y(m)), value: curve.filter((_, index) => index % 5 === 0).map(([, m]) => m.toFixed(4)) }],
  };
  return (
    <Figure
      id="residual-moment"
      title="Where an audit is informative"
      caption="For a calibrated predictor, $f_i=q_i$, the calibration term vanishes and $m_i=q_i(1-q_i)$. A near-certain error that the predictor already recognizes carries almost no residual; the moment peaks where the outcome is most uncertain. Miscalibration adds $(q_i-f_i)^2$ on top."
    >
      <Plot
        label="Expected squared residual m equals q times one minus q for a calibrated predictor: zero at q equal to 0 and 1, maximum 0.25 at q equal to 0.5."
        x={x}
        y={y}
        xTicks={[0, 0.25, 0.5, 0.75, 1].map((at) => ({ at, label: String(at), edge: at === 0 ? "start" as const : at === 1 ? "end" as const : undefined }))}
        yTicks={[0, 0.1, 0.2, 0.3].map((at) => ({ at, label: at === 0 ? "0" : at.toFixed(1), solid: at === 0 }))}
        yTitle="Expected squared residual $m_i$"
        xTitle="True error probability $q_i$"
        crosshair={crosshair}
        curves={<path className={kit.accent} d={path(curve, x, y)} />}
      >
        <Dot left={x(0.5)} top={100 - y(0.25)} tone="accent" className={kit.fade} />
        <Mark left={x(0.5)} top={100 - y(0.25)} anchor="bottom" className={kit.fade}>$q_i\approx0.5$: outcome uncertain</Mark>
        <Dot left={x(1)} top={100 - y(0)} tone="ink" className={kit.fade} />
        <Mark left={x(0.86)} top={100 - y(0.03)} anchor="right" className={kit.fade}>$q_i\approx f_i\approx1$: $m_i\approx0$</Mark>
      </Plot>
    </Figure>
  );
}

export function RemediationExchange() {
  const x = linear(0, 50);
  const ticks = [0, 10, 20, 30, 40, 50].map((at) => ({ at, label: String(at) }));
  const grid = ticks.map((tick) => x(tick.at));
  return (
    <Figure
      id="remediation-exchange"
      title="Where 100 reviews remove the most loss"
      caption="Both groups hold 100 items and capacity covers 100 reviews. Review lowers group 1 from 0.40 to 0.30 and group 2 from 0.15 to 0.01, so the smaller initial risk carries the larger reduction, $\Delta_2=0.14>\Delta_1=0.10$."
      legend={[
        { label: "Group 1, reviewed", tone: "ink" },
        { label: "Group 1, not reviewed", tone: "ink", shape: "hatch" },
        { label: "Group 2, reviewed", tone: "sky" },
        { label: "Group 2, not reviewed", tone: "sky", shape: "hatch" },
      ]}
    >
      <Bars label="Expected errors left after review. Ranking by initial risk: 30 plus 15 equals 45. Ranking by expected loss reduction: 40 plus 1 equals 41, 8.89% fewer at the same review volume." labelWidth="12rem" valueWidth="7.5rem" stack>
        <BarRow label="Rank by initial risk" value="45" valueNote="expected errors" grid={grid}>
          <Seg x={x} from={0} to={30} tone="ink" tip={"Group 1 reviewed\n100 × 0.30 = 30"} />
          <Seg x={x} from={30} to={45} tone="sky" hatch tip={"Group 2 not reviewed\n100 × 0.15 = 15"} />
        </BarRow>
        <BarRow label="Rank by loss reduction $\Delta_i$" value="41" valueNote="−8.89% defect loss" grid={grid}>
          <Seg x={x} from={0} to={40} tone="ink" hatch tip={"Group 1 not reviewed\n100 × 0.40 = 40"} />
          <Seg x={x} from={40} to={41} tone="sky" tip={"Group 2 reviewed\n100 × 0.01 = 1"} />
        </BarRow>
        <BarAxis x={x} ticks={ticks} title="Expected errors delivered" />
      </Bars>
    </Figure>
  );
}

/* ---------- Financial synthetic data ---------- */

export function RejectionCost() {
  const x = logarithmic(1, 1e6);
  const powers = [0, 2, 4, 6];
  const ticks = powers.map((power) => ({ at: 10 ** power, label: power === 0 ? "1" : <>10<sup>{power}</sup></> }));
  const grid = [0, 1, 2, 3, 4, 5, 6].map((power) => x(10 ** power));
  const rows = [
    { m: 1, draws: 25.08, rate: "3.9878%" },
    { m: 2, draws: 628.84, rate: "0.1590%" },
    { m: 4, draws: 395442.59, rate: "0.0002529%" },
  ];
  return (
    <Figure
      id="rejection-cost"
      title="Expected candidate draws per valid input under rejection sampling"
      caption="Tolerance $\epsilon=0.05$ residual standard deviations, on a logarithmic scale. Each added constraint multiplies the expected draws, and four constraints need an expected 395,442.59 draws for one valid input."
    >
      <Bars label="Expected candidate draws per valid input: one constraint 25.08, two constraints 628.84, four constraints 395,442.59." labelWidth="3.5rem" valueWidth="9rem" stack="narrow">
        {rows.map((row) => (
          <BarRow key={row.m} label={`$m=${row.m}$`} value={grouped(row.draws)} valueNote={`accepts ${row.rate}`} grid={grid}>
            <Seg x={x} from={1} to={row.draws} tone={row.m === 4 ? "accent" : "ink"} tip={`${row.m} simultaneous constraint${row.m > 1 ? "s" : ""}\nAcceptance rate ${row.rate}\nExpected draws ${grouped(row.draws)}`} />
          </BarRow>
        ))}
        <BarAxis x={x} ticks={ticks} title="Draws, log scale" />
      </Bars>
    </Figure>
  );
}

export function LabelFlip() {
  const x = linear(0, 3);
  const y = linear(0, 50);
  const curve = sample(0, 3, 121, (ratio) => 100 * normalCdf(-ratio));
  const every = curve.filter((_, index) => index % 4 === 0);
  // Labels sit above and right of each point, clear of the falling curve; the
  // last starts a little earlier, where the curve is already flat, to fit narrow figures.
  const points = [
    { ratio: 0.25, rate: "40.13%", nudge: 0 },
    { ratio: 1, rate: "15.87%", nudge: 0 },
    { ratio: 2, rate: "2.28%", nudge: -2 },
  ];
  return (
    <Figure
      id="label-flip"
      title="Probability that an inherited reference label is wrong"
      caption="For a linear decision rule with margin $\gamma$ and projected perturbation spread $s$, the label flips with probability $\Phi(-\gamma/s)$. Diagnostic tasks sit near the boundary by design, which is where an inherited answer is most often wrong."
    >
      <Plot
        label="Stale-label error rate Phi of minus gamma over s: 40.13% at margin-to-noise ratio 0.25, 15.87% at 1, 2.28% at 2."
        x={x}
        y={y}
        xTicks={[0, 1, 2, 3].map((at) => ({ at, label: String(at), edge: at === 0 ? "start" as const : undefined }))}
        yTicks={[0, 10, 20, 30, 40, 50].map((at) => ({ at, label: `${at}%`, solid: at === 0 }))}
        yTitle="Label-flip probability"
        xTitle="Margin-to-noise ratio $\gamma/s$"
        crosshair={{
          x: every.map(([ratio]) => x(ratio)),
          heading: every.map(([ratio]) => `γ/s = ${ratio.toFixed(2)}`),
          series: [{ name: "Φ(−γ/s)", tone: "accent", y: every.map(([, rate]) => y(rate)), value: every.map(([, rate]) => `${rate.toFixed(2)}%`) }],
        }}
        curves={<>
          <path className={kit.mist} data-fill="" d={`${path(curve, x, y)} L${x(3)},100 L0,100 Z`} style={{ opacity: 0.35 }} />
          <path className={kit.accent} d={path(curve, x, y)} />
        </>}
      >
        {points.map((point) => {
          const rate = Number.parseFloat(point.rate);
          return <span key={point.ratio}>
            <Dot left={x(point.ratio)} top={100 - y(rate)} tone="ink" className={kit.fade} />
            <Mark left={x(point.ratio) + point.nudge} top={100 - y(rate)} anchor="above-right" className={kit.fade} tag>{`$\\gamma/s=${point.ratio}$: ${point.rate}`}</Mark>
          </span>;
        })}
      </Plot>
    </Figure>
  );
}

export function BridgeLeakage() {
  const x = linear(-0.38, 1);
  const y = linear(0, 1.08);
  const history = sample(0, 1, 2, (u) => u);
  const bridge = sample(0, 1, 81, (u) => u * (1 - u));
  const every = sample(0, 1, 21, (u) => u);
  const style = { "--pl": "46px", "--pr": "14px" } as CSSProperties;
  return (
    <Figure
      id="bridge-leakage"
      title="What the endpoint reveals between $s$ and $T$"
      caption="Variance is in units of $\sigma^2(T-s)$. Conditioning on $X_T$ halves the variance at the midpoint, an apparent 29.29% RMSE improvement that comes entirely from the endpoint; where a forecasting task withholds $X_T$, that gain is leakage. The bands mark the three information sets the task specification keeps apart."
      legend={[{ label: "Given $\\mathcal{F}_s$ only", tone: "ink", shape: "line" }, { label: "Given $\\mathcal{F}_s$ and $X_T$", tone: "accent", shape: "line" }]}
    >
      <div style={style}>
        <Plot
          label="Conditional variance of X_t: growing linearly from zero given history only, and following a bridge that returns to zero at T when the endpoint is known; at the midpoint the bridge variance is half."
          x={x}
          y={y}
          xTicks={[{ at: 0, label: <Tx>$s$</Tx>, solid: true }, { at: 0.5, label: <Tx>$(s+T)/2$</Tx> }, { at: 1, label: <Tx>$T$</Tx>, edge: "end" }]}
          yTicks={[{ at: 0, label: "0", solid: true }, { at: 0.5, label: "0.5" }, { at: 1, label: "1" }]}
          yTitle="Conditional variance of $X_t$"
          xTitle="Time $t$"
          crosshair={{
            x: every.map(([u]) => x(u)),
            heading: every.map(([u]) => `(t − s)/(T − s) = ${u.toFixed(2)}`),
            series: [
              { name: "History only", tone: "ink", y: every.map(([u]) => y(u)), value: every.map(([u]) => u.toFixed(3)) },
              { name: "With endpoint", tone: "accent", y: every.map(([u]) => y(u * (1 - u))), value: every.map(([u]) => (u * (1 - u)).toFixed(3)) },
            ],
          }}
          curves={<>
            <path className={kit.ink} d={path(history, x, y)} />
            <path className={kit.accent} d={path(bridge, x, y)} />
          </>}
        >
          <span className={styles.bracket} style={{ left: `${x(0.5)}%`, top: `${100 - y(0.5)}%`, height: `${y(0.5) - y(0.25)}%` }} />
          <Dot left={x(0.5)} top={100 - y(0.5)} tone="ink" className={kit.fade} />
          <Dot left={x(0.5)} top={100 - y(0.25)} tone="accent" className={kit.fade} />
          <Mark left={x(0.5)} top={100 - y(0.375)} anchor="left" tone="accent" className={kit.fade}>Variance halves</Mark>
          <Mark left={x(-0.19)} top={50} anchor="center" className={kit.muted}>History</Mark>
        </Plot>
        <div className={styles.info} style={{ "--split": `${x(0)}%` } as CSSProperties} aria-label="Information sets" role="img">
          <span className={`${styles.infoBand} ${kit.steel}`} data-span="" data-hatch=""><span><Tx>{"Construction $\\mathcal{F}_{\\text{gen}}$: complete path and endpoint"}</Tx></span></span>
          <span className={`${styles.infoBand} ${kit.accent}`} data-fill=""><span><Tx>{"Permitted $\\mathcal{F}_s$"}</Tx></span></span>
          <span className={`${styles.infoBand} ${kit.ink}`}><span><Tx>{"Evaluation $\\mathcal{F}_{\\text{eval}}$: outcomes after $s$"}</Tx></span></span>
        </div>
      </div>
    </Figure>
  );
}

/* ---------- Scientific reasoning ---------- */

export function RankingReversal() {
  const x = linear(0, 1);
  const y = linear(60, 80);
  const models = [
    { name: "A", theta: 72, score: 73.12, alpha: "4%", tone: "ink" as const },
    { name: "B", theta: 64, score: 76.96, alpha: "36%", tone: "accent" as const },
  ];
  return (
    <Figure
      id="ranking-reversal"
      title="Final-answer checks can reverse a ranking"
      caption="Model A produces more fully valid solutions, but Model B's invalid trajectories pass the final-answer check nine times as often. With $\beta_A=\beta_B=0$, the observed score adds $\alpha_m(1-\theta_m)$, and B overtakes A."
    >
      <div>
        <Plot
          label="Model A: true validity 72%, observed score 73.12%. Model B: true validity 64%, observed score 76.96%. The ranking reverses."
          x={x}
          y={y}
          height="clamp(240px, 56cqi, 300px)"
          inset={{ top: 50, right: 88, bottom: 16, left: 68 }}
          yTicks={[60, 65, 70, 75, 80].map((at) => ({ at, label: "" }))}
          xTicks={[{ at: 0, label: "", solid: true }, { at: 1, label: "", solid: true }]}
          curves={models.map((model) => <path key={model.name} className={kit[model.tone]} d={path([[0, model.theta], [1, model.score]], x, y)} />)}
        >
          <Mark left={0} top={-4} anchor="bottom" wrap className={styles.columnHead}>True validity $\theta_m$</Mark>
          <Mark left={100} top={-4} anchor="bottom" wrap className={styles.columnHead}>Observed score $s_m$</Mark>
          {models.map((model) => (
            <span key={model.name}>
              <Dot left={0} top={100 - y(model.theta)} tone={model.tone} tip={`Model ${model.name}\nθ = ${model.theta}%, α = ${model.alpha}, β = 0%`} />
              <Dot left={100} top={100 - y(model.score)} tone={model.tone} tip={`Model ${model.name}\ns = ${model.score}%`} />
              <Mark left={0} top={100 - y(model.theta)} anchor="right" tone={model.tone}><><strong>{model.name}</strong> {model.theta}%</></Mark>
              <Mark left={100} top={100 - y(model.score)} anchor="left" tone={model.tone}><>{model.score}% <strong>{model.name}</strong></></Mark>
            </span>
          ))}
          <Mark left={x(0.44)} top={100 - y(65)} anchor="center" tone="accent" className={kit.fade}>$\alpha_B=36\%$</Mark>
          <Mark left={x(0.36)} top={100 - y(74.6)} anchor="center" className={kit.fade}>$\alpha_A=4\%$</Mark>
        </Plot>
      </div>
    </Figure>
  );
}

const DAG = {
  nodes: [
    { id: "v1", label: "$v_1$", left: 27, top: 25, descendants: ["v3", "v5", "C"] },
    { id: "v2", label: "$v_2$", left: 27, top: 75, descendants: ["v3", "v4", "v5", "C"] },
    { id: "v3", label: "$v_3$", left: 51, top: 25, descendants: ["v5", "C"] },
    { id: "v4", label: "$v_4$", left: 51, top: 75, descendants: ["C"] },
    { id: "v5", label: "$v_5$", left: 73, top: 25, descendants: ["C"] },
  ],
  edges: [["G", "v1"], ["G", "v2"], ["v1", "v3"], ["v2", "v3"], ["v2", "v4"], ["v3", "v5"], ["v5", "C"], ["v4", "C"]],
};

export function ProofObligations() {
  const position: Record<string, [number, number]> = { G: [4, 50], C: [96, 50] };
  for (const node of DAG.nodes) position[node.id] = [node.left, node.top];
  const failed = "v2";
  const unverified = new Set(DAG.nodes.find((node) => node.id === failed)!.descendants);
  const state = (id: string) => (id === failed ? "failed" : unverified.has(id) ? "unverified" : "verified");
  const subscript = (id: string) => id.replace(/\d/gu, (digit) => "₀₁₂₃₄₅₆₇₈₉"[Number(digit)]);
  const readout = (id: string, descendants: string[]) => `First failed obligation ${subscript(id)}. Unverified: ${descendants.map((node) => (node === "C" ? "the conclusion" : subscript(node))).join(", ").replace(/, ([^,]+)$/u, " and $1")}.`;
  return (
    <Figure
      id="proof-obligations"
      title="The first failed obligation and the subgraph it leaves unverified"
      caption="Each node must follow from the assumptions $\Gamma_q$ and its parents. Choose a node to mark it as the first failure: every descendant, including the conclusion $C_q$, becomes unverified, because correct local steps cannot repair a false premise."
      legend={[{ label: "First failed obligation", tone: "accent" }, { label: "Unverified descendant", tone: "steel", shape: "hatch" }, { label: "Verified", tone: "ink", shape: "box" }]}
    >
      <div className={styles.dag} role="group" aria-label="Proof-obligation dependency graph. Choose a node to mark it as the first failed obligation.">
        <div className={styles.dagField}>
          <svg className={styles.dagEdges} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {DAG.edges.map(([from, to]) => (
              <line key={`${from}-${to}`} data-dag-edge={`${from} ${to}`} data-state={from === failed || unverified.has(from) ? "unverified" : "verified"} x1={position[from][0]} y1={position[from][1]} x2={position[to][0]} y2={position[to][1]} />
            ))}
          </svg>
          <span className={styles.dagNode} data-fixed="" style={{ left: `${position.G[0]}%`, top: `${position.G[1]}%` }}><Tx>{"$\\Gamma_q$"}</Tx></span>
          {DAG.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              className={styles.dagNode}
              data-dag-node={node.id}
              data-dag-descendants={node.descendants.join(" ")}
              data-dag-readout={readout(node.id, node.descendants)}
              data-state={state(node.id)}
              aria-pressed={node.id === failed}
              aria-label={`Mark ${subscript(node.id)} as the first failed obligation`}
              disabled
              style={{ left: `${node.left}%`, top: `${node.top}%` }}
            >
              <Tx>{node.label}</Tx>
            </button>
          ))}
          <span className={styles.dagNode} data-fixed="" data-dag-node="C" data-state={state("C")} style={{ left: `${position.C[0]}%`, top: `${position.C[1]}%` }}><Tx>{"$C_q$"}</Tx></span>
        </div>
      </div>
      <p className={styles.readout} data-dag-status aria-live="polite">{readout(failed, [...unverified])}</p>
    </Figure>
  );
}

const PROTOCOLS = [
  { name: "Final-answer matching only", parts: [1200, 0, 1800, 600], share: "40.0%" },
  { name: "Strict reference-path matching", parts: [600, 600, 0, 2400], share: "100.0%" },
  { name: "Semantic certificate verification", parts: [1200, 0, 0, 2400], share: "100.0%" },
] as const;
const OUTCOMES = [
  { name: "Valid, accepted", tone: "ink" },
  { name: "Valid, rejected", tone: "sky" },
  { name: "Invalid, accepted", tone: "accent" },
  { name: "Invalid, rejected", tone: "mist" },
] as const;

export function ProtocolOutcomes() {
  const x = linear(0, 3600);
  const ticks = [0, 1200, 2400, 3600].map((at) => ({ at, label: grouped(at) }));
  const grid = ticks.map((tick) => x(tick.at));
  return (
    <Figure
      id="protocol-outcomes"
      title="What each acceptance protocol does with 3,600 submissions"
      caption="The first 1,200 submissions in each bar are valid certificates and the remaining 2,400 carry controlled defects. Final-answer matching accepts the 1,800 defective submissions that report $v^*$; strict path matching rejects the 600 valid elimination proofs; semantic verification makes neither error."
      legend={OUTCOMES.map((outcome) => ({ label: outcome.name, tone: outcome.tone }))}
    >
      <Bars label="Final-answer matching: 1,200 valid accepted, 1,800 invalid accepted, 600 invalid rejected; 40.0% of accepted submissions are valid. Strict reference-path matching: 600 valid accepted, 600 valid rejected, 2,400 invalid rejected. Semantic certificate verification: 1,200 valid accepted, 2,400 invalid rejected." valueWidth="6rem" stack>
        <BarHeader marks={[{ at: x(0), label: "Valid", tone: "steel", anchor: "left" }, { at: x(1200), label: "Invalid", tone: "steel", anchor: "left" }]} />
        {PROTOCOLS.map((protocol) => {
          let start = 0;
          return (
            <BarRow key={protocol.name} label={protocol.name} value={protocol.share} valueNote="valid share" grid={grid} rules={[{ at: x(1200), tone: "soft" }]}>
              {protocol.parts.map((count, index) => {
                const from = start;
                start += count;
                return count ? <Seg key={index} x={x} from={from} to={start} tone={OUTCOMES[index].tone} tip={`${protocol.name}\n${OUTCOMES[index].name}: ${grouped(count)}`} /> : null;
              })}
            </BarRow>
          );
        })}
        <BarAxis x={x} ticks={ticks} title="Submissions" />
      </Bars>
    </Figure>
  );
}

/* ---------- Investment research ---------- */

function coverage(n: number, widened: boolean) {
  const shift = 0.2 * Math.sqrt(n);
  return widened ? normalCdf(1.96) - normalCdf(-1.96 - 2 * shift) : normalCdf(1.96 - shift) - normalCdf(-1.96 - shift);
}

export function CoverageCollapse() {
  const x = logarithmic(10, 10000);
  const y = linear(0, 100);
  const naive = sample(10, 10000, 121, (n) => 100 * coverage(n, false), "log");
  const widened = sample(10, 10000, 61, (n) => 100 * coverage(n, true), "log");
  const every = naive.filter((_, index) => index % 4 === 0);
  const readout = (value: number) => (value < 0.01 ? "< 0.01%" : `${value.toFixed(2)}%`);
  return (
    <Figure
      id="coverage-collapse"
      title="Coverage of a nominal 95% interval under a shared reporting bias"
      caption="Shared bias $b=0.2$ and noise $\sigma=1$. Ignoring $b$, more records only tighten the interval around the wrong center, and coverage falls toward zero; once verification bounds $|b|\le0.2$, the widened half-width $0.2+1.96/\sqrt{n}$ holds coverage at 97.50%."
      legend={[{ label: "Bias ignored", tone: "ink", shape: "line" }, { label: "Half-width widened by the verified bound", tone: "accent", shape: "line" }, { label: "Nominal 95%", tone: "steel", shape: "dash" }]}
    >
      <Plot
        label="Actual coverage of a nominal 95% interval with shared bias 0.2: 48.40% at 100 records and 0.000637% at 1,000 records when the bias is ignored; 97.50% with the widened half-width."
        x={x}
        y={y}
        xTicks={[10, 100, 1000, 10000].map((at) => ({ at, label: grouped(at), edge: at === 10 ? "start" as const : at === 10000 ? "end" as const : undefined }))}
        yTicks={[0, 25, 50, 75, 100].map((at) => ({ at, label: `${at}%`, solid: at === 0 }))}
        yTitle="Actual coverage"
        xTitle="Records $n$, log scale"
        crosshair={{
          x: every.map(([n]) => x(n)),
          heading: every.map(([n]) => `n ≈ ${grouped(Math.round(n))}`),
          series: [
            { name: "Bias ignored", tone: "ink", y: every.map(([, value]) => y(value)), value: every.map(([, value]) => readout(value)) },
            { name: "Widened", tone: "accent", y: every.map(([n]) => y(100 * coverage(n, true))), value: every.map(([n]) => readout(100 * coverage(n, true))) },
          ],
        }}
        curves={<>
          <path className={kit.ink} d={path(naive, x, y)} />
          <path className={kit.accent} d={path(widened, x, y)} />
        </>}
      >
        <span className={styles.hline} style={{ top: `${100 - y(95)}%` }} />
        <Dot left={x(100)} top={100 - y(48.4)} tone="ink" className={kit.fade} />
        <Mark left={x(100)} top={100 - y(48.4)} anchor="above-right" tag className={kit.fade}>48.40% at $n=100$</Mark>
        <Dot left={x(1000)} top={100 - y(0.000637)} tone="ink" className={kit.fade} />
        <Mark left={100} top={100 - y(0.000637)} anchor="bottom-right" tag wrap className={`${kit.fade} ${styles.alignEnd}`} style={{ maxWidth: `${100 - x(1000)}%` }}>{"0.000637% at $n=1{,}000$"}</Mark>
        <Mark left={100} top={100 - y(97.5)} anchor="bottom-right" tone="accent" className={kit.fade}>97.50%</Mark>
      </Plot>
    </Figure>
  );
}

export function SharedErrorCancellation() {
  const x = linear(-1.6, 2.8);
  const ticks = [-1, 0, 1, 2].map((at) => ({ at, label: fixed(at, 0) }));
  const grid = ticks.map((tick) => x(tick.at));
  const rules = [{ at: x(0), tone: "ink" as const }];
  return (
    <Figure
      id="shared-error"
      title="One shared benchmark error, two ways to bound the difference"
      caption="Nominal score difference 0.6 with a shared sector-benchmark error in $[-1,1]$. Subtracting separate intervals lets the shared error move in opposite directions at once and crosses zero; the joint support function cancels it exactly."
    >
      <Bars label="Bounds on the score difference between companies i and k. Separate intervals: from minus 1.4 to 2.6, which crosses zero and cannot certify the ordering. Joint support function: exactly 0.6, which certifies the ranking." labelWidth="11rem" valueWidth="8rem" stack>
        <BarHeader marks={[{ at: x(0), label: "Decision boundary", tone: "steel", anchor: "left" }]} />
        <BarRow label="Separate company intervals" value="$[-1.4,2.6]$" valueNote="cannot certify" grid={grid} rules={rules}>
          <Range x={x} from={-1.4} to={2.6} tone="steel" tip={"Separately constructed intervals\n[−1.4, 2.6]"} />
          <span className={`${kit.dot} ${kit.steel}`} style={{ left: `${x(0.6)}%`, top: "50%", width: 7, height: 7, margin: "-3.5px 0 0 -3.5px" }} />
        </BarRow>
        <BarRow label="Joint support function" value="$[0.6,0.6]$" valueNote="certifies $i\succ k$" grid={grid} rules={rules}>
          <span className={`${kit.dot} ${kit.accent}`} data-tip={"Joint bound\n[0.6, 0.6]"} style={{ left: `${x(0.6)}%`, top: "50%" }} />
        </BarRow>
        <BarAxis x={x} ticks={ticks} title="Score difference, points" />
      </Bars>
    </Figure>
  );
}

const SCENARIO_VIEWS = [
  { id: "none", label: "Before Verification" },
  { id: "shap", label: "Recheck SHAP Field" },
  { id: "z2", label: <>Verify z<sub>2</sub></> },
  { id: "z1", label: <>Verify z<sub>1</sub></> },
];

export function RegretScenarios() {
  const x = linear(-0.72, 0.72);
  const scenarios = [-1, 1].flatMap((s) => [-0.4, 0.4].flatMap((z1) => [-0.2, 0.2].map((z2) => ({ s, z1, z2, delta: Math.round((0.15 * s + z1 + 0.3 * s * z2) * 100) / 100 }))));
  const lanes: Record<string, Array<{ top: number; label: string; regret: string }>> = {
    none: [{ top: 56, label: "All scenarios", regret: "Regret 0.61" }],
    shap: [{ top: 56, label: "Unchanged", regret: "Regret 0.61" }],
    z2: [{ top: 34, label: "Observe $z_2=-0.2$", regret: "Regret 0.49" }, { top: 80, label: "Observe $z_2=0.2$", regret: "Regret 0.61" }],
    z1: [{ top: 34, label: "Observe $z_1=-0.4$", regret: "Regret 0" }, { top: 80, label: "Observe $z_1=0.4$", regret: "Regret 0" }],
  };
  const lane = (view: string, scenario: (typeof scenarios)[number]) => {
    if (view === "z2") return scenario.z2 < 0 ? lanes.z2[0].top : lanes.z2[1].top;
    if (view === "z1") return scenario.z1 < 0 ? lanes.z1[0].top : lanes.z1[1].top;
    return lanes[view][0].top;
  };
  const ticks = [-0.6, -0.3, 0, 0.3, 0.6];
  const value = (view: string) => (view === "z1" ? ["0", "0.61"] : ["0.61", "0"]);
  return (
    <Figure
      id="regret-scenarios"
      className={styles.scenarioFigure}
      title="Eight scenarios for the score difference $\Delta_s=0.15s+z_1+0.3sz_2$"
      caption="Two Rashomon models, $s\in\{-1,1\}$, and four evidence configurations give eight scenarios. A query splits them by what it would reveal. Only $z_1$ puts every remaining scenario on one side of zero, so only verifying $z_1$ removes the worst-case regret of 0.61."
      views={SCENARIO_VIEWS}
      viewsLabel="Choose a verification query"
      legend={[{ label: "$\\Delta>0$: company $i$ scores higher", tone: "accent", shape: "dot" }, { label: "$\\Delta<0$: company $k$ scores higher", tone: "ink", shape: "ring" }]}
    >
      <div className={styles.scenarios} data-scenarios role="img" aria-label="Score differences for the eight scenarios lie at plus or minus 0.19, 0.31, 0.49 and 0.61. Verifying z1 separates positive from negative differences; rechecking the SHAP field or verifying z2 does not.">
        <span className={styles.zero} style={{ left: `${x(0)}%` }} />
        {SCENARIO_VIEWS.map((view) => (
          <div key={view.id} className={styles.laneSet} data-fig-panel={view.id} hidden={view.id !== "none"}>
            {lanes[view.id].map((item) => (
              <span key={item.label}>
                <span className={styles.lane} style={{ top: `${item.top}%` }} />
                <span className={styles.laneLabel} style={{ top: `${item.top}%` }}><Tx>{item.label}</Tx></span>
                <span className={styles.laneRegret} data-zero={item.regret.endsWith(" 0") ? "" : undefined} style={{ top: `${item.top}%` }}>{item.regret}</span>
              </span>
            ))}
          </div>
        ))}
        {scenarios.map((scenario) => {
          const style = {
            "--x": `${x(scenario.delta)}%`,
            "--y-none": `${lane("none", scenario)}%`,
            "--y-shap": `${lane("shap", scenario)}%`,
            "--y-z2": `${lane("z2", scenario)}%`,
            "--y-z1": `${lane("z1", scenario)}%`,
          } as CSSProperties;
          return (
            <span
              key={`${scenario.s}${scenario.z1}${scenario.z2}`}
              className={`${styles.scenarioDot} ${scenario.delta > 0 ? kit.accent : kit.ink}`}
              data-sign={scenario.delta > 0 ? "positive" : "negative"}
              data-tip={`s = ${scenario.s}, z₁ = ${scenario.z1}, z₂ = ${scenario.z2}\nΔ = ${fixed(scenario.delta, 2)}`}
              style={style}
            />
          );
        })}
      </div>
      <div className={styles.scenarioAxis} aria-hidden="true">
        {ticks.map((tick) => <span key={tick} className={kit.tickX} style={{ left: `${x(tick)}%` }}>{tick === 0 ? "0" : fixed(tick, 1)}</span>)}
      </div>
      {SCENARIO_VIEWS.map((view) => (
        <p key={view.id} className={styles.readout} data-fig-panel={view.id} hidden={view.id !== "none"}>
          {view.id === "none" ? "Before verification, either choice can leave a regret of 0.61." : <>Remaining regret under the worst observation: {value(view.id)[0]}; guaranteed reduction <Tx>{"$V(q)$"}</Tx> = {value(view.id)[1]}.</>}
        </p>
      ))}
    </Figure>
  );
}

export const aiResearchFigures = {
  "audit-policies": AuditPolicies,
  "residual-moment": ResidualMoment,
  "remediation-exchange": RemediationExchange,
  "rejection-cost": RejectionCost,
  "label-flip": LabelFlip,
  "bridge-leakage": BridgeLeakage,
  "ranking-reversal": RankingReversal,
  "proof-obligations": ProofObligations,
  "protocol-outcomes": ProtocolOutcomes,
  "coverage-collapse": CoverageCollapse,
  "shared-error": SharedErrorCancellation,
  "regret-scenarios": RegretScenarios,
} as const;
