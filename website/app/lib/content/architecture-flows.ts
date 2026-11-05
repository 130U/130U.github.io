export type ArchitectureFlow = { stages: string[][]; caption: string };

// Keyed by Experience entry ID. Each flow restates the system its manuscript describes.
export const architectureFlows: Readonly<Record<number, ArchitectureFlow>> = {
  1: {
    stages: [["Submissions"], ["Reference audit", "Review allocation"], ["Expert adjudication"], ["Population quality", "Post-training data"]],
    caption: "Measurement and correction run as separate decisions over the same submissions. Adjudications update reliability posteriors, acceptance criteria and review intensity.",
  },
  2: {
    stages: [["Task design"], ["Synthesis"], ["Validity checks"], ["Batch Zero"]],
    caption: "Batch Zero gates each task family before large-scale data construction. Failures and disagreements revise task instructions, reference solutions and acceptance criteria.",
  },
  3: {
    stages: [["Model run"], ["Code and rules", "LLM-as-a-Judge", "Specialist scholars"], ["Proof obligations"], ["Separate records"]],
    caption: "Three review layers read the answer, the visible reasoning and the execution evidence together, and correctness, compliance and efficiency are recorded apart.",
  },
  4: {
    stages: [["Evidence ingestion"], ["Rashomon scoring"], ["Ranking bounds"], ["Verification query"]],
    caption: "Minimax regret picks the next fact to verify, and each correction triggers rescoring and attribution updates through versioned evidence.",
  },
};
