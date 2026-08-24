"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation, type ActivePage } from "../lib/content/site";

export function SiteNavigation({
  active,
  showProfile,
}: {
  active?: ActivePage;
  showProfile: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef(false);

  const closeMenu = (restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus;
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!panel || !toggle) return;

    document.body.classList.add("menu-open");
    const focusable = () => [
      toggle,
      ...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    const firstLink = panel.querySelector<HTMLElement>("a[href]");
    const focusFrame = requestAnimationFrame(() => firstLink?.focus());

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items.at(-1) ?? first;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.classList.remove("menu-open");
      document.removeEventListener("keydown", onKeyDown);
      if (restoreFocusRef.current) toggle.focus();
      restoreFocusRef.current = false;
    };
  }, [menuOpen]);

  return (
    <div className="site-rail" data-menu-open={menuOpen ? "true" : "false"}>
      <div className="rail-header">
        <Link className="wordmark" href="/" aria-label="Theodore Ouyang home">
          <span className="wordmark-dither" aria-hidden="true" />
          <span>Theodore Ouyang</span>
        </Link>
        <button
          aria-controls="site-menu"
          aria-expanded={menuOpen}
          className="menu-toggle"
          onClick={() => (menuOpen ? closeMenu(true) : setMenuOpen(true))}
          ref={toggleRef}
          type="button"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className="rail-panel" id="site-menu" ref={panelRef}>
        <nav className="primary-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              aria-current={item.key === active ? "page" : undefined}
              className={item.key === active ? "active" : undefined}
              href={item.href}
              key={item.key}
              onClick={() => closeMenu(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {showProfile ? (
          <aside className="profile-sidebar" aria-label="Profile">
            <div className="avatar-frame">
              <picture>
                <source
                  type="image/avif"
                  srcSet="/assets/profile/theodore-avatar-warm-384.avif 384w, /assets/profile/theodore-avatar-warm-768.avif 768w"
                  sizes="(max-width: 767px) 84px, 116px"
                />
                <source
                  type="image/webp"
                  srcSet="/assets/profile/theodore-avatar-warm-384.webp 384w, /assets/profile/theodore-avatar-warm-768.webp 768w"
                  sizes="(max-width: 767px) 84px, 116px"
                />
                <img
                  src="/assets/profile/theodore-avatar-warm.png"
                  alt="Illustrated portrait of Theodore Ouyang"
                  width="1024"
                  height="1536"
                  sizes="(max-width: 767px) 84px, 116px"
                />
              </picture>
            </div>
            <p className="profile-name">Theodore Ouyang</p>
            <p className="sidebar-bio">
              <span>Exploring practical AI use cases</span>
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
        ) : null}
      </div>
    </div>
  );
}
