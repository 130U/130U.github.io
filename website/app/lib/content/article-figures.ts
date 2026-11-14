// The site's own figures for the eleven full articles, keyed by article slug.
// Each figure follows one manuscript block, named by the opening of its source
// text (or, for a table, by its first header cell). `evidence` lists source text
// that every plotted value or label restates; the build fails if any of it is
// missing from the article.

type FigureAnchor = { paragraph: string } | { table: string };
type FigurePlacement = { figure: string; after: FigureAnchor; evidence: string[] };
type TableEmphasis = { table: string; row?: number; column?: number };

const articleFigures: Readonly<Record<string, readonly FigurePlacement[]>> = {
  "critical-dependence-stress-for-portfolio-diversification": [
    {
      figure: "dependence-budget",
      after: { paragraph: "How much of a portfolio's diversification benefit survives" },
      evidence: ["already $`30\\%`$ above the local-efficiency prediction $`5/32`$", "extrapolates its slope to $`J=5/32`$", "the critical budget lies in $`[13/64,29/96]`$", "$`\\gamma=(1,1,2)`$"],
    },
  ],
  "certified-valuation-arithmetic-asian-options": [
    {
      figure: "asian-width",
      after: { paragraph: "At the three steps the cost of the kink is 95.5, 94.5 and 92.8 percent of the width" },
      evidence: [
        "| $`1/384`$ | $`[-0.014169989568,\\;0.013839530031]`$ | 0.028009519599 |",
        "| $`1/768`$ | $`[-0.011024692273,\\;0.010642371599]`$ | 0.021667063872 |",
        "| $`1/1536`$ | $`[-0.010967952032,\\;0.010766337995]`$ | 0.021734290027 |",
        "| Cost of the kink | 0.026754977094 | 0.020478587752 | 0.020171631177 |",
        "| Projection | 0.000265787793 | 0.000008620825 | 0.000000265628 |",
        "| Frequency tail under $`P`$ | 0.000028191423 | 0.000028191423 | 0.000028191423 |",
        "| Frequency tail under $`Q`$ | 0.000177646019 | 0.000368746602 | 0.000751284529 |",
        "| Periodization | 0.000782917272 | 0.000782917272 | 0.000782917272 |",
        "the cost of the kink is 95.5, 94.5 and 92.8 percent of the width",
        "The width settles near $`.0217`$.",
        "roughly doubles when the step is halved",
      ],
    },
  ],
  "certified-rough-heston-valuation": [
    {
      figure: "heston-stages",
      after: { paragraph: "Finite-history propagation reduces the H0 complete bound" },
      evidence: [
        "H0: Six months: global state propagation | 1.397612096 | — | One-point budget not met",
        "H1: Six months: finite history, same global residual | 0.378598956 | — | Principal propagation improvement; unchanged output and centre",
        "H2: Six months: local envelope, same reference nodes | 0.367258782 | — | About 3% further bound reduction",
        "H3: Six months: all finite high nodes, global envelope | 0.132245064 | 0.158585551 | High-frequency certification and centre change are included",
        "H4: Six months: all finite high nodes, local envelope | 0.115215934 | 0.137896018 | Both methods certify 0.25 points",
        "Q0: Three months: through 64, global envelope | 1.207557898 | 1.545191542 | 0.25-point budget not met",
        "Q1: Three months: through 128, global envelope | 0.351318692 | 0.408293698 | 0.25-point budget not met",
        "Q2: Three months: through 128, local envelope | 0.233318843 | 0.252393939 | Only the joint method certifies 0.25 points",
      ],
    },
    {
      figure: "heston-candidates",
      after: { paragraph: "The unresolved close pairs in the first layer" },
      evidence: [
        "0.520 | [4.825094, 6.778350] | [5.293449, 6.024095]",
        "0.525 | [5.645378, 7.501414] | [6.097920, 6.798485]",
        "0.530 | [6.748974, 8.517584] | [7.187004, 7.859529]",
        "0.540 | [9.807435, 11.422182] | [10.218707, 10.839486]",
        "0.550 | [14.000658, 15.482012] | [14.387007, 14.960680]",
        "N_t=1024 | 7/10 | 3/10",
        "N_t=2048 | 10/10 | 7/10",
        "The final finite grid has alpha=0.520 as a strict minimum.",
      ],
    },
    {
      figure: "heston-ledger",
      after: { paragraph: "The joint complete bound is 0.233318843 points" },
      evidence: [
        "Absolute centre charge | 0.149775146827 | 0.149775146827",
        "Used-node support | 0.045461793432 | 0.064536889507",
        "Strip remainder | 0.000026654230 | 0.000026654230",
        "True infinite-tail remainder | 0.038055248032 | 0.038055248032",
        "Complete upper bound | 0.233318843 | 0.252393939",
        "The difference 0.019075095 points is entirely the node-support aggregation difference.",
        "1025 node radii",
      ],
    },
  ],
  "statistical-inference-and-resource-allocation-in-expert-data-production": [
    {
      figure: "residual-moment",
      after: { paragraph: "The first is the conditional Bernoulli variance" },
      evidence: ["m_i := E[(Y_i - f_i)^2 \\mid X_i] = q_i(1 - q_i) + (q_i - f_i)^2", "($`q_i \\approx 1`$) and the predictor recognizes this ($`f_i \\approx 1`$), then $`m_i \\approx 0`$", "($`q_i \\approx 0.5`$)"],
    },
    {
      figure: "audit-policies",
      after: { paragraph: "At the same expected budget, high-risk-first routing" },
      evidence: [
        "<td>14.81% / 14.81% / 14.81%</td><td>0.568</td><td>Baseline</td>",
        "<td>3.00% / 11.56% / 43.33%</td><td>0.657</td><td>+33.77% increase</td>",
        "<td>7.89% / 19.37% / 21.84%</td><td>**0.515**</td><td>**-17.79% reduction**</td>",
        "<td>23.00% / 11.77% / 3.00%</td><td>0.983</td><td>+199.66% increase</td>",
        "<td>17.27% / 13.90% / 11.27%</td><td>0.615</td><td>+17.07% increase</td>",
        "three strata of $`6,000`$, $`3,000`$ and $`1,000`$ items",
        "Unit audit costs across the three strata are $`1`$, $`1.5`$ and $`3`$",
        "$`B = 2,000`$ units and a minimum sampling probability of $`\\pi_{\\min} = 3\\%`$",
      ],
    },
    {
      figure: "remediation-exchange",
      after: { paragraph: "A separate exact allocation experiment" },
      evidence: ["Two task groups of $`100`$ items each have initial error risks of $`0.40`$ and $`0.15`$", "$`0.30`$ ($`\\Delta_1 = 0.10`$) and $`0.01`$ ($`\\Delta_2 = 0.14`$)", "capacity is $`100`$ items", "$`100(0.30) + 100(0.15) = 45`$", "$`100(0.40) + 100(0.01) = 41`$", "**8.89%**"],
    },
  ],
  "task-validity-in-financial-synthetic-data": [
    {
      figure: "rejection-cost",
      after: { table: "Simultaneous constraints" },
      evidence: ["<td>**1**</td><td>3.9878%</td><td>25.08</td>", "<td>**2**</td><td>0.1590%</td><td>628.84</td>", "<td>**4**</td><td>**0.0002529%**</td><td>**395,442.59**</td>", "$`\\epsilon = 0.05`$ residual standard deviations"],
    },
    {
      figure: "label-flip",
      after: { paragraph: "• Near a diagnostic decision boundary" },
      evidence: ["\\Phi\\left(-\\frac{\\gamma}{s}\\right)", "$`\\gamma / s = 2`$, the error rate was **2.28%**", "$`\\gamma / s = 1`$, it was **15.87%**", "$`\\gamma / s = 0.25`$, it was **40.13%**"],
    },
    {
      figure: "bridge-leakage",
      after: { paragraph: "3. **Evaluation and oracle information" },
      evidence: ["\\sigma^2(t - s)\\frac{T - t}{T - s}", "conditioning on $`X_T`$ halves the conditional variance", "**29.29% apparent reduction in RMSE**", "**Construction information ($`\\mathcal{F}_{\\text{gen}}`$):**", "**Permitted predictor filtration ($`\\mathcal{F}_s`$):**", "**Evaluation and oracle information ($`\\mathcal{F}_{\\text{eval}}`$):** outcomes realized after $`s`$"],
    },
  ],
  "verification-and-supervision-in-scientific-reasoning-tasks": [
    {
      figure: "ranking-reversal",
      after: { paragraph: "To see what this does to a score" },
      evidence: ["$`\\theta_A = 72\\%`$ and $`\\theta_B = 64\\%`$", "$`\\alpha_A = 4\\%`$ and $`\\alpha_B = 36\\%`$, with $`\\beta_A = \\beta_B = 0\\%`$", "$`s_A = 73.12\\%`$ and $`s_B = 76.96\\%`$"],
    },
    {
      figure: "proof-obligations",
      after: { paragraph: "For feedback, I record the first failed obligation" },
      evidence: ["mark its descendant subgraph $`\\operatorname{desc}(v_j)`$ as unverified", "\\Gamma_q \\cup \\{v_j : j \\in \\operatorname{sink}(G)\\} \\vdash C_q"],
    },
    {
      figure: "protocol-outcomes",
      after: { paragraph: "Within this exact-arithmetic benchmark" },
      evidence: [
        "<td>Final-answer matching only</td><td>75.0% (accepts 1,800 flawed solutions)</td><td>0.0%</td><td>40.0%</td>",
        "<td>Strict reference-path matching (ablation)</td><td>0.0%</td><td>50.0% (rejects 600 valid elimination proofs)</td><td>100.0%</td>",
        "<td>0.0%</td><td>0.0%</td><td>100.0%</td>",
        "1,200 valid certificates, 2 per family",
        "2,400 submissions with controlled defects",
      ],
    },
  ],
  "evidence-uncertainty-and-decision-guarantees-in-investment-research": [
    {
      figure: "coverage-collapse",
      after: { paragraph: "• Set the shared bias" },
      evidence: ["$`b = 0.2`$ and independent noise to $`\\sigma = 1`$", "48.40% at $`n = 100`$ records and 0.000637% at $`n = 1,000`$", "$`0.2 + 1.96/\\sqrt{n}`$ gives 97.50% actual coverage"],
    },
    {
      figure: "shared-error",
      after: { paragraph: "• Two companies have a nominal score difference" },
      evidence: ["nominal score difference of $`0.6`$ points", "sector-benchmark error in $`[-1, 1]`$", "$`[-1.4, 2.6]`$", "$`[0.6, 0.6]`$"],
    },
    {
      figure: "regret-scenarios",
      after: { paragraph: "Enumerating the eight scenarios" },
      evidence: ["$`s \\in \\{-1, 1\\}`$", "$`z_1 \\in \\{-0.4, 0.4\\}`$, $`z_2 \\in \\{-0.2, 0.2\\}`$", "$`\\Delta_s = 0.15s + z_1 + 0.3s z_2`$", "<td>0.61</td><td>0</td>", "<td>0</td><td>0.61</td>"],
    },
  ],
  "autonomous-authority-in-space": [
    {
      figure: "risk-taxonomy",
      after: { paragraph: "The risk-risk taxonomy distinguishes" },
      evidence: ["An offset introduces the same type of harm to the same population; substitution changes the harm; transfer changes the population; transformation changes both.", "the countervailing effect is an offset", "the same class of physical harm is transferred to a different owner and potentially different service users"],
    },
    {
      figure: "two-thresholds",
      after: { paragraph: "The decision procedure this Article proposes therefore has two thresholds" },
      evidence: ["First, does the actor have authority to undertake the activity and impose the relevant exposure?", "Second, does the evidence justify delegating this class of action under these conditions?", "Evidence satisfying the second threshold cannot substitute for the first.", "the choice becomes advance-constrained action, a justified fallback, or withholding permission for the activity altogether"],
    },
    {
      figure: "collision-sequence",
      after: { paragraph: "The ESA spacecraft collision-avoidance challenge" },
      evidence: ["detecting and tracking objects, estimating their future states and uncertainty, screening conjunctions, selecting a response, coordinating where possible, executing the command, and evaluating the resulting trajectory", "used earlier conjunction data messages to predict the estimated risk in the final available message", "needs a policy-level assurance case beyond prediction performance"],
    },
  ],
  "small-states-and-strategic-space-dependence": [
    {
      figure: "state-cases",
      after: { paragraph: "This comparison also changes the relevant policy alternatives" },
      evidence: ["New Zealand concerns permission: can the state apply its own assessment to an externally connected activity?", "Norway concerns operation: can cooperation deliver a function under specified national control?", "Luxembourg concerns informed commitment: can public institutions understand and govern what they have authorized?", "A licensing problem calls for usable standards and supervisory information; a service dependency calls for clarity about interruption and recovery; a procurement failure calls for credible requirements and financial scrutiny.", "More national hardware cannot solve all three."],
    },
  ],
  "solar-geoengineering-comparison-and-continuity": [
    {
      figure: "evidence-tiers",
      after: { paragraph: "Evidence should therefore be organized by mechanism and strength" },
      evidence: ["Aerosol cooling has an established physical basis.", "Regional outcomes depend on deployment design and background conditions.", "Downstream welfare and geopolitical effects involve further uncertainties."],
    },
    {
      figure: "exit-paths",
      after: { paragraph: "This Article proposes separating three decisions" },
      evidence: ["who governs the program, who operates it, and what physical trajectory it follows", "temporary operation transfers to a previously designated public successor under a reviewed continuity plan", "A political decision to end SAI could initiate a tapering pathway evaluated against emissions and atmospheric conditions", "The conditions are substantial cooling, sudden cessation, and a sufficiently prolonged interruption."],
    },
  ],
  "mangrove-restoration-and-compensatory-mitigation": [
    {
      figure: "evidentiary-chain",
      after: { paragraph: "Evidence about legal requirements and evidence about ecological performance" },
      evidence: ["runs from an applicable legal duty, through a changed decision and funded conduct, to altered site conditions, ecological responses, and durable functions", "A permit might require a tidal creek, a contractor might excavate it, monitoring might establish improved exchange, and recruitment might follow.", "Aerial photographs of canopy expansion cannot establish all of them.", "what would have happened without reconnection or with planting alone", "whether the same work would have occurred without that obligation, funding condition, or credible sanction", "including the habitat and management that would otherwise persist"],
    },
    {
      figure: "deep-bay",
      after: { paragraph: "Deep Bay supplies a reason to reject mangrove acreage" },
      evidence: ["Between 2000 and 2018, mapped mangrove coverage increased from 8 to 15 percent while mudflat coverage declined from 56 to 43 percent.", "Among 42 bird species analyzed over 1998-2017, twelve declined significantly and nine increased.", "These are different observation windows and denominators, not a single causal time series."],
    },
    {
      figure: "san-tin-loss",
      after: { paragraph: "When development extinguishes an existing function" },
      evidence: ["at least nine months before pond filling", "Condition 9 linked pond filling to the commencement of construction of ecologically enhanced fishponds.", "it supplies no independent evidence that replacement functions are operating", "the measures available if enhancement falls behind"],
    },
  ],
};

const tableEmphasis: Readonly<Record<string, readonly TableEmphasis[]>> = {
  "statistical-inference-and-resource-allocation-in-expert-data-production": [{ table: "Audit policy", row: 2 }],
  "verification-and-supervision-in-scientific-reasoning-tasks": [{ table: "Acceptance protocol", row: 2 }],
  "evidence-uncertainty-and-decision-guarantees-in-investment-research": [{ table: "Verification query", row: 2 }],
  "certified-rough-heston-valuation": [
    { table: "Maturity and stage", column: 1 },
    { table: "Output", column: 1 },
    { table: "Component", column: 1 },
  ],
};

// Manuscript figures drawn natively, keyed by the image path the manuscript
// cites. The dependence drawings evaluate the manuscript's formulas
// (130U/Critical-Dependence-Stress at the pinned commit:
// code/generate_mechanism_figures.py and
// calculations/plot_profiles_and_flows.py); the Asian drawings plot the study
// results of 130U/certified-valuation-arithmetic-asian-options at the pinned
// commit and evaluate Proposition 4.1. `evidence` ties each drawing's labels,
// plotted functions and restated values to the article text, and the build
// fails if any is missing.
export const manuscriptFigures: Readonly<Record<string, { figure: string; evidence: string[] }>> = {
  "/assets/research/asian/disagreement.png": {
    figure: "asian-disagreement",
    evidence: [
      "If the proxy is below the strike while $`A`$ is above, she forgoes $`A-K`$. If the proxy is above while $`A`$ is below, she pays $`K-A`$.",
      "with $`88\\lt cG\\lt 102`$, 2,231 of a sample of 6,000, and strike $`K=95`$",
      "which happens on 34 of them: the shaded wedges",
      "its horizontal distance to the dashed line $`A=K`$",
    ],
  },
  "/assets/research/asian/cubic-law.png": {
    figure: "asian-cubic-law",
    evidence: [
      "R_{c_*}(K)\\le\\frac{K}{v\\sqrt{2\\pi t_1}}\\Bigl[\\log E\\,X-(E\\,X-1)+\\tfrac12E(X-1)^2\\Bigr].",
      "K\\,\\frac{v^3\\tau^2}{360\\sqrt{2\\pi t_1}}\\quad(n\\to\\infty).",
      "at 35 percent volatility, for three averaging windows, against the time before the first fixing",
      "Dotted lines are the leading term (4.4) under continuous monitoring. The markers are the four crude oil options of Table 1. Below the dashed line the proxy value prices a 70-dollar barrel to within one cent.",
      "| Crude oil call, 1 month ahead | 3.206408 | 0.0000805 |",
      "| Crude oil call, 3 months ahead | 5.058865 | 0.0000462 |",
      "| Crude oil call, 6 months ahead | 6.906596 | 0.0000324 |",
      "| Crude oil call, 12 months ahead | 9.431726 | 0.0000224 |",
      "a calendar month of 21 daily settlements of a futures price of 70 dollars with 35 percent volatility, struck at 70",
      "A year has 252 trading days.",
    ],
  },
  "/assets/research/asian/profile.png": {
    figure: "asian-profile",
    evidence: [
      "by simulation on $`2^{20}`$ paths",
      "The shaded area is the conservation law (3.4). The dotted curve is the second-order term of (3.8). The upper curve is the smaller of the two bounds of Theorem 3.3",
      "per unit of strike the cost peaks near $`K=77`$",
      "a 95–110 call spread on twelve monthly fixings",
    ],
  },
  "/assets/research/asian/euler-ladder.png": {
    figure: "asian-euler-ladder",
    evidence: [
      "Circles: the bias of the proxy value, from Table 8 and the full ladder of twelve steps. Squares: the proved bound on the Euler gap of the option at the three certified steps (Table 5). Triangles: the simulated change in the cost of the kink, shown as its absolute value plus two standard errors.",
      "| 384 (certified sums) | $`-0.000406686`$ | $`-0.156167`$ |",
      "| 768 (certified sums) | $`-0.000202992`$ | $`-0.155898`$ |",
      "| 1536 (certified sums) | $`-0.000101409`$ | $`-0.155764`$ |",
      "\\approx-0.15563\\,h-0.205\\,h^2",
      "| $`1/384`$ | $`[-0.014169989568,\\;0.013839530031]`$ | 0.028009519599 |",
      "| $`1/768`$ | $`[-0.011024692273,\\;0.010642371599]`$ | 0.021667063872 |",
      "| $`1/1536`$ | $`[-0.010967952032,\\;0.010766337995]`$ | 0.021734290027 |",
      "$`-1.2\\cdot10^{-7}`$ for the spread with standard error $`1.2\\cdot10^{-7}`$",
    ],
  },
  "/assets/research/dependence/tail-layer-repair.png": {
    figure: "dependence-tail-layer",
    evidence: [
      "A layer with thickness and mass of order $`O(\\varepsilon)`$, transported over distances of order $`O(\\varepsilon)`$, incurs second-order cost.",
      "Their integrated absolute values give the compensation lower bound, with leading coefficients $`\\|j_i\\|_1`$",
      "\\mathcal C(\\alpha)=I(\\alpha)+\\sum_{i=1}^3\\gamma_i\\|j_i\\|_{L^1(I_i)}",
    ],
  },
  "/assets/research/dependence/corner-capacity.png": {
    figure: "dependence-corner",
    evidence: [
      "illustrated on $`I=I_3=[0,2]`$ for $`\\beta=7/4`$, $`v=15/4`$, $`\\delta=0.35`$",
      "The blue region $`E_\\delta`$ stays away from the diagonal",
      "Return sources lie in the hatched triangles",
      "with $`\\lambda=\\min f`$, $`\\Lambda=\\max f`$, and $`\\Delta=\\xi_+-\\xi_-`$, violate $`M_\\delta\\le N_1+N_2`$",
    ],
  },
  "/assets/research/dependence/budget-comparison.png": {
    figure: "dependence-envelopes",
    evidence: [
      "2s-5/16,&0\\le s\\le1/96,\\\\\ns-29/96,&1/96\\le s\\le29/96.",
      "\\overline F(s):=\\min\\left\\{2s-\\frac5{16},\\frac43s-\\frac{13}{48}\\right\\}",
      "The inset shows the exact initial interval $`[0,1/96]`$ in green. The dashed line extrapolates its slope to $`J=5/32`$, whereas the critical budget lies in $`[13/64,29/96]`$.",
      "The guaranteed linear segment $`[0,s_{\\rm lin}]`$",
    ],
  },
  "/assets/research/dependence/optimal-flow-shares.png": {
    figure: "dependence-flow-shares",
    evidence: [
      "for $`\\vartheta=0`$ (U, top) and $`\\vartheta=1/4`$ (D, bottom). The panels evaluate the explicit shares $`a,b,1-a-b`$",
      "all use the same scale from zero to one",
      "Blank regions lie outside $`D`$.",
    ],
  },
};

/** The native drawing for a manuscript image, after checking its evidence. */
export function manuscriptFigureFor(slug: string, src: string, source: string) {
  const entry = manuscriptFigures[src];
  if (!entry) throw new Error(`Manuscript image ${src} in ${slug} has no native drawing.`);
  for (const evidence of entry.evidence) {
    if (!source.includes(evidence)) throw new Error(`Figure ${entry.figure} in ${slug} restates text missing from the article: ${evidence}`);
  }
  return entry.figure;
}

function anchorMatches(anchor: FigureAnchor, block: { type: string; source?: string; text?: string; firstCell?: string }) {
  if ("table" in anchor) return block.type === "table" && (block.firstCell ?? "").startsWith(anchor.table);
  return block.type === "paragraph" && (block.source ?? block.text ?? "").trimStart().startsWith(anchor.paragraph);
}

/**
 * Resolve an article's figures to the block each follows. `source` is the
 * article's complete text, against which every evidence string is checked.
 */
export function placeFigures(slug: string, blocks: ReadonlyArray<{ type: string; source?: string; text?: string; firstCell?: string }>, source: string) {
  const placements = new Map<number, string[]>();
  for (const placement of articleFigures[slug] ?? []) {
    const matches = blocks.flatMap((block, index) => (anchorMatches(placement.after, block) ? [index] : []));
    if (matches.length !== 1) throw new Error(`Figure ${placement.figure} in ${slug} must follow exactly one block; found ${matches.length}.`);
    for (const evidence of placement.evidence) {
      if (!source.includes(evidence)) throw new Error(`Figure ${placement.figure} in ${slug} restates text missing from the article: ${evidence}`);
    }
    placements.set(matches[0], [...(placements.get(matches[0]) ?? []), placement.figure]);
  }
  return placements;
}

export function emphasisFor(slug: string, firstCell: string) {
  return (tableEmphasis[slug] ?? []).find((entry) => firstCell.startsWith(entry.table));
}
