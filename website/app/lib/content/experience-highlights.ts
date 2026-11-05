export type Metric = { value: string; label: string };
export type FlowNode = { title: string; detail: string; accent?: boolean };
export type ArchitectureFlow = { caption: string; stages: FlowNode[][]; feedback: string };
export type ExperienceHighlight = { metrics: Metric[]; flow: ArchitectureFlow };

export const profileMetrics: Metric[] = [
  { value: "300+", label: "specialists coordinated in LLM post-training" },
  { value: "$300B+", label: "AUM at my investment research partner" },
  { value: "3", label: "mathematical finance papers with complete proofs" },
];

// Keyed by Experience entry ID. Every figure comes from the project's manuscript, and
// benchmark results name their setting.
export const experienceHighlights: Readonly<Record<number, ExperienceHighlight>> = {
  1: {
    metrics: [
      { value: "300+", label: "specialists coordinated across several domains" },
      { value: "17.79%", label: "lower estimation variance than uniform sampling, synthetic benchmark" },
      { value: "8.89%", label: "lower post-review error loss, analytical example" },
    ],
    flow: {
      caption: "Measurement and correction run as separate decisions over the same submissions.",
      stages: [
        [{ title: "Submissions", detail: "Task metadata and contributor history set each task's error risk" }],
        [
          { title: "Reference audit", detail: "Sampled by residual uncertainty and verification cost", accent: true },
          { title: "Review allocation", detail: "Assigned by expected loss reduction under capacity limits", accent: true },
        ],
        [{ title: "Expert adjudication", detail: "Specialists decide acceptance under explicit criteria" }],
        [
          { title: "Population quality", detail: "Corrected estimate from independent audits" },
          { title: "Post-training data", detail: "Reviewed feedback with defects removed" },
        ],
      ],
      feedback: "Adjudications update reliability posteriors, acceptance criteria and review intensity",
    },
  },
  2: {
    metrics: [
      { value: "1.21 × 10^−14", label: "maximum constraint residual across 200,000 synthetic draws" },
      { value: "40.13%", label: "inherited-label error quantified when labels are not recomputed" },
      { value: "Batch Zero", label: "extended by the company to other post-training programs" },
    ],
    flow: {
      caption: "Batch Zero gates each task family before it enters large-scale data construction.",
      stages: [
        [{ title: "Task design", detail: "Capability taxonomy, evidence standards and decisive variables" }],
        [{ title: "Synthesis", detail: "Copulas, projections, CTGAN, TabDDPM and SDEs matched to structure" }],
        [{ title: "Validity checks", detail: "Accounting constraints, decision margins and information sets" }],
        [{ title: "Batch Zero", detail: "Independent execution and expert calibration before Batch One", accent: true }],
      ],
      feedback: "Failures and disagreements revise task instructions, reference solutions and acceptance criteria",
    },
  },
  3: {
    metrics: [
      { value: "0.0%", label: "false acceptance with certificate checking, 3,600 benchmark submissions" },
      { value: "0.0%", label: "false rejection with certificate checking, same benchmark" },
      { value: "75.0%", label: "false acceptance with final-answer matching, same benchmark" },
    ],
    flow: {
      caption: "Three review layers read the answer, the visible reasoning and the execution evidence together.",
      stages: [
        [{ title: "Model run", detail: "Final answer, visible chain of thought, tool calls and intermediate outputs" }],
        [
          { title: "Code and rules", detail: "Verifiable answers and hard requirements", accent: true },
          { title: "LLM-as-a-Judge", detail: "Semantic screening", accent: true },
          { title: "Specialist scholars", detail: "Domain judgments and disputed cases", accent: true },
        ],
        [{ title: "Proof obligations", detail: "Dependency graphs and checkable certificates" }],
        [{ title: "Separate records", detail: "Correctness, compliance and efficiency" }],
      ],
      feedback: "Traceable supervision signals feed post-training, with grading bias analyzed at the objective",
    },
  },
  4: {
    metrics: [
      { value: "$300B+", label: "AUM at the alternative asset manager" },
      { value: "0.6 pt", label: "pairwise advantage certified that separate intervals could not show" },
      { value: "0.61 → 0", label: "worst-case decision regret, eight-scenario benchmark" },
    ],
    flow: {
      caption: "Each verified fact moves through the scores, the ranking bounds and the next query.",
      stages: [
        [{ title: "Evidence ingestion", detail: "Reports, statements, disclosures and datasets with source records" }],
        [{ title: "Rashomon scoring", detail: "Companies scored across a near-optimal model set" }],
        [{ title: "Ranking bounds", detail: "Support functions certify which comparisons hold" }],
        [{ title: "Verification query", detail: "Minimax regret picks the next fact to verify", accent: true }],
      ],
      feedback: "Each correction triggers rescoring and attribution updates through versioned evidence",
    },
  },
};
