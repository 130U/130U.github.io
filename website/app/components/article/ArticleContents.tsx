"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../legal/LegalPaperPage.module.css";

export type ArticleContentsItem = { id: string; text: string; level?: number };

// A chapter or section number at the start of an entry: "2.", "2.1", "IV.", "A.".
const ENTRY_NUMBER = /^((?:[IVXLC]+|[A-Z])\.|\d+(?:\.\d+)+\.?|\d+\.)\s+/u;

/** An entry's number hangs: a title that wraps continues under its first word. */
function EntryLabel({ text }: { text: string }) {
  const number = ENTRY_NUMBER.exec(text);
  if (!number) return text;
  return <><span>{number[1]}</span> <span>{text.slice(number[0].length)}</span></>;
}

export function ArticleContents({ items }: { items: ArticleContentsItem[] }) {
  const sidebar = useRef<HTMLElement>(null);
  const details = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const container = sidebar.current;
    if (!container) return;
    container.dataset.enhanced = "true";
    const desktop = window.matchMedia("(min-width: 1200px)");
    const layout = container.parentElement;
    const targets = items.map(({ id }) => document.getElementById(id)).filter((target): target is HTMLElement => Boolean(target));
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = targets[0]?.id ?? null;
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
      delete container.dataset.enhanced;
      desktop.removeEventListener("change", resize);
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  // Where the list runs past the sticky rail, the clipped edge fades: the rail
  // marks which of its edges hide entries.
  useEffect(() => {
    const container = sidebar.current;
    const list = container?.querySelector("ol");
    if (!container || !list) return;
    const edges = () => {
      const scrolls = window.getComputedStyle(container).position === "sticky" && container.scrollHeight > container.clientHeight + 1;
      container.toggleAttribute("data-clipped-top", scrolls && container.scrollTop > 1);
      container.toggleAttribute("data-clipped-bottom", scrolls && container.scrollTop + container.clientHeight < container.scrollHeight - 1);
    };
    const observer = new ResizeObserver(edges);
    observer.observe(container);
    observer.observe(list);
    container.addEventListener("scroll", edges, { passive: true });
    edges();
    return () => {
      observer.disconnect();
      container.removeEventListener("scroll", edges);
      container.removeAttribute("data-clipped-top");
      container.removeAttribute("data-clipped-bottom");
    };
  }, []);

  // The entry being read stays clear of the rail's fading edges with the entry
  // after it in view; when it reaches an edge, the rail brings it to two fifths
  // of its height.
  useEffect(() => {
    const container = sidebar.current;
    if (!container || !active || !details.current?.open || window.getComputedStyle(container).position !== "sticky") return;
    const link = container.querySelector<HTMLAnchorElement>('a[aria-current="location"]');
    if (!link) return;
    const entries = [...container.querySelectorAll<HTMLLIElement>("nav li")].filter((entry) => entry.getClientRects().length > 0);
    const following = entries[entries.indexOf(link.closest("li")!) + 1];
    const fade = 2.5 * Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
    const bounds = container.getBoundingClientRect();
    const top = link.getBoundingClientRect().top;
    const bottom = (following ?? link).getBoundingClientRect().bottom;
    const clear = (container.scrollTop === 0 || top >= bounds.top + fade) && (container.scrollTop + container.clientHeight >= container.scrollHeight - 1 || bottom <= bounds.bottom - fade);
    if (!clear) container.scrollTop += top - (bounds.top + 0.4 * container.clientHeight);
  }, [active]);

  // The rail lists chapters; only the chapter being read opens its subsections.
  const chapters = new Map<string, string>();
  let chapter = "";
  for (const { id, level } of items) {
    if ((level ?? 1) <= 1) chapter = id;
    chapters.set(id, chapter);
  }
  const activeChapter = active ? chapters.get(active) : undefined;

  return (
    <aside className={styles.contents} ref={sidebar}>
      <details ref={details} open>
        <summary>
          Contents<span className={styles.contentsChevron} aria-hidden="true" />
        </summary>
        <nav aria-label="Article contents">
          <ol>
            {items.map(({ id, text, level }) => (
              <li key={id} className={(level ?? 1) > 1 ? styles.subsectionLink : undefined} data-open-chapter={(level ?? 1) > 1 && chapters.get(id) === activeChapter ? "" : undefined}>
                <a href={`#${id}`} aria-current={active === id ? "location" : undefined} data-numbered={ENTRY_NUMBER.test(text) ? "" : undefined}><EntryLabel text={text} /></a>
              </li>
            ))}
          </ol>
        </nav>
      </details>
    </aside>
  );
}
