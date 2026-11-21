import type { CSSProperties } from "react";
import {
  RESEARCH_MATH_GUTTER_EM, RESEARCH_MATH_ROW_SPACING_EM, RESEARCH_TABLE_ABOVE_RULE_EM, RESEARCH_TABLE_BELOW_RULE_EM,
  renderResearchDisplayStack, renderResearchDisplayTable, renderResearchMath, type ResearchDisplayStackMarkup, type ResearchDisplayTableMarkup,
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

/** A display of formulas the manuscript sets side by side, set as rows: one formula to a row on the
 * display's axis, rows a line of mathematics apart (the renderer gives each row the space above
 * it), the number on the last row's baseline. Each row is drawn from its own slice of the TeX,
 * which the row names by its offsets; the drawing is decorative, and the assistive expression
 * beside it carries the whole display and its TeX. */
function DisplayStack({ stack }: { stack: ResearchDisplayStackMarkup }) {
  return (
    <span className={styles.stack} data-display-stack="" aria-hidden="true">
      {stack.rows.map((row) => (
        <span key={row.start} className={styles.stackRow} data-stack-row={`${row.start} ${row.end}`} style={row.spaceEm ? { "--row-space": `${row.spaceEm}em` } as CSSProperties : undefined}>
          <span className={styles.rowMath} dangerouslySetInnerHTML={{ __html: row.svg }} />
        </span>
      ))}
    </span>
  );
}

/** An inline formula stands in its line as a word does: its canvas gutters lie in
 * negative margins, so the word space alone parts it from the words beside it.
 * `reserveCh` narrows a wide formula's scroll box so the punctuation glued to it stays on its line. */
export function ResearchMath({ tex, display = false, reserveCh }: { tex: string; display?: boolean; reserveCh?: number }) {
  const table = display ? renderResearchDisplayTable(tex) : undefined;
  if (table) {
    return (
      <span className={`${styles.formula} ${styles.display}`} data-research-formula="display" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
        <span className={styles.expression}><DisplayTable table={table} /></span>
        <span className={styles.equationEdge} data-equation-edge="" data-equation-number={table.number ? true : undefined} aria-hidden="true">{table.number && `(${table.number})`}</span>
        <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: table.mathml }} />
      </span>
    );
  }
  const stack = display ? renderResearchDisplayStack(tex) : undefined;
  if (stack) {
    return (
      <span className={`${styles.formula} ${styles.display}`} data-research-formula="display" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
        <span className={styles.expression}><DisplayStack stack={stack} /></span>
        <span className={styles.equationEdge} data-equation-edge="" data-equation-number={stack.number ? true : undefined} aria-hidden="true">{stack.number && `(${stack.number})`}</span>
        <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: stack.mathml }} />
      </span>
    );
  }
  const formula = renderResearchMath(tex, display);
  const assistive = <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: formula.mathml }} />;
  if (display) {
    return (
      <span className={`${styles.formula} ${styles.display}`} data-research-formula="display" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
        <span className={styles.expression} dangerouslySetInnerHTML={{ __html: formula.svg }} />
        <span className={styles.equationEdge} data-equation-edge="" data-equation-number={formula.number ? true : undefined} aria-hidden="true">{formula.number && `(${formula.number})`}</span>
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
