import type { Metadata } from "next";
import Link from "next/link";
import { ReturnArrow } from "./components/ReturnArrow";
import { SiteShell } from "./components/SiteShell";
import { createPageMetadata } from "./lib/content/site";
import styles from "./not-found.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Page Not Found",
  description: "The requested page could not be found on Theodore Ouyang's website.",
  path: "/404/",
});

export default function NotFound() {
  return (
    <SiteShell guides="index">
      <header className="page-intro">
        <h1>Page Not Found</h1>
        <p className="lede">
          The page you requested does not exist.
        </p>
        <Link className={`back-link ${styles.home}`} href="/">
          <ReturnArrow />Return Home
        </Link>
      </header>
    </SiteShell>
  );
}
