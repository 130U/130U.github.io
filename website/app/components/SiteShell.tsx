import type { ReactNode } from "react";
import type { ActivePage, ParentPage } from "../lib/content/site";
import { SiteNavigation } from "./SiteNavigation";
import { StructuralGrid } from "./StructuralGrid";

export function SiteShell({
  active,
  parent,
  children,
  frameClassName,
  showSkipLink = true,
  skipHref = "#main-content",
}: {
  active?: ActivePage;
  parent?: ParentPage;
  children: ReactNode;
  frameClassName?: string;
  showSkipLink?: boolean;
  skipHref?: `#${string}`;
}) {
  return (
    <div className="site-shell">
      {showSkipLink ? (
        <a className="skip-link" href={skipHref}>
          Skip to main content
        </a>
      ) : null}
      <div
        className={frameClassName ? `site-frame ${frameClassName}` : "site-frame"}
      >
        <StructuralGrid />
        <SiteNavigation active={active} parent={parent} />

        <main className="content-column" id="main-content">
          {children}
        </main>
      </div>

      <footer className="site-footer">
        <p>© 2026 Theodore Ouyang</p>
        <p>Beijing | Boston</p>
      </footer>
    </div>
  );
}
