import type { CSSProperties } from "react";
import { Dot, Figure, Mark, Panel, Plot, linear, path, sample, styles as kit } from "./kit";
import styles from "./Figures.module.css";

/* ---------- Autonomous authority in space ---------- */

export function RiskTaxonomy() {
  const cells = [
    { title: "Offset", text: "The same type of harm to the same population", example: "Automation trades loss of a spacecraft through delayed response for loss of the same spacecraft through an erroneous command." },
    { title: "Transfer", text: "Changes the population", example: "An avoidance maneuver protects one spacecraft and raises collision exposure for a neighboring satellite's owner and users." },
    { title: "Substitution", text: "Changes the harm" },
    { title: "Transformation", text: "Changes both the harm and the population" },
  ];
  return (
    <Figure
      id="risk-taxonomy"
      title="Four kinds of countervailing risk"
      caption="A countervailing effect is classified against the target harm and the population that bears it, so whether an effect counts as a transfer depends on where the analysis draws the population boundary."
    >
      <div className={styles.matrix} role="table" aria-label="Risk-risk taxonomy">
        <div role="row" style={{ display: "contents" }}>
          <span className={styles.axisCell} role="columnheader" />
          <span className={styles.axisCell} role="columnheader">Same population</span>
          <span className={styles.axisCell} role="columnheader">Different population</span>
        </div>
        {[["Same harm", cells[0], cells[1]], ["Different harm", cells[2], cells[3]]].map(([label, ...row]) => (
          <div key={label as string} role="row" style={{ display: "contents" }}>
            <span className={`${styles.axisCell} ${styles.rowHead}`} role="rowheader">{label as string}</span>
            {(row as typeof cells).map((cell) => (
              <span key={cell.title} className={styles.cell} role="cell" data-tone={cell.example ? "accent" : undefined}>
                <span className={styles.cellTitle}>{cell.title}</span>
                <span className={styles.cellText}>{cell.text}</span>
                {cell.example && <span className={styles.cellExample}>{cell.example}</span>}
              </span>
            ))}
          </div>
        ))}
      </div>
    </Figure>
  );
}

export function TwoThresholds() {
  const steps = [
    { index: "01", title: "Authority", text: "Does the actor have authority to undertake the activity and impose the relevant exposure?", branch: "No", outcome: "Not authorized. Evidence for delegation cannot substitute for authority.", next: "Yes" },
    { index: "02", title: "Evidence", text: "Does the evidence justify delegating this class of action under these conditions?", branch: "No", outcome: "Do not delegate this class of action.", next: "Yes" },
    { index: "03", title: "Review", text: "Can individual review still change the outcome, credibly and in time?", branch: "Yes", outcome: "Require individual review.", next: "No" },
  ];
  return (
    <Figure
      id="two-thresholds"
      title="The two-threshold decision procedure"
      caption="Authority and evidence are separate gates, taken in order. Where both are met, individual review is required only where it can still protect; where it cannot, the choice is among three bounded alternatives, and lack of time is never by itself a reason for unrestricted autonomy."
    >
      <div className={styles.flow} role="group" aria-label="Decision procedure">
        <span className={styles.flowHead}>Question</span>
        <span />
        <span className={`${styles.flowHead} ${styles.flowHeadOut}`}>Result</span>
        {steps.map((step) => (
          <div key={step.index} style={{ display: "contents" }}>
            <div className={`${kit.node} ${styles.flowStep}`} data-tone={step.index === "02" ? "ink" : undefined}>
              <span className={styles.stepIndex} aria-hidden="true">{step.index}</span>
              <span className={kit.nodeTitle}>{step.title}</span>
              <span className={kit.nodeText}>{step.text}</span>
            </div>
            <span className={styles.flowArrow}><span>{step.branch}</span></span>
            <div className={`${kit.node} ${styles.flowOut}`} data-tone={step.branch === "Yes" ? "accent" : "quiet"}>{step.outcome}</div>
            <span className={styles.flowDown}><span>{step.next}</span></span>
          </div>
        ))}
        <div className={`${kit.node} ${styles.flowStep}`}>
          <span className={styles.stepIndex} aria-hidden="true">04</span>
          <span className={kit.nodeTitle}>Review cannot protect in time</span>
          <span className={kit.nodeText}>Choose one bounded alternative.</span>
        </div>
        <span className={styles.flowArrow}><span>Choose</span></span>
        <div className={`${styles.flowOut} ${styles.options}`}>
          <span>Advance-constrained action</span>
          <span>A justified fallback</span>
          <span>Withhold permission</span>
        </div>
      </div>
    </Figure>
  );
}

export function CollisionSequence() {
  const steps = [
    "Detect and track objects",
    "Estimate future states and uncertainty",
    "Screen conjunctions",
    "Select a response",
    "Coordinate where possible",
    "Execute the command",
    "Evaluate the resulting trajectory",
  ];
  return (
    <Figure
      id="collision-sequence"
      title="Collision avoidance is a sequence, and prediction is one part of it"
      caption="The ESA challenge predicted the risk estimate in the final conjunction data message, another estimate rather than observed collisions or harm avoided. Strong forecasting supports the early steps; selecting and executing maneuvers among several operators needs its own policy-level assurance case."
    >
      <div className={styles.sequence} role="group" aria-label="Operational sequence of collision avoidance">
        {steps.map((step, index) => (
          <div key={step} className={`${kit.node} ${styles.sequenceStep}`} data-tone={index === 1 || index === 2 ? "accent" : undefined} style={{ gridRow: index + 1 }}>
            <span className={styles.stepIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {step}
          </div>
        ))}
        <p className={styles.sequenceNote} data-tone="accent" style={{ gridRow: "2 / span 2" }}>{"Forecasting: where the ESA challenge's predictors operate"}</p>
        <p className={styles.sequenceNote} style={{ gridRow: "4 / span 4" }}>Maneuver policy: requires assurance beyond prediction performance</p>
      </div>
    </Figure>
  );
}

/* ---------- Small states ---------- */

export function StateCases() {
  const cases = [
    { key: "nz", name: "New Zealand", decision: "Permission", question: "Can the state apply its own assessment to an externally connected activity?", remedy: "Usable standards and supervisory information" },
    { key: "no", name: "Norway", decision: "Operation", question: "Can cooperation deliver a function under specified national control?", remedy: "Clarity about interruption and recovery" },
    { key: "lu", name: "Luxembourg", decision: "Informed commitment", question: "Can public institutions understand and govern what they have authorized?", remedy: "Credible requirements and financial scrutiny" },
  ];
  const rows = [
    { label: "Decision tested", field: "decision" as const, strong: true },
    { label: "Question", field: "question" as const },
    { label: "Remedy it calls for", field: "remedy" as const },
  ];
  const order = (column: number, row: number) => ({ "--order": column * 10 + row } as CSSProperties);
  return (
    <Figure
      id="state-cases"
      title="Three cases, three decisions at risk"
      caption="Permission, operational capability and information are complementary conditions, not substitutes. The remedy follows the decision at risk rather than the nationality of every input, which is why more national hardware cannot solve all three."
    >
      <div className={styles.compare} style={{ "--count": 3 } as CSSProperties} role="table" aria-label="Comparison of the three cases">
        <div role="row" style={{ display: "contents" }}>
          <span className={styles.compareCorner} role="columnheader" style={order(0, 0)} />
          {cases.map((item, column) => <span key={item.key} className={styles.compareHead} role="columnheader" data-key={item.key} style={order(column + 1, 0)}>{item.name}</span>)}
        </div>
        {rows.map((row, rowIndex) => (
          <div key={row.field} role="row" style={{ display: "contents" }}>
            <span className={styles.compareLabel} role="rowheader" style={order(0, rowIndex + 1)}>{row.label}</span>
            {cases.map((item, column) => (
              <span key={item.key} className={styles.compareValue} role="cell" data-key={item.key} data-label={row.label} data-strong={row.strong ? "" : undefined} style={order(column + 1, rowIndex + 1)}>{item[row.field]}</span>
            ))}
          </div>
        ))}
      </div>
    </Figure>
  );
}

/* ---------- Solar geoengineering ---------- */

export function EvidenceTiers() {
  const tiers = [
    { title: "Aerosol cooling", text: "Established physical basis", strength: 3 },
    { title: "Regional outcomes", text: "Depend on deployment design and background conditions", strength: 2 },
    { title: "Downstream welfare and geopolitical effects", text: "Involve further uncertainties", strength: 1 },
  ];
  return (
    <Figure
      id="evidence-tiers"
      title="Evidence organized by mechanism and strength"
      caption="Each step away from the physical mechanism adds uncertainty, so concerns listed side by side do not carry equal evidentiary weight. A deployment assessment should keep the tiers apart."
    >
      <p className={styles.tierAxis} aria-hidden="true"><span>Physical mechanism</span><span>Downstream effects</span></p>
      <ol className={styles.tiers} aria-label="Evidence tiers, from strongest to weakest">
        {tiers.map((tier) => (
          <li key={tier.title} className={styles.tier}>
            <span className={styles.pips} aria-hidden="true">{[1, 2, 3].map((pip) => <span key={pip} data-on={pip <= tier.strength ? "" : undefined} />)}</span>
            <span className={kit.nodeTitle}>{tier.title}</span>
            <span className={kit.nodeText}>{tier.text}</span>
          </li>
        ))}
      </ol>
    </Figure>
  );
}

export function ExitPaths() {
  const x = linear(0, 1);
  const y = linear(0, 1.5);
  const decision = 0.52;
  const sustained: Array<[number, number]> = [[0.02, 0], [0.24, 1], [decision, 1]];
  const taper: Array<[number, number]> = [[decision, 1], [0.97, 0]];
  const stop: Array<[number, number]> = [[decision, 1], [decision + 0.004, 0]];
  return (
    <Figure
      id="exit-paths"
      title="Separating the decision to stop from the act of stopping"
      caption="A severe termination shock needs substantial cooling, sudden cessation and a prolonged interruption. Treating program control, operation and the physical trajectory as separate decisions lets authority change without making abrupt cessation the price of dissent."
    >
      <Plot
        label="Injection intensity rises and holds; when authorization expires, an automatic stop would drop it at once, while a tapering pathway lowers it gradually."
        x={x}
        y={y}
        height="clamp(250px, 46cqi, 262px)"
        inset={{ left: 14, top: 36, bottom: 46 }}
        yTicks={[{ at: 0, label: "", solid: true }]}
        yTitle="Injection intensity"
        xTitle="Time"
        curves={<>
          <path className={kit.ink} d={path(sustained, x, y)} />
          <path className={kit.steel} data-dash="" d={path(stop, x, y)} />
          <path className={kit.accent} d={path(taper, x, y)} />
        </>}
      >
        <Dot left={x(decision)} top={100 - y(1)} tone="ink" />
        <Mark left={x(decision)} top={100 - y(1)} anchor="bottom-left" wrap className={kit.muted}>Authorization expires or support is withdrawn</Mark>
        <Mark left={x(decision)} top={100 - y(0.2)} anchor="right" tone="steel" className={kit.fade}>Abrupt cessation</Mark>
        <Mark left={100} top={100 - y(0.8)} anchor="right" tone="accent" wrap className={`${kit.fade} ${styles.alignEnd}`} style={{ maxWidth: "4.5rem" }}>Tapering pathway</Mark>
      </Plot>
      <dl className={styles.lanes} aria-label="Three separate decisions">
        <dt>Program control</dt><dd>Political authority can change.</dd>
        <dt>Operation</dt><dd>Temporary operation passes to a designated public successor under a reviewed continuity plan.</dd>
        <dt>Physical trajectory</dt><dd>Withdrawal follows a tapering pathway evaluated against emissions and atmospheric conditions.</dd>
      </dl>
    </Figure>
  );
}

/* ---------- Mangrove restoration ---------- */

export function EvidentiaryChain() {
  const links = [
    { title: "Applicable legal duty" },
    { title: "Changed decision", example: "A permit requires a tidal creek." },
    { title: "Funded conduct", example: "A contractor excavates it." },
    { title: "Altered site conditions", example: "Monitoring establishes improved exchange." },
    { title: "Ecological responses", example: "Recruitment follows." },
    { title: "Durable functions" },
  ];
  const claims = [
    { claim: "Ecological technique", question: "What would have happened without reconnection, or with planting alone?" },
    { claim: "Legal mechanism", question: "Would the same work have occurred without the obligation, funding condition or credible sanction?" },
    { claim: "Compensation", question: "How does the development-and-restoration package compare with the relevant lawful alternative, including habitat and management that would otherwise persist?" },
  ];
  return (
    <Figure
      id="evidentiary-chain"
      title="From legal duty to durable function"
      caption="Each observation supports a different link, so aerial photographs of canopy expansion cannot establish the whole chain. The counterfactual also changes with the claim being tested."
      views={[{ id: "chain", label: "Evidentiary Chain" }, { id: "counterfactual", label: "Counterfactual by Claim" }]}
      viewsLabel="Show the evidentiary chain or the counterfactuals"
    >
      <Panel view="chain" active>
        <p className={styles.ladderHead} aria-hidden="true"><span>Link</span><span>Observation that supports it</span></p>
        <ol className={styles.ladder} aria-label="Evidentiary chain">
          {links.map((link, index) => (
            <li key={link.title}>
              <span className={`${kit.node} ${styles.ladderNode}`}>
                <span className={styles.stepIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                {link.title}
              </span>
              <span className={styles.ladderExample}>{link.example ?? ""}</span>
            </li>
          ))}
        </ol>
      </Panel>
      <Panel view="counterfactual" active={false}>
        <dl className={styles.claims}>
          {claims.map((item) => <div key={item.claim}><dt>{item.claim}</dt><dd>{item.question}</dd></div>)}
        </dl>
      </Panel>
    </Figure>
  );
}

export function DeepBay() {
  const x = linear(0, 1);
  const y = linear(0, 64);
  const series = [
    { name: "Mudflat", from: 56, to: 43, tone: "ink" as const },
    { name: "Mangrove", from: 8, to: 15, tone: "accent" as const },
  ];
  const species = [
    ...Array.from({ length: 12 }, () => "declined"),
    ...Array.from({ length: 9 }, () => "increased"),
    ...Array.from({ length: 21 }, () => "other"),
  ];
  return (
    <Figure
      id="deep-bay"
      title="Deep Bay: canopy gained, mudflat lost"
      caption="Mangrove cover rose from 8 to 15 percent of the mapped area and mudflat fell from 56 to 43 percent; twelve of 42 wintering waterbird species declined significantly. Added canopy cannot stand in for the performance of the whole wetland mosaic."
    >
      <div className={styles.panels}>
        <div>
          <p className={styles.panelTitle}>Mapped coverage of the study area, 2000 to 2018</p>
          <Plot
            label="Mapped coverage: mangrove rose from 8 to 15 percent and mudflat fell from 56 to 43 percent between 2000 and 2018."
            x={x}
            y={y}
            height="200px"
            inset={{ top: 10, right: 92, bottom: 30, left: 92 }}
            xTicks={[{ at: 0, label: "2000", solid: true }, { at: 1, label: "2018", solid: true }]}
            curves={series.map((item) => <path key={item.name} className={kit[item.tone]} d={path([[0, item.from], [1, item.to]], x, y)} />)}
          >
            {series.map((item) => (
              <span key={item.name}>
                <Dot left={0} top={100 - y(item.from)} tone={item.tone} />
                <Dot left={100} top={100 - y(item.to)} tone={item.tone} />
                <Mark left={0} top={100 - y(item.from)} anchor="right" tone={item.tone} strong>{`${item.name} ${item.from}%`}</Mark>
                <Mark left={100} top={100 - y(item.to)} anchor="left" tone={item.tone} strong>{`${item.to}%`}</Mark>
              </span>
            ))}
          </Plot>
        </div>
        <div>
          <p className={styles.panelTitle}>42 wintering waterbird species, 1998 to 2017</p>
          <div className={styles.waffle} role="img" aria-label="Of 42 species, twelve declined significantly and nine increased.">
            {species.map((kind, index) => <span key={index} className={kind === "declined" ? kit.ink : kind === "increased" ? kit.accent : undefined} data-ring={kind === "other" ? "" : undefined} />)}
          </div>
          <ul className={`${kit.legend} ${styles.waffleLegend}`} aria-hidden="true">
            <li><span className={`${kit.swatch} ${kit.ink}`} />Declined significantly, 12</li>
            <li><span className={`${kit.swatch} ${kit.accent}`} />Increased, 9</li>
            <li><span className={`${kit.swatch} ${kit.mist}`} data-shape="box" />Remaining, 21</li>
          </ul>
        </div>
      </div>
    </Figure>
  );
}

export function SanTinLoss() {
  const x = linear(0, 1);
  const y = linear(0, 1.6);
  const filling = 0.4;
  const existing: Array<[number, number]> = [[0, 1], [filling, 1], [filling + 0.003, 0]];
  const recovery = (t: number) => (t < filling ? 0 : 1 / (1 + Math.exp(-(t - 0.7) * 14)) - 1 / (1 + Math.exp(-(filling - 0.7) * 14)));
  const replacement = sample(filling, 1, 61, recovery);
  const behind = sample(filling, 1, 61, (t) => 0.55 * recovery(t));
  const gap = [...replacement, [1, 1] as const, [filling, 1] as const];
  return (
    <Figure
      id="san-tin-loss"
      title="Construction is a milestone; replacement function is an outcome"
      caption="Condition 9 ties pond filling to the start of construction of ecologically enhanced fishponds, which shows that work has begun, not that replacement functions operate. The shaded interval is the period of loss the compensation package must address, with measures ready if enhancement falls behind."
      legend={[{ label: "Existing wetland function", tone: "ink", shape: "line" }, { label: "Expected replacement function", tone: "accent", shape: "line" }, { label: "Enhancement falls behind", tone: "steel", shape: "dash" }, { label: "Period of loss", tone: "accent", shape: "square" }]}
    >
      <Plot
        label="Existing wetland function ends at pond filling, while replacement function rises only gradually afterwards; the gap between them is the period of loss."
        x={x}
        y={y}
        height="clamp(220px, 50cqi, 280px)"
        inset={{ left: 14, top: 36 }}
        yTicks={[{ at: 0, label: "", solid: true }]}
        yTitle="Wetland function"
        xTitle="Time"
        curves={<>
          <path className={styles.lossFill} data-fill="" d={path(gap, x, y, true)} />
          <path className={kit.ink} d={path(existing, x, y)} />
          <path className={kit.steel} data-dash="" d={path(behind, x, y)} />
          <path className={kit.accent} d={path(replacement, x, y)} />
        </>}
      >
        <span className={styles.vline} style={{ left: `${x(0.1)}%` }} />
        <span className={styles.vline} style={{ left: `${x(filling)}%` }} />
        <Mark left={x(0.1)} top={4} anchor="center" tag className={kit.muted}>1</Mark>
        <Mark left={x(filling)} top={4} anchor="center" tag className={kit.muted}>9</Mark>
        <Mark left={x(0.6)} top={100 - y(0.86)} anchor="center" tone="accent" className={kit.fade}>Period of loss</Mark>
      </Plot>
      <dl className={styles.lanes} aria-label="Approval conditions">
        <dt>Condition 1</dt><dd>Habitat Creation and Management Plan submitted for approval at least nine months before pond filling.</dd>
        <dt>Condition 9</dt><dd>Pond filling linked to the start of construction of ecologically enhanced fishponds.</dd>
      </dl>
    </Figure>
  );
}

export const legalResearchFigures = {
  "risk-taxonomy": RiskTaxonomy,
  "two-thresholds": TwoThresholds,
  "collision-sequence": CollisionSequence,
  "state-cases": StateCases,
  "evidence-tiers": EvidenceTiers,
  "exit-paths": ExitPaths,
  "evidentiary-chain": EvidentiaryChain,
  "deep-bay": DeepBay,
  "san-tin-loss": SanTinLoss,
} as const;
