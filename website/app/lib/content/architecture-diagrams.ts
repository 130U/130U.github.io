// Logic architecture for each AI and legal article, keyed by Experience entry ID.
// Each diagram restates the system or argument its manuscript describes:
// stages run left to right, a stage holds one node or one node per lane, and an
// optional loop marks the feedback path that returns to an earlier stage.
// Node details accept the same inline TeX as the manuscripts.

type DiagramNode = { title: string; detail?: string; tag?: string };
type DiagramStage = { label: string; nodes: DiagramNode[]; emphasis?: boolean };
type DiagramLoop = { from: number; to: number; label: string };
export type ArchitectureDiagram = {
  label: string;
  stages: DiagramStage[];
  loop?: DiagramLoop;
  caption: string;
};

const SYSTEM = "System Architecture";
const FRAMEWORK = "Analytical Framework";

export const architectureDiagrams: Readonly<Record<number, ArchitectureDiagram>> = {
  1: {
    label: SYSTEM,
    stages: [
      { label: "Intake", nodes: [{ title: "Expert submissions", detail: "300+ specialists and vendor queues; each task carries a risk prior $q_i$" }] },
      {
        label: "Allocate",
        emphasis: true,
        nodes: [
          { tag: "Measure", title: "Reference audit", detail: "$\\pi_i^* = \\mathrm{clip}\\,\\sqrt{\\nu m_i/(\\lambda c_i - r_i)_+}$: risk is a rebate on the audit's price" },
          { tag: "Correct", title: "Review allocation", detail: "Ranked by removable loss $\\Delta_i$ under capacity $H_j$, at the same budget price $\\lambda$" },
        ],
      },
      {
        label: "Decide",
        nodes: [
          { title: "Prediction-assisted estimate", detail: "Corrects the selection bias $\\mathrm{Cov}(\\pi, q) > 0$" },
          { title: "Expert adjudication", detail: "Tiered review from Beta-Binomial reliability posteriors" },
        ],
      },
      {
        label: "Output",
        nodes: [
          { title: "Population quality", detail: "Bias-corrected quality inference" },
          { title: "Post-training data", detail: "Accepted expert feedback" },
        ],
      },
    ],
    loop: { from: 2, to: 1, label: "Adjudications update reliability posteriors and review intensity" },
    caption: "One rule prices measurement and correction against the same budget: an audited defect ships corrected, so an item's risk lowers the price of auditing it. Adjudications update reliability posteriors, acceptance criteria and review intensity.",
  },
  2: {
    label: SYSTEM,
    stages: [
      { label: "Specify", nodes: [{ title: "Diagnostic task design", detail: "Decisive variables, evidence standards and acceptance criteria at business decision boundaries" }] },
      {
        label: "Generate",
        nodes: [
          { title: "Gaussian and vine copulas", detail: "Corporate fundamentals keep their joint dependence" },
          { title: "Constrained sampling", detail: "Identities by projection; ratio bounds and date order by transformation" },
          { title: "CTGAN and TabDDPM", detail: "Mixed-type records pass mandatory business-rule checks" },
          { title: "SDEs and Brownian bridges", detail: "Price and rate paths respect the filtration $\\mathcal{F}_s$" },
        ],
      },
      { label: "Calibrate", emphasis: true, nodes: [{ title: "Batch Zero", detail: "Independent execution, reference solutions and five-level pairwise preferences" }] },
      { label: "Scale", nodes: [{ title: "Batch One", detail: "Variants below $z_{1-\\alpha}$ in $\\gamma/s$ get a recomputed reference; large-scale construction for RLHF and DPO" }] },
    ],
    loop: { from: 2, to: 0, label: "Failures and disagreements revise task specifications" },
    caption: "Batch Zero gates each task family before large-scale data construction. Failures and disagreements revise task instructions, reference solutions and acceptance criteria.",
  },
  3: {
    label: SYSTEM,
    stages: [
      { label: "Evidence", nodes: [{ title: "Model run", detail: "Final answer, visible reasoning, tool calls and intermediate outputs" }] },
      {
        label: "Review",
        nodes: [
          { tag: "Layer 1", title: "Code and rules", detail: "Verifiable answers, deliverables and tool permissions" },
          { tag: "Layer 2", title: "LLM-as-a-Judge", detail: "Missing evidence, misapplied rules and reasoning gaps" },
          { tag: "Layer 3", title: "Specialist scholars", detail: "Disputed domain judgments" },
        ],
      },
      { label: "Verify", emphasis: true, nodes: [{ title: "Proof obligations", detail: "Dependency graph $\\Gamma_q \\vdash C_q$ locates the first unsupported step" }] },
      {
        label: "Record",
        nodes: [
          { title: "Correctness", detail: "Validity of the conclusion" },
          { title: "Compliance", detail: "Task requirements and approved tools" },
          { title: "Efficiency", detail: "Progress, repetition and failed assumptions" },
        ],
      },
    ],
    caption: "Three review layers read the answer, the visible reasoning and the execution evidence together, and correctness, compliance and efficiency are recorded apart.",
  },
  4: {
    label: SYSTEM,
    stages: [
      { label: "Evidence", nodes: [{ title: "Versioned evidence", detail: "Reports, audited statements, disclosures and questionnaires with source records" }] },
      { label: "Score", nodes: [{ title: "Rashomon scoring", detail: "Near-optimal models $\\mathcal{F}_\\alpha$ with SHAP attributions across the set" }] },
      { label: "Bound", nodes: [{ title: "Ranking bounds", detail: "Support functions over the joint uncertainty set $\\Omega(E)$" }] },
      { label: "Plan", emphasis: true, nodes: [{ title: "Verification plan", detail: "Knapsack on verified swing per analyst hour, $(1-\\lambda_j)s_j/c_j$" }] },
    ],
    loop: { from: 3, to: 0, label: "Each correction triggers rescoring and attribution updates" },
    caption: "Minimax regret sets the verification plan, a knapsack on verified swing per analyst hour, and each correction triggers rescoring and attribution updates through versioned evidence.",
  },
  8: {
    label: FRAMEWORK,
    stages: [
      { label: "Task", nodes: [{ title: "Autonomous task", detail: "Delayed spacecraft operations, orbital avoidance, debris capture, SETI" }] },
      { label: "Test", emphasis: true, nodes: [{ title: "Two-threshold test", detail: "Authority to act, then evidence to delegate, then the point at which human review can still change the outcome" }] },
      {
        label: "Supervise",
        nodes: [
          { title: "Individual approval" },
          { title: "Advance-constrained action" },
          { title: "Fallback behavior" },
        ],
      },
      { label: "Record", nodes: [{ title: "Authorization record", detail: "Responsible actors, permitted actions, operating conditions, exposed interests, reassessment triggers" }] },
    ],
    loop: { from: 3, to: 1, label: "Material changes and event records trigger reassessment" },
    caption: "The test separates the authority to act from the evidence needed to delegate execution. Each delegated task carries an authorization record, and its reassessment triggers return material changes to review.",
  },
  9: {
    label: FRAMEWORK,
    stages: [
      { label: "Function", nodes: [{ title: "Public decision", detail: "A specified lawful decision the state must make and implement" }] },
      {
        label: "Cases",
        nodes: [
          { tag: "New Zealand", title: "Launch permission", detail: "Retained licensing authority" },
          { tag: "Norway", title: "Operational capability", detail: "Divided responsibilities in an Arctic partnership" },
          { tag: "Luxembourg", title: "Asset ownership", detail: "Planning and legislative information for LUXEOSys" },
        ],
      },
      { label: "Standard", emphasis: true, nodes: [{ title: "Accountable acceptance", detail: "Who can interrupt essential services, which rights permit a response, what funded capacity can act" }] },
      {
        label: "Remedies",
        nodes: [
          { title: "Licensing terms", detail: "Operator information, significant changes, suspension" },
          { title: "Procurement terms", detail: "Recovery, service transition, lifetime costs" },
          { title: "Collective restraint", detail: "ESA rules, UN consensus, anti-satellite testing" },
        ],
      },
    ],
    loop: { from: 2, to: 0, label: "Material gaps require reasoned acceptance or revision before commitment" },
    caption: "The three cases separate permission, operational capability and information as distinct sources of control. The standard turns them into questions a state must answer before it accepts a strategic dependency.",
  },
  10: {
    label: FRAMEWORK,
    stages: [
      {
        label: "Compare",
        nodes: [
          { title: "Historical climate" },
          { title: "Future without SAI" },
          { title: "Feasible policy portfolios" },
        ],
      },
      { label: "Justify", emphasis: true, nodes: [{ title: "Comparative justification", detail: "Defend alternatives, disclose distributional choices, answer objections from exposed constituencies" }] },
      { label: "Authorize", nodes: [{ title: "Authorization", detail: "Review council and independent science panel; separate concurrence of sponsors and exposed constituencies" }] },
      {
        label: "Continue",
        nodes: [
          { title: "Program control", detail: "Political authority can change" },
          { title: "Operator succession", detail: "Bounded interim succession" },
          { title: "Cooling trajectory", detail: "Monitored, financed, gradual withdrawal" },
        ],
      },
    ],
    loop: { from: 3, to: 0, label: "Periodic reassessment of intervention and nondeployment" },
    caption: "The comparative justification duty ties risk-risk analysis to authorization. The continuity duty keeps program control, operator succession and the cooling trajectory apart, so a change in political authority does not force abrupt cessation.",
  },
  11: {
    label: FRAMEWORK,
    stages: [
      {
        label: "Classify",
        nodes: [
          { title: "Protection" },
          { title: "Repair" },
          { title: "Compensation", detail: "For new loss" },
        ],
      },
      { label: "Evidence", nodes: [{ title: "Functional replacement", detail: "Additionality, timing and a discount for delay and risk, not canopy growth or construction alone; West Lake, Deep Bay, San Tin" }] },
      { label: "Accept", emphasis: true, nodes: [{ title: "Staged acceptance", detail: "Site baselines, functional objectives, monitoring periods, seasonal coverage" }] },
      {
        label: "Decide",
        nodes: [
          { title: "Fund release" },
          { title: "Discharge of responsibility" },
          { title: "Development permission" },
        ],
      },
    ],
    loop: { from: 2, to: 1, label: "Delayed or failed recovery triggers funded monitoring and correction" },
    caption: "Engineering completion and ecological performance are accepted separately: verified works earn payment, demonstrated functions discharge responsibility, and a promised function is discounted for delay and risk and credited in full only when it exists before the loss.",
  },
};

// A stage holds either one node or one node per lane, so connectors can align
// without measuring the layout.
for (const [id, diagram] of Object.entries(architectureDiagrams)) {
  const lanes = Math.max(...diagram.stages.map((stage) => stage.nodes.length));
  for (const stage of diagram.stages) {
    if (stage.nodes.length !== 1 && stage.nodes.length !== lanes) {
      throw new Error(`Diagram ${id}: stage "${stage.label}" must have 1 or ${lanes} nodes.`);
    }
  }
  const { loop } = diagram;
  if (loop && !(loop.to < loop.from && loop.from < diagram.stages.length)) {
    throw new Error(`Diagram ${id}: a loop must return to an earlier stage.`);
  }
}
