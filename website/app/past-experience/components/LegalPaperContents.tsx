"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LegalPaperPage.module.css";

type ContentsItem = { id: string; text: string; level?: number };

export function LegalPaperContents({ headings }: { headings: ContentsItem[] }) {
  const sidebar = useRef<HTMLElement>(null);
  const details = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1200px)");
    const layout = sidebar.current?.parentElement;
    const ids = ["abstract-heading", ...headings.map(({ id }) => id), "footnotes"];
    const targets = ids.map((id) => document.getElementById(id)).filter((target): target is HTMLElement => Boolean(target));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = targets[0]?.id ?? "abstract-heading";
      const scrollMargin = targets[0] ? Number.parseFloat(window.getComputedStyle(targets[0]).scrollMarginTop) || 0 : 0;
      const scrollPadding = Number.parseFloat(window.getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const threshold = scrollMargin + scrollPadding + 1;
      for (const target of targets) {
        if (target.getBoundingClientRect().top > threshold) break;
        current = target.id;
      }
      setActive(current);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    let previousDesktop: boolean | null = null;
    const resize = () => {
      const fontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
      const wideLayout = desktop.matches && Boolean(layout && layout.clientWidth >= 44 * fontSize);
      if (wideLayout !== previousDesktop && details.current) details.current.open = wideLayout;
      previousDesktop = wideLayout;
      scroll();
    };
    const observer = new ResizeObserver(resize);
    if (layout) observer.observe(layout);
    resize();
    desktop.addEventListener("change", resize);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      desktop.removeEventListener("change", resize);
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [headings]);

  useEffect(() => {
    const container = sidebar.current;
    if (!container || !active || !details.current?.open || window.getComputedStyle(container).position !== "sticky") return;
    const link = container.querySelector<HTMLAnchorElement>('a[aria-current="location"]');
    if (!link) return;
    const bounds = container.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    if (linkBounds.top < bounds.top) container.scrollTop -= bounds.top - linkBounds.top;
    else if (linkBounds.bottom > bounds.bottom) container.scrollTop += linkBounds.bottom - bounds.bottom;
  }, [active]);

  const items = [{ id: "abstract-heading", text: "Abstract" }, ...headings, { id: "footnotes", text: "Footnotes" }];
  return (
    <aside className={styles.contents} ref={sidebar}>
      <details ref={details} open>
        <summary>
          Contents<span className={styles.contentsChevron} aria-hidden="true" />
        </summary>
        <nav aria-label="Article contents">
          <ol>
            {items.map(({ id, text, level }) => (
              <li key={id} className={(level ?? 1) > 1 ? styles.subsectionLink : undefined}>
                <a href={`#${id}`} aria-current={active === id ? "location" : undefined}>{text}</a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    </aside>
  );
}
