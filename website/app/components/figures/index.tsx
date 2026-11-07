import type { ComponentType } from "react";
import { aiResearchFigures } from "./ai-research";
import { legalResearchFigures } from "./legal-research";
import { selectedResearchFigures } from "./selected-research";

export { FigureController } from "./FigureController";

const figures: Readonly<Record<string, ComponentType>> = { ...selectedResearchFigures, ...aiResearchFigures, ...legalResearchFigures };

/** One registered article figure, placed by `app/lib/content/article-figures.ts`. */
export function ArticleFigure({ id }: { id: string }) {
  const Figure = figures[id];
  if (!Figure) throw new Error(`Unknown article figure: ${id}`);
  return <Figure />;
}
