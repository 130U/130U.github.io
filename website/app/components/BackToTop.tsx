"use client";

import { useEffect, useRef } from "react";

/**
 * Back to Top in the footer of every article, detail page and post. It jumps to
 * the page title, whose scroll margin returns the page to its top, and moves
 * focus there. On a page that fits the window there is nowhere to go, so the
 * action steps aside; without JavaScript it always shows.
 */
export function BackToTop({ target }: { target: string }) {
  const link = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = link.current;
    if (!element) return;
    const root = document.documentElement;
    const update = () => {
      element.hidden = root.scrollHeight <= window.innerHeight + 1;
    };
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      element.hidden = false;
    };
  }, []);

  return <a className="top-link" href={`#${target}`} ref={link}>Back to Top</a>;
}
