import type { CSSProperties } from "react";
import {
  RESEARCH_MATH_GUTTER_EM, RESEARCH_MATH_INLINE_SPACE_EM, RESEARCH_MATH_ROW_SPACING_EM, RESEARCH_TABLE_ABOVE_RULE_EM, RESEARCH_TABLE_BELOW_RULE_EM,
  renderResearchDisplayTable, renderResearchMath, type ResearchDisplayTableMarkup,
} from "../../lib/content/research-math";
import { proseNumber } from "../../lib/content/research-number";
import styles from "./ResearchMath.module.css";

/** A display that is one array, set as a formal table: rows a line of mathematics apart, columns
 * aligned as the manuscript aligns them, a firm rule under the row that heads the columns. The
 * drawing is decorative; the assistive expression beside it carries the whole display and its TeX. */
function DisplayTable({ table }: { table: ResearchDisplayTableMarkup }) {
  return (
    <span
      className={styles.table}
      data-display-table=""
      aria-hidden="true"
      style={{
        "--row-gap": `${RESEARCH_MATH_ROW_SPACING_EM}em`,
        "--above-rule": `${RESEARCH_TABLE_ABOVE_RULE_EM}em`,
        "--below-rule": `${RESEARCH_TABLE_BELOW_RULE_EM}em`,
        verticalAlign: `calc(${table.raiseEm}em + ${table.raisePx}px)`,
      } as CSSProperties}
    >
      {table.rows.map((row, rowIndex) => (
        <span key={rowIndex} className={styles.row} data-rule={row.rule} style={row.extraEm ? { "--row-extra": `${row.extraEm}em` } as CSSProperties : undefined}>
          {row.cells.map((cell, column) => (
            <span key={column} className={styles.cell} data-align={table.columns[column].align} style={{ "--column-gap": `${table.columns[column].gapEm}em` } as CSSProperties}>
              <span className={styles.strut} />
              {cell && <span className={styles.cellMath} style={{ verticalAlign: `${Number((RESEARCH_MATH_GUTTER_EM - cell.depthEm).toFixed(6))}em` }} dangerouslySetInnerHTML={{ __html: cell.svg }} />}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

/** `tightStart` and `tightEnd` close the formula's side up to a bracket or punctuation mark, as in the papers.
 * `reserveCh` narrows a wide formula's scroll box so the punctuation glued to it stays on its line. */
export function ResearchMath({ tex, display = false, tightStart = false, tightEnd = false, reserveCh }: { tex: string; display?: boolean; tightStart?: boolean; tightEnd?: boolean; reserveCh?: number }) {
  const table = display ? renderResearchDisplayTable(tex) : undefined;
  if (table) {
    return (
      <span className={`${styles.formula} ${styles.display}`} data-research-formula="display" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
        <span className={styles.expression}><DisplayTable table={table} /></span>
        <span className={styles.equationEdge} data-equation-number={table.number ? true : undefined} aria-hidden="true">{table.number && `(${table.number})`}</span>
        <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: table.mathml }} />
      </span>
    );
  }
  const formula = renderResearchMath(tex, display);
  const assistive = <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: formula.mathml }} />;
  if (display) {
    return (
      <span className={`${styles.formula} ${styles.display}`} data-research-formula="display" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
        <span className={styles.expression} dangerouslySetInnerHTML={{ __html: formula.svg }} />
        <span className={styles.equationEdge} data-equation-number={formula.number ? true : undefined} aria-hidden="true">{formula.number && `(${formula.number})`}</span>
        {assistive}
      </span>
    );
  }
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
        marginInlineStart: `${(tightStart ? 0 : RESEARCH_MATH_INLINE_SPACE_EM) - RESEARCH_MATH_GUTTER_EM}em`,
        marginInlineEnd: `${(tightEnd ? 0 : RESEARCH_MATH_INLINE_SPACE_EM) - RESEARCH_MATH_GUTTER_EM}em`,
        // The box's baseline is its lower margin edge, the expression's own depth below the text baseline.
        verticalAlign: `${Number((RESEARCH_MATH_GUTTER_EM - formula.depthEm).toFixed(6))}em`,
        // The box may span the line less the negative margins' overlap and the glued punctuation.
        ...(reserveCh ? { maxWidth: `calc(100% + ${2 * RESEARCH_MATH_GUTTER_EM - (tightStart ? 0 : RESEARCH_MATH_INLINE_SPACE_EM) - (tightEnd ? 0 : RESEARCH_MATH_INLINE_SPACE_EM)}em - ${reserveCh}ch)` } : {}),
      } as CSSProperties}
    >
      <span dangerouslySetInnerHTML={{ __html: formula.svg }} />
      {assistive}
    </span>
  );
}
