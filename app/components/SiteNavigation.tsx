"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation, type ActivePage } from "../lib/content/site";

export function SiteNavigation({
  active,
}: {
  active?: ActivePage;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusFirstLinkRef = useRef(false);
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
          <span className="wordmark-monogram" aria-hidden="true">LO</span>
          <span>Theodore Ouyang</span>
        </Link>
        <button
          aria-controls="site-menu"
          aria-expanded={menuOpen}
          className="menu-toggle"
          onClick={(event) => {
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
      </div>
    </div>
  );
}
