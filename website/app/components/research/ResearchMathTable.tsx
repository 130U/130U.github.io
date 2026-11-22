import type { CSSProperties } from "react";
import { RESEARCH_MATH_GUTTER_EM, type ResearchDisplayTableMarkup, type ResearchTableCell } from "../../lib/content/research-math";
import { alignTexColumn } from "../../lib/content/research-number";
import { ZoomGlyph } from "../ZoomGlyph";
import { TableValue } from "./TableValue";
import stageStyles from "./Stage.module.css";
import tableStyles from "./ResearchArticle.module.css";
import styles from "./ResearchMath.module.css";

/**
 * A display that is one array, set as a research table: the frame, its title,
 * the header band over a firm rule, rows on hairlines, row labels left and
 * columns of numbers right, the hovered row and column tinted, the magnifier and
 * the stage, and row labels kept in view while it scrolls (ZoomStage); every
 * cell holds one line. Each cell is drawn by the math pipeline at the table's
 * size, or set as text in its face;
 * a column whose every cell writes only numbers is a column of values, set as a
 * research table sets its values (TableValue). A numbered table is identified
 * by its number at the frame's top-left, in the title's place, as a manuscript
 * table is by "Table N.". The drawing is decorative: one assistive expression
 * carries the whole display and its TeX.
 */
export function ResearchMathTable({ table, title, heads, id, attributes }: {
  table: ResearchDisplayTableMarkup;
  title?: string;
  /** Column heads the site gives a table its manuscript does not head (math-tables.ts). */
  heads?: readonly string[];
  id?: string;
  attributes: Readonly<Record<string, string | number>>;
}) {
  const [head, ...body] = table.header
    ? table.rows
    : [heads?.map((text): ResearchTableCell | null => (text ? { kind: "text", text } : null)), ...table.rows];
  const columns = table.columns.map(({ numeric }, column) => (numeric ? alignTexColumn(body.map((row) => {
    const entry = row![column];
    return entry?.kind === "math" ? entry.tex : "";
  })) : undefined));
  const cell = (entry: ResearchTableCell | null, column: number, row?: number) => {
    const Cell = row === undefined ? "th" : "td";
    const { align, numeric } = table.columns[column];
    const value = row === undefined ? undefined : columns[column]?.values[row];
    return (
      <Cell
        key={column}
        scope={row === undefined ? "col" : undefined}
        className={[tableStyles.cell, numeric && tableStyles.numeric, columns[column]?.start && tableStyles.alignStart, styles.mathCell].filter(Boolean).join(" ")}
        data-align={align}
        data-cell={value ? "value" : entry?.kind}
      >
        {value && <TableValue value={value} />}
        {!value && entry?.kind === "text" && entry.text}
        {!value && entry?.kind === "math" && (
          <span
            className={styles.cellMath}
            style={{ verticalAlign: `${Number((RESEARCH_MATH_GUTTER_EM - entry.depthEm).toFixed(6))}em` }}
            dangerouslySetInnerHTML={{ __html: entry.svg }}
          />
        )}
      </Cell>
    );
  };
  return (
    <div {...attributes} id={id} className={styles.mathTableBlock} data-math-table="">
      <div className={`${tableStyles.tableFrame} ${styles.mathTable}`} data-table-frame="">
        {(title || table.number) && (
          <p className={tableStyles.tableTitle} data-table-title="">
            {table.number && <span className={tableStyles.titleNumber} data-equation-number="true" aria-hidden="true">{`(${table.number})`}</span>}
            {table.number && title ? " " : null}
            {title}
          </p>
        )}
        <button type="button" className={`${stageStyles.control} ${tableStyles.zoom}`} data-table-zoom aria-label="Zoom in" aria-haspopup="dialog" hidden><ZoomGlyph /></button>
        <div tabIndex={0} role="region" aria-label="Table of mathematics" className={tableStyles.tableRegion}>
          <table className={tableStyles.table} data-research-table="" aria-hidden="true" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
            {head && <thead><tr>{head.map((entry, column) => cell(entry, column))}</tr></thead>}
            <tbody>{body.map((entries, index) => <tr key={index}>{entries!.map((entry, column) => cell(entry, column, index))}</tr>)}</tbody>
          </table>
          <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: table.mathml }} />
        </div>
      </div>
    </div>
  );
}
