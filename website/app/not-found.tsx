import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "./components/SiteShell";
import { createPageMetadata } from "./lib/content/site";

export const metadata: Metadata = createPageMetadata({
  title: "Page not found",
  description: "The requested page could not be found on Theodore Ouyang's website.",
  path: "/404/",
});

export default function NotFound() {
  return (
    <SiteShell>
      <header className="page-intro plain-page-intro">
        <p className="section-kicker">404</p>
        <h1>Page not found</h1>
        <p className="lede">
          The page you requested may have moved or may no longer exist.
        </p>
        <Link className="back-link" href="/">
          <span aria-hidden="true">←</span> Return home
        </Link>
      </header>
    </SiteShell>
  );
}
