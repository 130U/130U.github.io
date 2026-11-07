import type { ComponentType, ReactNode } from "react";
import { aiResearchFigures } from "./ai-research";
import { dependenceManuscriptFigures, type ManuscriptFigureProps } from "./dependence-manuscript";
import { legalResearchFigures } from "./legal-research";
import { selectedResearchFigures } from "./selected-research";

export { FigureController } from "./FigureController";

const figures: Readonly<Record<string, ComponentType>> = { ...selectedResearchFigures, ...aiResearchFigures, ...legalResearchFigures };
const manuscriptFigures: Readonly<Record<string, ComponentType<ManuscriptFigureProps>>> = dependenceManuscriptFigures;

/** One registered article figure, placed by `app/lib/content/article-figures.ts`. */
export function ArticleFigure({ id }: { id: string }) {
  const Figure = figures[id];
  if (!Figure) throw new Error(`Unknown article figure: ${id}`);
  return <Figure />;
}

/** A manuscript figure drawn natively, keeping the manuscript's caption, anchor and block marker. */
export function ManuscriptFigure({ id, anchor, captionId, attributes, caption }: { id: string; anchor?: string; captionId: string; attributes: Record<string, string | number>; caption: ReactNode }) {
  const Figure = manuscriptFigures[id];
  if (!Figure) throw new Error(`Unknown manuscript figure: ${id}`);
  return <Figure manuscript={{ anchor, captionId, attributes }} caption={caption} />;
}
