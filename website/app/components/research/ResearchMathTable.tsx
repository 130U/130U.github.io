import type { CSSProperties } from "react";
import { RESEARCH_MATH_GUTTER_EM, type ResearchDisplayTableMarkup, type ResearchTableCell } from "../../lib/content/research-math";
import { ZoomGlyph } from "../ZoomGlyph";
import stageStyles from "./Stage.module.css";
import tableStyles from "./ResearchArticle.module.css";
import styles from "./ResearchMath.module.css";

/**
 * A display that is one array, set as a research table: the frame, its title,
 * the header band over a firm rule, rows on hairlines, row labels left and
 * columns of numbers right, the hovered row and column tinted, the magnifier and
 * the stage, and row labels kept in view while it scrolls (ZoomStage). Each cell
 * is drawn by the math pipeline at the table's size, or set as text in its face.
 * A numbered table stands its number beneath its frame at the column's right
 * edge, where every equation number stands. The drawing is decorative: one
 * assistive expression carries the whole display and its TeX.
 */
export function ResearchMathTable({ table, title, id, attributes }: {
  table: ResearchDisplayTableMarkup;
  title?: string;
  id?: string;
  attributes: Readonly<Record<string, string | number>>;
}) {
  const [head, ...body] = table.header ? table.rows : [undefined, ...table.rows];
  const cell = (entry: ResearchTableCell | null, column: number, heading: boolean) => {
    const Cell = heading ? "th" : "td";
    const { align, numeric } = table.columns[column];
    return (
      <Cell
        key={column}
        scope={heading ? "col" : undefined}
        className={[tableStyles.cell, numeric && tableStyles.numeric, styles.mathCell].filter(Boolean).join(" ")}
        data-align={align}
        data-cell={entry?.kind}
      >
        {entry?.kind === "text" && entry.text}
        {entry?.kind === "math" && (
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
        {title && <p className={tableStyles.tableTitle} data-table-title="">{title}</p>}
        <button type="button" className={`${stageStyles.control} ${tableStyles.zoom}`} data-table-zoom aria-label="Zoom in" aria-haspopup="dialog" hidden><ZoomGlyph /></button>
        <div tabIndex={0} role="region" aria-label="Table of mathematics" className={tableStyles.tableRegion}>
          <table className={tableStyles.table} data-research-table="" aria-hidden="true" style={{ "--math-gutter": `${RESEARCH_MATH_GUTTER_EM}em` } as CSSProperties}>
            {head && <thead><tr>{head.map((entry, column) => cell(entry, column, true))}</tr></thead>}
            <tbody>{body.map((row, index) => <tr key={index}>{row!.map((entry, column) => cell(entry, column, false))}</tr>)}</tbody>
          </table>
          <span className={styles.assistive} dangerouslySetInnerHTML={{ __html: table.mathml }} />
        </div>
      </div>
      {table.number && <p className={styles.tableNumber}><span data-equation-number="true" aria-hidden="true">{`(${table.number})`}</span></p>}
    </div>
  );
}
