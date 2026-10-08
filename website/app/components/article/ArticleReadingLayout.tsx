import type { ReactNode } from "react";
import { ArticleContents, type ArticleContentsItem } from "./ArticleContents";
import styles from "../../past-experience/components/LegalPaperPage.module.css";

export function ArticleReadingLayout({ overview, items, children }: {
  overview: ReactNode;
  items: ArticleContentsItem[];
  children: ReactNode;
}) {
  return (
    <div className={styles.readingLayout}>
      <div className={`${styles.abstract} ${styles.overview}`} data-article-overview>
        {overview}
      </div>
      <ArticleContents items={items} />
      <div className={styles.readingColumn} data-article-body>
        {children}
      </div>
    </div>
  );
}
