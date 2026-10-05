import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseResearchMarkdown, type ResearchArticleContent } from "./research-markdown";

export const SELECTED_RESEARCH_PATH = "/education/certified-valuation-arithmetic-asian-options/";
export const SELECTED_RESEARCH_TITLE = "Certified Valuation of Arithmetic Asian Options via Common Gaussian Smoothing";
export const SELECTED_RESEARCH_SUMMARY = "Developed a mathematical framework for certifying the pricing error introduced by a projected Euler implementation of arithmetic Asian options. Conditional Gaussian smoothing and validated transform arithmetic produce explicit bounds that account for payoff conversion, variance projection, integration tails, and rounding. For a specified one-year Heston call spread with twelve monthly observations, the absolute discretization bias is below 0.011025 price units. The study also derives a joint weak expansion for ten payoffs on a deterministic-variance family and bounds posterior price-quantile displacement under a specified stochastic-volatility prior.";

const source = JSON.parse(readFileSync(join(process.cwd(), "content", "selected-research", "certified-valuation-arithmetic-asian-options.json"), "utf8")) as Omit<ResearchArticleContent, "blocks"> & { sourceCommit: string };
if (source.slug !== "certified-valuation-arithmetic-asian-options" || source.title !== SELECTED_RESEARCH_TITLE || !source.markdown || !/^[a-f0-9]{40}$/u.test(source.sourceCommit)) {
  throw new Error("Incomplete selected research source.");
}

export const selectedResearch = { ...source, blocks: parseResearchMarkdown(source.markdown) };
