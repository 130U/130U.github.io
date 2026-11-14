"use client";

import { useEffect, useRef } from "react";
import { enhanceFigure } from "../figures/FigureController";
import styles from "./Stage.module.css";

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
// A figure is enlarged as one picture: whole within the window when that
// enlarges it enough, otherwise at a reading size that scrolls from its top.
const FIGURE_MAX_ZOOM = 1.75;
const FIGURE_FIT_FLOOR = 1.15;
const FIGURE_SCROLL_ZOOM = 1.5;
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

/** Whether any visible text or formula of a figure lies under its zoom control. */
function coversControl(frame: HTMLElement, control: HTMLElement) {
  const zone = control.getBoundingClientRect();
  const meets = (rect: DOMRect) => rect.width > 0 && rect.right > zone.left && rect.left < zone.right && rect.bottom > zone.top && rect.top < zone.bottom;
  const walker = document.createTreeWalker(frame, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!node.textContent?.trim() || !parent || parent.closest("[hidden], math, [data-figure-layer]") || control.contains(parent)) continue;
    range.selectNodeContents(node);
    if ([...range.getClientRects()].some(meets)) return true;
  }
  return [...frame.querySelectorAll("[data-research-formula] > span > svg")].some((formula) => !formula.closest("[hidden]") && meets(formula.getBoundingClientRect()));
}

/** A copy for the stage that keeps its look and state but no anchors or block markers of the article. */
function stageCopy(source: HTMLElement) {
  const copy = source.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  copy.removeAttribute("data-reveal");
  copy.dataset.zoomed = "";
  copy.querySelectorAll<HTMLElement>("[id]").forEach((node) => { if (!node.closest("svg")) node.removeAttribute("id"); });
  copy.querySelectorAll<HTMLElement>("[data-research-block]").forEach((node) => {
    node.removeAttribute("data-research-block");
    node.removeAttribute("data-research-block-type");
  });
  return copy;
}

type Staged = { source: HTMLElement; panel: HTMLElement; scrim: HTMLElement; fit: () => void; release?: () => void; closing: boolean };

/**
 * Enlarges the article's research tables and figures on one stage over the
 * blurred page. A table is set at the largest size the window allows, with
 * row labels that stay in view and a right edge that fades while there is more
 * to scroll; a figure is enlarged as one picture and keeps its readouts and
 * view switches. Every table and figure is complete without it.
 */
export function ZoomStage() {
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

    let open: Staged | undefined;

    const gutter = () => parseFloat(getComputedStyle(stage).paddingLeft);

    const fitTable = (panel: HTMLElement, region: HTMLElement, table: HTMLTableElement) => {
      const inset = gutter() * 2;
      const roomWidth = Math.min(stage.clientWidth - inset, STAGE_MAX_WIDTH) - 2;
      const roomHeight = stage.clientHeight - inset - 2;
      const title = panel.querySelector<HTMLElement>("[data-table-title]");
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

    const fitFigure = (panel: HTMLElement, figure: HTMLElement) => {
      const frame = figure.firstElementChild as HTMLElement;
      const width = figure.offsetWidth;
      const height = frame.offsetHeight;
      const inset = gutter() * 2;
      const widthScale = Math.min((stage.clientWidth - inset) / width, FIGURE_MAX_ZOOM);
      const fitScale = Math.min(widthScale, (stage.clientHeight - inset) / height);
      const scrolls = fitScale < Math.min(widthScale, FIGURE_FIT_FLOOR);
      const scale = scrolls ? Math.min(widthScale, FIGURE_SCROLL_ZOOM) : fitScale;
      stage.toggleAttribute("data-scrolls", scrolls);
      figure.style.transform = `scale(${scale})`;
      panel.style.width = `${width * scale}px`;
      panel.style.height = `${height * scale}px`;
    };

    const flightFrom = (source: HTMLElement, panel: HTMLElement) => {
      const from = source.getBoundingClientRect();
      const to = panel.getBoundingClientRect();
      return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})`;
    };

    const show = (staged: Staged, label: string) => {
      stage.setAttribute("aria-label", label);
      stage.replaceChildren(staged.scrim, staged.panel);
      root.style.overflowY = "hidden";
      stage.showModal();
      open = staged;
      staged.fit();
    };

    const enter = ({ source, panel, scrim }: Staged) => {
      if (reduced) return;
      panel.animate({ transform: [flightFrom(source, panel), "none"] }, { duration: OPEN_MS, easing: EASE_OUT });
      panel.animate({ opacity: [0, 1] }, { duration: 140, easing: "linear" });
      scrim.animate({ opacity: [0, 1] }, { duration: 320, easing: "ease-out" });
    };

    const newScrim = () => {
      const scrim = document.createElement("div");
      scrim.className = styles.scrim;
      scrim.dataset.stageScrim = "";
      return scrim;
    };

    const zoomOutControl = (panel: HTMLElement, selector: string) => {
      const control = panel.querySelector<HTMLButtonElement>(selector)!;
      control.setAttribute("aria-label", "Zoom out");
      control.removeAttribute("aria-haspopup");
      return control;
    };

    const zoomTable = (source: HTMLElement) => {
      if (open) return;
      const panel = stageCopy(source);
      panel.removeAttribute("data-table-frame");
      panel.querySelectorAll("[data-column-hover]").forEach((node) => node.removeAttribute("data-column-hover"));
      panel.querySelectorAll<HTMLElement>("tbody tr").forEach((row) => row.style.removeProperty("--row"));
      zoomOutControl(panel, "[data-table-zoom]");
      const sourceRegion = source.querySelector<HTMLElement>("[role=region]")!;
      const region = panel.querySelector<HTMLElement>("[role=region]")!;
      region.setAttribute("autofocus", "");
      const table = panel.querySelector("table")!;
      region.addEventListener("scroll", () => paintEdges(region), { passive: true });
      const staged: Staged = { source, panel, scrim: newScrim(), fit: () => fitTable(panel, region, table), closing: false };
      show(staged, panel.querySelector("[data-table-title]")?.textContent ?? "Research data table");
      region.scrollLeft = sourceRegion.scrollLeft;
      enter(staged);
    };

    const zoomFigure = (source: HTMLElement) => {
      if (open) return;
      const figure = stageCopy(source);
      figure.querySelectorAll("[data-figure-layer]").forEach((node) => node.remove());
      figure.style.width = `${source.offsetWidth}px`;
      zoomOutControl(figure, "[data-figure-zoom]").setAttribute("autofocus", "");
      const panel = document.createElement("div");
      panel.className = styles.figurePanel;
      panel.append(figure);
      const staged: Staged = { source: source.firstElementChild as HTMLElement, panel, scrim: newScrim(), fit: () => fitFigure(panel, figure), closing: false };
      const label = source.querySelector("[data-figure-title]")?.textContent ?? source.querySelector("[data-figure-label]")?.textContent ?? "Figure";
      show(staged, label.replace(/\.$/u, ""));
      staged.release = enhanceFigure(figure);
      enter(staged);
    };

    const release = () => {
      if (!open) return;
      open.release?.();
      stage.replaceChildren();
      stage.removeAttribute("aria-label");
      stage.removeAttribute("data-scrolls");
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
      else if (target === stage || target.closest("[data-stage-scrim], [data-table-zoom], [data-figure-zoom]")) zoomOut();
    });
    on(window, "resize", () => open?.fit());

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
      on(item.control, "click", () => zoomTable(item.frame));
      item.control.hidden = false;
    }

    const figureControls = [...document.querySelectorAll<HTMLElement>("[data-figure]")].flatMap((figure) => {
      const control = figure.querySelector<HTMLButtonElement>("[data-figure-zoom]");
      return control ? [{ figure, frame: figure.firstElementChild as HTMLElement, control }] : [];
    });
    // A figure whose top-right corner holds a label at the current width
    // opens a row of its own for the control.
    const clearControl = ({ frame, control }: (typeof figureControls)[number]) => {
      frame.removeAttribute("data-zoom-row");
      if (coversControl(frame, control)) frame.setAttribute("data-zoom-row", "");
    };
    const figureObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const item = figureControls.find(({ frame }) => frame === entry.target);
        if (item) clearControl(item);
      }
    });
    cleanups.push(() => figureObserver.disconnect());
    for (const item of figureControls) {
      on(item.control, "click", () => zoomFigure(item.figure));
      item.control.hidden = false;
    }
    document.fonts.ready.then(() => {
      if (!active) return;
      for (const item of figureControls) {
        clearControl(item);
        figureObserver.observe(item.frame);
      }
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      dismiss();
    };
  }, []);

  return <dialog ref={stageRef} className={styles.stage} />;
}
