"use client";

import { useEffect, useRef } from "react";
import styles from "./ResearchArticle.module.css";

// From the most generous setting down: larger type first, then closer columns,
// then headings on two lines, all before any row gives up its single line.
const ONE_LINE_STEPS = [
  { zoom: 1.25, dense: false, headings: false },
  { zoom: 1.125, dense: false, headings: false },
  { zoom: 1, dense: false, headings: false },
  { zoom: 1, dense: true, headings: false },
  { zoom: 1.125, dense: false, headings: true },
  { zoom: 1, dense: false, headings: true },
  { zoom: 1, dense: true, headings: true },
];
const WRAPPED_STEPS = [{ zoom: 1.125, headings: false }, { zoom: 1, headings: false }, { zoom: 1, headings: true }];
const STAGE_MAX_WIDTH = 1472;
const STAGE_MIN_WIDTH = 640;
const EDGE_FADE = 40;
const PIN_SHARE = 0.45;
const OPEN_MS = 480;
const CLOSE_MS = 300;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

/** The narrowest width that keeps every row on one line. */
function oneLineWidth(table: HTMLTableElement) {
  table.setAttribute("data-one-line", "");
  const width = table.getBoundingClientRect().width;
  table.removeAttribute("data-one-line");
  return width;
}

/** The right edge fades by as much as there is left to scroll. */
function paintEdges(region: HTMLElement) {
  const remaining = region.scrollWidth - region.clientWidth - region.scrollLeft;
  region.style.setProperty("--edge-fade", `${Math.max(0, Math.min(EDGE_FADE, remaining))}px`);
  region.toggleAttribute("data-scrolled", region.scrollLeft > 0);
}

/** Row labels stay in view while a wide table scrolls, when they leave room for the values. */
function pinRowLabels(region: HTMLElement, table: HTMLTableElement) {
  const overflows = table.offsetWidth > region.clientWidth + 1;
  region.toggleAttribute("data-pinned", overflows && table.rows[0].cells[0].offsetWidth <= region.clientWidth * PIN_SHARE);
  paintEdges(region);
}

/**
 * Enhances the article's research tables: row labels that stay in view, a right
 * edge that fades while there is more to scroll, and a zoom into a stage that
 * sets the whole table at the largest size the window allows. Every table is
 * complete without it.
 */
export function TableStage() {
  const stageRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || typeof stage.showModal !== "function") return;
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const on = <E extends Event>(target: EventTarget, type: string, handler: (event: E) => void, options?: AddEventListenerOptions) => {
      target.addEventListener(type, handler as EventListener, options);
      cleanups.push(() => target.removeEventListener(type, handler as EventListener, options));
    };

    let open: { source: HTMLElement; panel: HTMLElement; region: HTMLElement; table: HTMLTableElement; scrim: HTMLElement; closing: boolean } | undefined;

    const gutter = () => parseFloat(getComputedStyle(stage).paddingLeft);

    const fit = () => {
      if (!open) return;
      const { panel, region, table } = open;
      const inset = gutter() * 2;
      const roomWidth = Math.min(stage.clientWidth - inset, STAGE_MAX_WIDTH) - 2;
      const roomHeight = stage.clientHeight - inset - 2;
      const title = panel.querySelector<HTMLElement>(`.${styles.tableTitle}`);
      const fitsHeight = () => table.offsetHeight + (title?.offsetHeight ?? 0) <= roomHeight;
      const place = (mode: "line" | "wrap", zoom: number, width: number, dense = false, headings = false) => {
        panel.dataset.fit = mode;
        panel.style.setProperty("--zoom", String(zoom));
        panel.style.width = `${width + 2}px`;
        region.toggleAttribute("data-dense", dense);
        region.toggleAttribute("data-headings-wrap", headings);
      };

      const settle = () => {
        for (const { zoom, dense, headings } of ONE_LINE_STEPS) {
          place("line", zoom, roomWidth, dense, headings);
          const width = oneLineWidth(table);
          if (width > roomWidth) continue;
          place("line", zoom, headings ? roomWidth : Math.max(width, Math.min(STAGE_MIN_WIDTH, roomWidth)), dense, headings);
          if (zoom === 1 || fitsHeight()) return;
        }
        for (const { zoom, headings } of WRAPPED_STEPS) {
          place("wrap", zoom, roomWidth, false, headings);
          if (table.offsetWidth <= region.clientWidth + 1 && (zoom === 1 || fitsHeight())) return;
        }
      };
      settle();
      pinRowLabels(region, table);
    };

    const flightFrom = (source: HTMLElement, panel: HTMLElement) => {
      const from = source.getBoundingClientRect();
      const to = panel.getBoundingClientRect();
      return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
    };

    const zoomIn = (source: HTMLElement) => {
      if (open) return;
      const panel = source.cloneNode(true) as HTMLElement;
      panel.removeAttribute("data-table-frame");
      panel.removeAttribute("data-reveal");
      panel.dataset.zoomed = "";
      panel.querySelectorAll<HTMLElement>("[id]").forEach((node) => { if (!node.closest("svg")) node.removeAttribute("id"); });
      panel.querySelectorAll<HTMLElement>("[data-research-block]").forEach((node) => {
        node.removeAttribute("data-research-block");
        node.removeAttribute("data-research-block-type");
      });
      panel.querySelectorAll("[data-column-hover]").forEach((node) => node.removeAttribute("data-column-hover"));
      panel.querySelectorAll<HTMLElement>("tbody tr").forEach((row) => row.style.removeProperty("--row"));
      const control = panel.querySelector<HTMLButtonElement>("[data-table-zoom]")!;
      control.setAttribute("aria-label", "Zoom out");
      control.removeAttribute("aria-haspopup");
      const sourceRegion = source.querySelector<HTMLElement>("[role=region]")!;
      const region = panel.querySelector<HTMLElement>("[role=region]")!;
      region.setAttribute("autofocus", "");
      const table = panel.querySelector("table")!;
      const scrim = document.createElement("div");
      scrim.className = styles.scrim;
      scrim.dataset.stageScrim = "";
      region.addEventListener("scroll", () => paintEdges(region), { passive: true });

      stage.setAttribute("aria-label", panel.querySelector(`.${styles.tableTitle}`)?.textContent ?? "Research data table");
      stage.replaceChildren(scrim, panel);
      root.style.overflowY = "hidden";
      stage.showModal();
      open = { source, panel, region, table, scrim, closing: false };
      fit();
      region.scrollLeft = sourceRegion.scrollLeft;

      if (reduced) return;
      panel.animate({ transform: [flightFrom(source, panel), "none"] }, { duration: OPEN_MS, easing: EASE_OUT });
      panel.animate({ opacity: [0, 1] }, { duration: 140, easing: "linear" });
      scrim.animate({ opacity: [0, 1] }, { duration: 320, easing: "ease-out" });
    };

    const release = () => {
      if (!open) return;
      stage.replaceChildren();
      stage.removeAttribute("aria-label");
      root.style.overflowY = "";
      open = undefined;
    };

    const dismiss = () => {
      if (stage.open) stage.close();
      release();
    };

    const zoomOut = () => {
      if (!open || open.closing) return;
      open.closing = true;
      if (reduced) {
        dismiss();
        return;
      }
      const { source, panel, scrim } = open;
      const current = getComputedStyle(panel).transform;
      panel.getAnimations().forEach((animation) => animation.cancel());
      scrim.getAnimations().forEach((animation) => animation.cancel());
      panel.animate({ transform: [current, flightFrom(source, panel)] }, { duration: CLOSE_MS, easing: EASE_OUT, fill: "forwards" });
      panel.animate({ opacity: [1, 0] }, { delay: CLOSE_MS * 0.5, duration: CLOSE_MS * 0.5, fill: "forwards" });
      scrim.animate({ opacity: [1, 0] }, { duration: CLOSE_MS, easing: "ease-out", fill: "forwards" });
      // Timed so that a background tab, whose animations do not advance, still closes.
      window.setTimeout(dismiss, CLOSE_MS);
    };

    on(stage, "close", () => { if (!stage.open) release(); });
    on(stage, "cancel", (event) => {
      event.preventDefault();
      zoomOut();
    });
    on<MouseEvent>(stage, "click", (event) => {
      const target = event.target as Element;
      if (target.closest("a[href]")) dismiss();
      else if (target === stage || target.closest("[data-stage-scrim], [data-table-zoom]")) zoomOut();
    });
    on(window, "resize", fit);

    const frames = [...document.querySelectorAll<HTMLElement>("[data-table-frame]")].map((frame) => ({
      frame,
      table: frame.querySelector("table")!,
      region: frame.querySelector<HTMLElement>("[role=region]")!,
      control: frame.querySelector<HTMLButtonElement>("[data-table-zoom]")!,
    }));
    const settleFrame = ({ region, table }: (typeof frames)[number]) => {
      // A table just wider than its column closes up to fit.
      region.removeAttribute("data-dense");
      if (table.offsetWidth > region.clientWidth + 1) {
        region.setAttribute("data-dense", "");
        if (table.offsetWidth > region.clientWidth + 1) region.removeAttribute("data-dense");
      }
      pinRowLabels(region, table);
    };
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) settleFrame(frames.find(({ region }) => region === entry.target)!);
    });
    let active = true;
    cleanups.push(() => {
      active = false;
      observer.disconnect();
    });
    document.fonts.ready.then(() => {
      if (!active) return;
      for (const item of frames) {
        settleFrame(item);
        observer.observe(item.region);
      }
    });
    for (const item of frames) {
      on(item.region, "scroll", () => paintEdges(item.region), { passive: true });
      on(item.control, "click", () => zoomIn(item.frame));
      item.control.hidden = false;
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      dismiss();
    };
  }, []);

  return <dialog ref={stageRef} className={styles.stage} />;
}
