import type { Metadata } from "next";
import Link from "next/link";
import { ReturnArrow } from "./components/ReturnArrow";
import { SiteShell } from "./components/SiteShell";
import { createPageMetadata } from "./lib/content/site";

export const metadata: Metadata = createPageMetadata({
  title: "Page Not Found",
  description: "The requested page could not be found on Theodore Ouyang's website.",
  path: "/404/",
});

export default function NotFound() {
  return (
    <SiteShell>
      <header className="page-intro">
        <p className="section-kicker">404</p>
        <h1>Page Not Found</h1>
        <p className="lede">
          The page you requested does not exist.
        </p>
        <Link className="back-link" href="/">
          <ReturnArrow />Return Home
        </Link>
      </header>
    </SiteShell>
  );
}
