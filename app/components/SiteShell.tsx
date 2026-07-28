import Link from "next/link";
import type { ReactNode } from "react";

type ActivePage = "home" | "education" | "experience" | "posts";

const navigation: Array<{ key: ActivePage; label: string; href: string }> = [
  { key: "home", label: "Home", href: "/" },
  { key: "education", label: "Education", href: "/education/" },
  { key: "experience", label: "Past Experience", href: "/past-experience/" },
  { key: "posts", label: "Personal Posts", href: "/personal-posts/" },
];

export function SiteShell({
  active,
  children,
}: {
  active: ActivePage;
  children: ReactNode;
}) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="wordmark" href="/" aria-label="Theodore Ouyang home">
            Theodore Ouyang
          </Link>
          <nav className="primary-nav" aria-label="Primary navigation">
            {navigation.map((item) => (
              <Link
                className={item.key === active ? "active" : undefined}
                href={item.href}
                key={item.key}
                aria-current={item.key === active ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <div className="site-frame">
        <aside className="profile-sidebar" aria-label="Profile">
          <div className="monogram" aria-hidden="true">
            <span>TO</span>
          </div>
          <h2>Theodore Ouyang</h2>
          <p className="sidebar-bio">
            Sequoia Scholar, Cohort 8 | AI Entrepreneur | Duke University ’25
          </p>
          <ul className="profile-links">
            <li><span aria-hidden="true">⌖</span><span>Beijing, China</span></li>
            <li><span aria-hidden="true">▦</span><span>Duke University</span></li>
            <li>
              <span aria-hidden="true">@</span>
              <a href="mailto:10@alumni.duke.edu">10@alumni.duke.edu</a>
            </li>
            <li>
              <span className="gh-mark" aria-hidden="true">GH</span>
              <a href="https://github.com/130U" rel="me">GitHub</a>
            </li>
          </ul>
        </aside>

        <main className="content-column">{children}</main>
      </div>

      <footer className="site-footer">
        <p>© 2026 Theodore Ouyang</p>
        <p>Beijing · New York</p>
      </footer>
    </div>
  );
}
