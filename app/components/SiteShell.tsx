import Link from "next/link";
import type { ReactNode } from "react";
import { navigation, type ActivePage } from "../lib/content/site";

export function SiteShell({
  active,
  children,
  background,
  variant = "default",
}: {
  active?: ActivePage;
  children: ReactNode;
  background?: ReactNode;
  variant?: "default" | "particle";
}) {
  return (
    <div className={`site-shell site-shell--${variant}`}>
      {background}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
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
          <div className="avatar-frame">
            {/* Static GitHub Pages deployment serves this pre-sized portrait directly. */}
            <picture>
              <source
                type="image/avif"
                srcSet="/assets/profile/theodore-avatar-warm-384.avif 384w, /assets/profile/theodore-avatar-warm-768.avif 768w"
                sizes="(max-width: 470px) 86px, (max-width: 720px) 104px, (max-width: 930px) 148px, 164px"
              />
              <source
                type="image/webp"
                srcSet="/assets/profile/theodore-avatar-warm-384.webp 384w, /assets/profile/theodore-avatar-warm-768.webp 768w"
                sizes="(max-width: 470px) 86px, (max-width: 720px) 104px, (max-width: 930px) 148px, 164px"
              />
              <img
                src="/assets/profile/theodore-avatar-warm.png"
                alt="Illustrated portrait of Theodore Ouyang"
                width="1024"
                height="1536"
                sizes="(max-width: 470px) 86px, (max-width: 720px) 104px, (max-width: 930px) 148px, 164px"
              />
            </picture>
          </div>
          <p className="profile-name">Theodore Ouyang</p>
          <p className="sidebar-bio">
            <span>Exploring practical AI use cases</span>
            <span>Duke B.S. &amp; M.Eng.</span>
            <span>Sequoia Scholar, Cohort 8</span>
          </p>
          <ul className="profile-links">
            <li><span aria-hidden="true">⌖</span><span>Beijing | Boston</span></li>
            <li><span aria-hidden="true">◇</span><span>Duke University</span></li>
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
