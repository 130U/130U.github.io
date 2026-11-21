import type { CSSProperties, ReactNode } from "react";
import {
  RESEARCH_MATH_GUTTER_EM, renderResearchDisplayStack, renderResearchMath, researchNumberDropEm,
  type ResearchDisplayStackMarkup, type ResearchDisplayStackRow,
} from "../../lib/content/research-math";
import { proseNumber } from "../../lib/content/research-number";
import styles from "./ResearchMath.module.css";

const em = (value: number | undefined) => value === undefined ? undefined : `${value}em`;

/** The spaces above a row, as it and the row above stand whole or part (ResearchMath.module.css). */
function rowSpaces(row: ResearchDisplayStackRow) {
  const spaces = {
    "--row-space": row.spaceEm ? em(row.spaceEm) : undefined,
    "--row-space-after-parted": em(row.spaceAfterPartedEm),
    "--parted-row-space": em(row.partedSpaceEm),
    "--parted-row-space-after-parted": em(row.partedSpaceAfterPartedEm),
    "--hang": em(row.hangEm),
  };
  const set = Object.entries(spaces).filter(([, value]) => value !== undefined);
  return set.length ? Object.fromEntries(set) as CSSProperties : undefined;
}

/** A display of formulas the manuscript sets side by side, set as rows: one formula to a row on the
 * display's axis, rows a line of mathematics apart (the renderer gives each row the space above
 * it), the number on the last row's baseline. Each row is drawn from its own slice of the TeX,
 * which the row names by its offsets; a row that may part is drawn as its parts, which stand side
 * by side where the whole row's drawing sets them and take lines of their own where the row would
 * otherwise scroll (MathFit). The drawing is decorative, and the assistive expression beside it
 * carries the whole display and its TeX. */
function DisplayStack({ stack }: { stack: ResearchDisplayStackMarkup }) {
  return (
    <span className={styles.stack} data-display-stack="" aria-hidden="true">
      {stack.rows.map((row) => (
        <span key={row.start} className={styles.stackRow} data-stack-row={`${row.start} ${row.end}`} data-row-parts={row.parts ? "" : undefined} style={rowSpaces(row)}>
          {row.parts
            ? row.parts.map((part) => (
              <span
                key={part.start}
                className={styles.rowPart}
                data-row-part={part.kind}
                data-part={`${part.start} ${part.end}`}
                style={{ "--join": em(part.joinEm), "--part-space": em(part.spaceEm) } as CSSProperties}
              >
                <span className={styles.rowMath} dangerouslySetInnerHTML={{ __html: part.svg }} />
              </span>
            ))
            : <span className={styles.rowMath} dangerouslySetInnerHTML={{ __html: row.svg }} />}
        </span>
      ))}
    </span>
  );
}

/** A displayed equation: its expression in a box of its own, which scrolls where the expression is
 * wider than the column, and its number beside it, or on a line of its own beneath it where the
 * expression leaves no room beside it (ResearchMath.module.css, MathFit). */
function Display({ drawing, number, numberDropEm, numberDropPartedEm, mathml }: {
  drawing: ReactNode; number?: string; numberDropEm: number; numberDropPartedEm?: number; mathml: string;
}) {
  return (
    <span
      className={`${styles.formula} ${styles.display}`}
      data-research-formula="display"
      style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em`, "--number-drop": em(numberDropEm), "--number-drop-parted": em(numberDropPartedEm) } as CSSProperties}
    >
      <span className={styles.equationScroll} data-equation-scroll="" tabIndex={0} role="region" aria-label="Mathematical equation">
        {drawing}
        <span className={styles.fade} data-equation-fade="" aria-hidden="true" />
        <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: mathml }} />
      </span>
      {number && <span className={styles.equationEdge} data-equation-edge="" data-equation-number="true" aria-hidden="true">{`(${number})`}</span>}
    </span>
  );
}

/** An inline formula stands in its line as a word does: its canvas gutters lie in
 * negative margins, so the word space alone parts it from the words beside it.
 * `reserveCh` narrows a wide formula's scroll box so the punctuation glued to it stays on its line. */
export function ResearchMath({ tex, display = false, reserveCh }: { tex: string; display?: boolean; reserveCh?: number }) {
  const stack = display ? renderResearchDisplayStack(tex) : undefined;
  if (stack) {
    return <Display
      drawing={<span className={styles.expression}><DisplayStack stack={stack} /></span>}
      number={stack.number}
      numberDropEm={stack.numberDropEm}
      numberDropPartedEm={stack.numberDropPartedEm}
      mathml={stack.mathml}
    />;
  }
  const formula = renderResearchMath(tex, display);
  if (display) {
    return <Display
      drawing={<span className={styles.expression} dangerouslySetInnerHTML={{ __html: formula.svg }} />}
      number={formula.number}
      numberDropEm={researchNumberDropEm(formula)}
      mathml={formula.mathml}
    />;
  }
  const assistive = <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: formula.mathml }} />;
  const scrollableInline = formula.widthEm - 2 * RESEARCH_MATH_GUTTER_EM > 5;
  const numeric = proseNumber(tex);
  if (numeric) {
    return <span
      className={`${styles.number}${scrollableInline ? ` ${styles.numberScroll}` : ""}`}
      data-research-formula="inline"
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
    >
      <span data-research-number aria-hidden="true">{numeric.base}{numeric.exponent !== undefined && <sup>{numeric.exponent}</sup>}{numeric.suffix}</span>
      {assistive}
    </span>;
  }
  return (
    <span
      className={`${styles.formula} ${styles.inline}`}
      data-research-formula="inline"
      tabIndex={scrollableInline ? 0 : undefined}
      aria-label={scrollableInline ? "Scrollable mathematical expression" : undefined}
      style={{
        "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em`,
        marginInline: `${-RESEARCH_MATH_GUTTER_EM}em`,
        // The box's baseline is its lower margin edge, the expression's own depth below the text baseline.
        verticalAlign: `${Number((RESEARCH_MATH_GUTTER_EM - formula.depthEm).toFixed(6))}em`,
        // The box may span the line less the negative margins' overlap and the glued punctuation.
        ...(reserveCh ? { maxWidth: `calc(100% + ${2 * RESEARCH_MATH_GUTTER_EM}em - ${reserveCh}ch)` } : {}),
      } as CSSProperties}
    >
      <span dangerouslySetInnerHTML={{ __html: formula.svg }} />
      {assistive}
    </span>
  );
}
