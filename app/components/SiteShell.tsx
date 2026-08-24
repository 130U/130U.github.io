import type { ReactNode } from "react";
import type { ActivePage } from "../lib/content/site";
import { SiteNavigation } from "./SiteNavigation";

export function SiteShell({
  active,
  children,
  frameClassName,
  showSkipLink = true,
  skipHref = "#main-content",
}: {
  active?: ActivePage;
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
        <SiteNavigation active={active} />

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
