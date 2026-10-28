"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation, type ActivePage, type ParentPage } from "../lib/content/site";

export function SiteNavigation({
  active,
  parent,
}: {
  active?: ActivePage;
  parent?: ParentPage;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusFirstLinkRef = useRef(false);
  const restoreFocusRef = useRef(false);

  const closeMenu = (restoreFocus: boolean) => {
    restoreFocusRef.current = restoreFocus;
    setMenuOpen(false);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    rail.dataset.enhanced = "true";
    // The mobile fallback navigation occupies more height before enhancement.
    // Restore section bookmarks after it collapses so the heading stays in view.
    const anchorFrame = window.location.hash
      ? requestAnimationFrame(() => {
          document.getElementById(window.location.hash.slice(1))?.scrollIntoView({
            block: "start",
            behavior: "instant",
          });
        })
      : 0;
    return () => {
      cancelAnimationFrame(anchorFrame);
      delete rail.dataset.enhanced;
    };
  }, [active, parent?.href]);

  useEffect(() => {
    if (!menuOpen) return;

    const panel = panelRef.current;
    const toggle = toggleRef.current;
    if (!panel || !toggle) return;

    document.body.classList.add("menu-open");
    const backgroundRegions = document.querySelectorAll<HTMLElement>(
      "main, footer, .skip-link, section[data-state]",
    );
    backgroundRegions.forEach((region) => {
      region.inert = true;
    });
    const focusable = () => [
      toggle,
      ...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ];
    const firstLink = panel.querySelector<HTMLElement>("a[href]");
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const onViewportChange = () => {
      if (desktopQuery.matches) closeMenu(false);
    };
    const focusFrame = focusFirstLinkRef.current
      ? requestAnimationFrame(() => firstLink?.focus())
      : 0;
    focusFirstLinkRef.current = false;

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
    desktopQuery.addEventListener("change", onViewportChange);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.classList.remove("menu-open");
      backgroundRegions.forEach((region) => {
        region.inert = false;
      });
      document.removeEventListener("keydown", onKeyDown);
      desktopQuery.removeEventListener("change", onViewportChange);
      if (restoreFocusRef.current) toggle.focus();
      restoreFocusRef.current = false;
    };
  }, [menuOpen]);

  return (
    <div className="site-rail" data-parent-navigation={parent ? "true" : undefined} data-menu-open={menuOpen ? "true" : "false"} ref={railRef}>
      <div className="rail-header">
        <Link className="wordmark" href="/" aria-label="Theodore Ouyang home">
          <span className="wordmark-lockup">
            <span aria-hidden="true" className="wordmark-mark" />
            <span className="wordmark-name">Theodore Ouyang</span>
          </span>
        </Link>
        {!parent && <button
          aria-controls="site-menu"
          aria-expanded={menuOpen}
          className="menu-toggle"
          onClick={(event) => {
            railRef.current?.setAttribute("data-menu-interacted", "true");
            const keyboardActivation = event.detail === 0;

            if (menuOpen) {
              closeMenu(true);
            } else {
              focusFirstLinkRef.current = keyboardActivation;
              setMenuOpen(true);
            }
          }}
          ref={toggleRef}
          type="button"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>}
      </div>

      {parent ? (
        <nav className="parent-nav" aria-label="Parent navigation">
          <Link className="parent-link" href={parent.href}>
            <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none">
              <path d="M13 8H3m0 0 4-4M3 8l4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Back to {parent.label}</span>
          </Link>
        </nav>
      ) : <div className="rail-panel" id="site-menu" ref={panelRef}>
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
      </div>}
    </div>
  );
}
