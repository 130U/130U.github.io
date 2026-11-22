"use client";

import { useEffect, useRef } from "react";
import { enhanceFigure } from "../figures/FigureController";
import styles from "./Stage.module.css";

// From the most generous setting down: larger type first, then closer columns,
// then headings on two lines, all before a column of sentences wraps; then
// wrapped columns of sentences, at the reading size and down to nine tenths of
// it. A table wider than the window even so is set whole at the size that fits
// it, every row still on one line but in its columns of sentences.
const ONE_LINE_STEPS = [
  { zoom: 1.25, dense: false, headings: false },
  { zoom: 1.125, dense: false, headings: false },
  { zoom: 1, dense: false, headings: false },
  { zoom: 1, dense: true, headings: false },
  { zoom: 1.125, dense: false, headings: true },
  { zoom: 1, dense: false, headings: true },
  { zoom: 1, dense: true, headings: true },
];
const WRAPPED_STEPS = [
  { zoom: 1.125, headings: false },
  { zoom: 1, headings: false },
  { zoom: 1, headings: true },
  { zoom: 0.95, headings: true },
  { zoom: 0.9, headings: true },
];
const STAGE_MAX_WIDTH = 1472;
const STAGE_MIN_WIDTH = 640;
// A figure is enlarged as one picture: whole within the window when that
// enlarges it enough, otherwise at a reading size that scrolls from its top.
// A figure that would scroll by less than a tenth of its height is set whole,
// at nine tenths of that reading size or more.
const FIGURE_MAX_ZOOM = 1.75;
const FIGURE_FIT_FLOOR = 1.15;
const FIGURE_SCROLL_ZOOM = 1.5;
const FIGURE_FIT_SHARE = 0.9;
// A table a little wider than its room closes up its columns, by as much as it
// needs and to no less than half their gap; on the stage, one a little taller
// than the window is set smaller, to no less than nine tenths of the reading size.
const MIN_GAP_SHARE = 0.5;
const MIN_TABLE_ZOOM = 0.9;
// Where a table set whole still reaches past its room, its size steps down by this share until it fits.
const WHOLE_STEP = 0.97;
// Room left inside a fitted box, against subpixel overflow. A table that reaches
// no more than one layout unit (1/64px) past its room does not scroll, so it fits.
const FIT_SLACK = 0.5;
const LAYOUT_UNIT = 1 / 64;
const EDGE_FADE = 40;
// Row labels stay in view while their table scrolls when they take no more than
// half its room, or when the room beside them, short of the fading edge, holds a
// column of values whole, as a table of mathematics keeps its labels, and only
// where that room holds the widest column.
const PIN_SHARE = 0.5;
// The widest a column of sentences is set beside row labels kept in view.
const SENTENCE_MAX_REM = 16;
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

/** How far a table reaches past the room its region gives it, in fractional pixels. */
function overshoot(region: HTMLElement, table: HTMLTableElement) {
  const scrollbar = region.offsetWidth - region.clientWidth;
  return table.getBoundingClientRect().width - (region.getBoundingClientRect().width - scrollbar);
}

/** Closes up a table's columns from `gap` (px on each side of a cell) by as much as
 * it needs to fit, down to half that gap; whether the table fits. */
function closeUp(region: HTMLElement, table: HTMLTableElement, gap: number) {
  region.style.removeProperty("--cell-gap");
  let over = overshoot(region, table);
  if (over <= LAYOUT_UNIT) return true;
  const floor = gap * MIN_GAP_SHARE;
  // The first step assumes every column gives up the gap on both its inner sides;
  // later steps use the narrowing measured, since a wrapping column may not narrow.
  let slope = 2 * (Math.max(...[...table.rows].map((row) => row.cells.length)) - 1);
  let current = gap;
  for (let attempt = 0; attempt < 4 && slope > 0 && current > floor; attempt += 1) {
    const next = Math.max(floor, current - (over + FIT_SLACK) / slope);
    region.style.setProperty("--cell-gap", `${next.toFixed(3)}px`);
    const left = overshoot(region, table);
    if (left <= LAYOUT_UNIT) return true;
    slope = (over - left) / (current - next);
    [current, over] = [next, left];
  }
  region.style.removeProperty("--cell-gap");
  return false;
}

function clearSentenceWidth(region: HTMLElement) {
  region.style.removeProperty("--sentence-width");
}

// The narrowest a sentence column is set when several share a row.
const SHARED_SENTENCE_REM = 10;

/**
 * Several sentence columns in a table that scrolls keep the width they share
 * when the room holds the row labels and two of them, so a wide window shows
 * as many whole columns as it can; in less room each takes the room beside the
 * labels, padding included, at most 16rem, so one whole column reads at a time,
 * where that room holds a readable measure (10rem); otherwise each keeps its
 * own 16rem and the labels scroll with it.
 */
function setSentenceWidth(region: HTMLElement, table: HTMLTableElement) {
  if (!table.hasAttribute("data-sentence-columns")) return;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const label = table.rows[0].cells[0].getBoundingClientRect().width;
  if (region.clientWidth >= label + 2 * SHARED_SENTENCE_REM * rem) {
    region.dataset.wrap = "fit";
    return;
  }
  const cell = table.querySelector<HTMLElement>("td[data-sentence]:not(:first-child)");
  const style = cell && getComputedStyle(cell);
  const padding = style ? parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) : 0;
  const width = Math.floor(Math.min(SENTENCE_MAX_REM * rem, region.clientWidth - label - padding - 1));
  if (width >= SHARED_SENTENCE_REM * rem) region.style.setProperty("--sentence-width", `${width}px`);
}

/**
 * A table the manuscript sets as two halves side by side, under one repeated
 * heading (data-halves, set by the renderer), folds in less room: the second
 * half's rows follow the first half's under the one heading, in their order,
 * as one table of the same columns. Unfolding restores the manuscript's form.
 */
function foldHalves(table: HTMLTableElement, fold: boolean) {
  const half = Number(table.dataset.halves);
  if (!half) return;
  const body = table.tBodies[0];
  const folded = [...body.rows].filter((row) => row.hasAttribute("data-fold-row"));
  if (fold === folded.length > 0) return;
  const heads = [...table.rows[0].cells].slice(half);
  heads.forEach((cell) => { cell.hidden = fold; });
  if (fold) {
    for (const row of [...body.rows]) {
      const next = document.createElement("tr");
      next.dataset.foldRow = "";
      next.append(...[...row.cells].slice(half));
      body.append(next);
    }
  } else {
    const originals = [...body.rows].filter((row) => !row.hasAttribute("data-fold-row"));
    folded.forEach((row, index) => {
      originals[index].append(...row.cells);
      row.remove();
    });
  }
}

type HeadingPiece = { joined: boolean; range?: Range; formula?: HTMLElement };

/** The pieces of a heading in reading order, each a run of text or a formula, and whether it joins
 * the piece before it with no break between them. */
function headingPieces(cell: HTMLElement) {
  const pieces: HeadingPiece[] = [];
  let joined = false;
  const read = (parent: Node) => {
    for (const node of parent.childNodes) {
      if (node instanceof Text) {
        const wraps = !/nowrap|^pre$/u.test(getComputedStyle(node.parentElement!).whiteSpace);
        for (const run of node.data.matchAll(/\s+|\S+/gu)) {
          if (/^\s/u.test(run[0])) {
            if (wraps) joined = false;
            continue;
          }
          const range = document.createRange();
          range.setStart(node, run.index);
          range.setEnd(node, run.index + run[0].length);
          pieces.push({ joined, range });
          joined = true;
        }
      } else if (node instanceof Element) {
        if (node.matches("br")) joined = false;
        else if (node.matches("[data-research-formula]")) {
          pieces.push({ joined, formula: node as HTMLElement });
          joined = true;
        } else if (!node.matches("math, svg, [hidden]")) read(node);
      }
    }
  };
  read(cell);
  return pieces;
}

/**
 * A heading takes at most two lines. The build sets each heading's floor from
 * estimated advances (headingFloor); each is measured again as drawn, set on
 * one line, since a renderer that draws small type at whole-pixel advances sets
 * it wider than estimated. The floor is the longest line of its most even break
 * into two, in ems of the heading's size, so it follows the type as it scales.
 */
function floorHeadings(table: HTMLTableElement) {
  const cells = [...table.querySelectorAll<HTMLElement>("thead th")].filter((cell) => !cell.hidden && cell.style.getPropertyValue("--heading-floor"));
  // Where each heading may break is read before the headings are set on one line.
  const pieces = cells.map(headingPieces);
  cells.forEach((cell) => cell.style.setProperty("white-space", "nowrap"));
  const floors = cells.map((cell, index) => {
    const words: Array<{ left: number; right: number }> = [];
    for (const { joined, range, formula } of pieces[index]) {
      let left: number;
      let right: number;
      if (formula) {
        // A formula's drawing carries a transparent gutter either side that its negative margins take back.
        const box = formula.getBoundingClientRect();
        const gutter = -parseFloat(getComputedStyle(formula).marginLeft) || 0;
        [left, right] = [box.left + gutter, box.right - gutter];
      } else {
        const boxes = [...range!.getClientRects()].filter((box) => box.width > 0);
        if (!boxes.length) continue;
        [left, right] = [Math.min(...boxes.map((box) => box.left)), Math.max(...boxes.map((box) => box.right))];
      }
      const last = words.at(-1);
      if (joined && last) [last.left, last.right] = [Math.min(last.left, left), Math.max(last.right, right)];
      else words.push({ left, right });
    }
    if (!words.length) return undefined;
    const line = (from: number, to: number) => words[to - 1].right - words[from].left;
    let best = line(0, words.length);
    for (let split = 1; split < words.length; split += 1) best = Math.min(best, Math.max(line(0, split), line(split, words.length)));
    return Math.ceil(((best + FIT_SLACK) / parseFloat(getComputedStyle(cell).fontSize)) * 1000) / 1000;
  });
  cells.forEach((cell, index) => {
    cell.style.removeProperty("white-space");
    if (floors[index] === undefined) cell.style.removeProperty("--heading-drawn");
    else cell.style.setProperty("--heading-drawn", `${floors[index]}em`);
  });
}

/**
 * Sets a table in the article, every row on one line but in its columns of
 * sentences: at its natural spacing if it fits; closed up if that makes it fit;
 * a table of two halves folded, if that makes it fit; a table of several
 * sentence columns with them sharing the room, closed up again if need be; and
 * otherwise at its natural spacing, scrolling, with sentence columns set to
 * read one whole column at a time where the room is narrow. No row wraps to
 * spare the table its scroll.
 */
function layTable(region: HTMLElement, table: HTMLTableElement, gap: number) {
  unpin(region);
  region.removeAttribute("data-wrap");
  clearSentenceWidth(region);
  foldHalves(table, false);
  if (closeUp(region, table, gap)) return;
  if (table.dataset.halves) {
    foldHalves(table, true);
    if (closeUp(region, table, gap)) return;
  }
  if (!table.hasAttribute("data-sentence-columns")) return;
  region.dataset.wrap = "fit";
  if (closeUp(region, table, gap)) return;
  region.dataset.wrap = "scroll";
  setSentenceWidth(region, table);
  closeUp(region, table, gap);
}

/** The right edge fades by as much as there is left to scroll. */
function paintEdges(region: HTMLElement) {
  const remaining = region.scrollWidth - region.clientWidth - region.scrollLeft;
  region.style.setProperty("--edge-fade", `${Math.max(0, Math.min(EDGE_FADE, remaining))}px`);
  region.toggleAttribute("data-scrolled", region.scrollLeft > 0);
}

/** Row labels leave view and the scrolling stops snapping, while a table is set anew. */
function unpin(region: HTMLElement) {
  region.removeAttribute("data-pinned");
  region.style.removeProperty("--pin-width");
  region.style.removeProperty("--snap-end");
}

/**
 * A table that keeps its row labels in view snaps its scrolling to the start of
 * a column of values, set beside the labels, so no column stands half beneath
 * them; the table runs on past its last column, blank, by as much as it takes for
 * the scrolled end to be such a start too.
 */
function snapColumns(region: HTMLElement, table: HTMLTableElement) {
  if (!region.hasAttribute("data-pinned")) return;
  const [label, ...values] = [...table.rows[0].cells];
  const pin = label.getBoundingClientRect().width;
  region.style.setProperty("--pin-width", `${pin.toFixed(2)}px`);
  const origin = table.getBoundingClientRect().left + pin;
  const starts = values.filter((cell) => cell.offsetWidth > 0).map((cell) => cell.getBoundingClientRect().left - origin);
  const end = () => table.getBoundingClientRect().width - region.clientWidth;
  const next = starts.find((start) => start >= end() - FIT_SLACK);
  if (next === undefined) return;
  // Measured again after each step, against subpixel rounding, until the end meets the start.
  let widening = 0;
  for (let attempt = 0; attempt < 4 && next - end() > FIT_SLACK; attempt += 1) {
    widening += next - end();
    region.style.setProperty("--snap-end", `${widening.toFixed(2)}px`);
  }
}

/**
 * Row labels stay in view while a wide table scrolls, when they leave room for the values: when
 * they take no more than half the room, or when the room beside them holds a column of values
 * whole; and only when that room holds its widest column too, so no column stands half beneath them.
 */
function pinRowLabels(region: HTMLElement, table: HTMLTableElement) {
  unpin(region);
  const overflows = table.offsetWidth > region.clientWidth + 1;
  const [label, ...values] = [...table.rows[0].cells];
  const shown = values.filter((cell) => cell.offsetWidth > 0).map((cell) => ({ cell, style: getComputedStyle(cell) }));
  // A column's text without its padding, and a column from its start to the end of its text.
  const narrowest = Math.min(...shown.map(({ cell, style }) => cell.offsetWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)));
  const widest = Math.max(...shown.map(({ cell, style }) => cell.offsetWidth - parseFloat(style.paddingRight)));
  const room = region.clientWidth - label.offsetWidth - EDGE_FADE;
  const holds = widest <= region.clientWidth - label.offsetWidth;
  region.toggleAttribute("data-pinned", overflows && holds && (label.offsetWidth <= region.clientWidth * PIN_SHARE || narrowest <= room));
  snapColumns(region, table);
  paintEdges(region);
}

/** A table without a title that scrolls, or whose last heading reaches the zoom control, would carry
 * headings beneath the control, so the control takes a row of its own. */
function clearTableControl(frame: HTMLElement, region: HTMLElement, table: HTMLTableElement, control?: HTMLElement) {
  frame.removeAttribute("data-zoom-row");
  if (frame.querySelector("[data-table-title]") || control?.hasAttribute("data-idle")) return;
  if (table.offsetWidth > region.clientWidth + 1 || (control && coversControl(frame, control))) frame.setAttribute("data-zoom-row", "");
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

/** The scale of a staged figure: whole within the room, or at a reading size that scrolls from its top. */
function figureScale(width: number, height: number, roomWidth: number, roomHeight: number) {
  const widthScale = Math.min(roomWidth / width, FIGURE_MAX_ZOOM);
  const fitScale = Math.min(widthScale, roomHeight / height);
  const scrollScale = Math.min(widthScale, FIGURE_SCROLL_ZOOM);
  const scrolls = fitScale < Math.min(widthScale, FIGURE_FIT_FLOOR) && fitScale < scrollScale * FIGURE_FIT_SHARE;
  return { scale: scrolls ? scrollScale : fitScale, scrolls };
}

/** How much wider than its frame a figure's widest scrolling comparison is. */
function scrollExcess(figure: HTMLElement) {
  return Math.max(0, ...[...figure.querySelectorAll<HTMLElement>("[data-figure-scroll]")].map((region) => Math.ceil(region.scrollWidth - region.clientWidth)));
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

    // `host` is the stage, or the offscreen stand-in that measures what the stage would set.
    const fitTable = (panel: HTMLElement, region: HTMLElement, table: HTMLTableElement, host: HTMLElement = stage) => {
      const inset = parseFloat(getComputedStyle(host).paddingLeft) * 2;
      const roomWidth = Math.min(host.clientWidth - inset, STAGE_MAX_WIDTH) - 2;
      const roomHeight = host.clientHeight - inset - 2;
      const title = panel.querySelector<HTMLElement>("[data-table-title]");
      const fitsHeight = () => table.offsetHeight + (title?.offsetHeight ?? 0) + parseFloat(getComputedStyle(panel).paddingTop) <= roomHeight;
      // "whole" wraps columns of sentences at the stage's measure, in ems of the table's size, so the table
      // narrows with its type.
      const place = (mode: "line" | "wrap" | "whole", zoom: number, width: number, dense = false, headings = false) => {
        panel.dataset.fit = mode === "line" ? "line" : "wrap";
        panel.style.setProperty("--zoom", String(zoom));
        panel.style.width = `${width + 2}px`;
        region.style.removeProperty("--cell-gap");
        region.toggleAttribute("data-dense", dense);
        region.toggleAttribute("data-headings-wrap", headings);
        if (mode === "wrap" && table.hasAttribute("data-sentence-columns")) region.dataset.wrap = "fit";
        else region.removeAttribute("data-wrap");
        unpin(region);
        clearSentenceWidth(region);
        if (headings) floorHeadings(table);
      };
      const fits = () => overshoot(region, table) <= LAYOUT_UNIT;
      // The room the table has inside its region, a scrollbar aside.
      const regionRoom = () => region.getBoundingClientRect().width - (region.offsetWidth - region.clientWidth);

      const settle = () => {
        // A table of two halves keeps the manuscript's form wherever one of these steps holds it.
        for (const fold of table.dataset.halves ? [false, true] : [false]) {
          foldHalves(table, fold);
          for (const { zoom, dense, headings } of ONE_LINE_STEPS) {
            place("line", zoom, roomWidth, dense, headings);
            const width = oneLineWidth(table);
            if (width > roomWidth) continue;
            place("line", zoom, headings ? roomWidth : Math.max(width, Math.min(STAGE_MIN_WIDTH, roomWidth)), dense, headings);
            if (zoom === 1 || fitsHeight()) return;
          }
        }
        for (const { zoom, headings } of WRAPPED_STEPS) {
          place("wrap", zoom, roomWidth, false, headings);
          if (overshoot(region, table) <= 0 && (zoom <= 1 || fitsHeight())) return;
        }
        // A table wider than the window even so is set whole, every row on one line but in its columns of
        // sentences, at the size that fits the window's width, as a figure is set whole: each step scales the
        // type by the room over the table's width, and the frame's fixed insets make the next step smaller.
        let whole = MIN_TABLE_ZOOM;
        place("whole", whole, roomWidth, true, true);
        for (let attempt = 0; attempt < 8 && !fits(); attempt += 1) {
          whole = Math.floor(((whole * (regionRoom() - FIT_SLACK)) / table.getBoundingClientRect().width) * 1000) / 1000;
          place("whole", whole, roomWidth, true, true);
        }
        // Where type is drawn at whole-pixel advances, a table narrows in steps rather than with its type,
        // and those steps can stop a pixel short: the size steps down until the table fits, then back up,
        // halving the interval, to the largest size found that fits.
        if (!fits()) {
          let [low, high] = [whole, whole];
          for (let attempt = 0; attempt < 8 && !fits(); attempt += 1) {
            high = low;
            low = Math.floor(low * WHOLE_STEP * 1000) / 1000;
            place("whole", low, roomWidth, true, true);
          }
          if (fits()) {
            for (let attempt = 0; attempt < 6 && high - low > 0.002; attempt += 1) {
              const middle = Math.floor(((low + high) / 2) * 1000) / 1000;
              place("whole", middle, roomWidth, true, true);
              if (fits()) low = middle;
              else high = middle;
            }
            place("whole", low, roomWidth, true, true);
          }
        }
        if (fits()) return;
        // Only a table that no size sets whole scrolls, at the reading size, its row labels in view.
        place("wrap", 1, roomWidth, false, true);
        if (table.hasAttribute("data-sentence-columns")) region.dataset.wrap = "scroll";
        setSentenceWidth(region, table);
      };
      // A table that reaches a little past the bottom of the window is set smaller, to no less than nine
      // tenths of the reading size, or of the size that sets it whole where that is smaller.
      // A table set whole stays whole: a smaller size that would widen it, as whole-pixel advances can, is
      // not taken.
      const settleHeight = () => {
        const zoom = Number(panel.style.getPropertyValue("--zoom"));
        const whole = fits();
        const floor = zoom < MIN_TABLE_ZOOM ? zoom * MIN_TABLE_ZOOM : MIN_TABLE_ZOOM;
        const size = (value: number) => {
          panel.style.setProperty("--zoom", String(value));
          if (region.hasAttribute("data-headings-wrap")) floorHeadings(table);
        };
        let next = zoom;
        for (let attempt = 0; attempt < 4 && region.scrollHeight > region.clientHeight; attempt += 1) {
          next = Math.floor(((next * (region.clientHeight - FIT_SLACK)) / region.scrollHeight) * 1000) / 1000;
          if (next < floor) break;
          size(next);
        }
        if (next !== zoom && (region.scrollHeight > region.clientHeight || (whole && !fits()))) size(zoom);
      };
      settle();
      settleHeight();
      pinRowLabels(region, table);
      clearTableControl(panel, region, table);
    };

    const fitFigure = (panel: HTMLElement, figure: HTMLElement) => {
      const frame = figure.firstElementChild as HTMLElement;
      const width = figure.offsetWidth;
      const height = frame.offsetHeight;
      const inset = gutter() * 2;
      const { scale, scrolls } = figureScale(width, height, stage.clientWidth - inset, stage.clientHeight - inset);
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
      control.removeAttribute("data-idle");
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
      show(staged, panel.querySelector("[data-table-title]")?.textContent ?? region.getAttribute("aria-label") ?? "Research data table");
      region.scrollLeft = sourceRegion.scrollLeft;
      enter(staged);
    };

    const zoomFigure = (source: HTMLElement) => {
      if (open) return;
      const figure = stageCopy(source);
      figure.querySelectorAll("[data-figure-layer]").forEach((node) => node.remove());
      // A comparison that scrolls in the article is laid out whole, at its scroll width.
      figure.style.width = `${source.offsetWidth + scrollExcess(source)}px`;
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
    // The room a table or figure has on the stage at the window's present size.
    const stageRoom = () => {
      const inset = gutter() * 2;
      return { width: Math.min(window.innerWidth - inset, STAGE_MAX_WIDTH) - 2, height: window.innerHeight - inset - 2 };
    };
    // The magnifier appears where the stage shows more than the page: where it
    // enlarges by FIGURE_FIT_FLOOR or more, or sets whole what the page scrolls.
    // Where the stage is barely wider than the column, as on a phone, a table's
    // copy is set offscreen exactly as the stage would set it, and the
    // magnifier stays only if the stage sets it whole: enlarged that much, or,
    // for a table that scrolls in the page, at any of its sizes.
    const probe = document.createElement("div");
    probe.className = styles.stage;
    probe.setAttribute("open", "");
    probe.setAttribute("aria-hidden", "true");
    probe.inert = true;
    probe.style.cssText = "visibility: hidden; pointer-events: none; z-index: -1";
    const tableGains = (frame: HTMLElement, region: HTMLElement, table: HTMLTableElement) => {
      if (stageRoom().width >= region.clientWidth * FIGURE_FIT_FLOOR) return true;
      const panel = stageCopy(frame);
      probe.replaceChildren(panel);
      document.body.append(probe);
      const copy = panel.querySelector("table")!;
      const copyRegion = panel.querySelector<HTMLElement>("[role=region]")!;
      fitTable(panel, copyRegion, copy, probe);
      const whole = copy.offsetWidth <= copyRegion.clientWidth + 1;
      const zoom = Number(panel.style.getPropertyValue("--zoom"));
      probe.remove();
      probe.replaceChildren();
      return whole && (table.offsetWidth > region.clientWidth + 1 || zoom >= FIGURE_FIT_FLOOR);
    };
    const figureGains = (figure: HTMLElement, frame: HTMLElement) => {
      if (scrollExcess(figure) > 0) return true;
      const room = stageRoom();
      return figureScale(figure.offsetWidth, frame.offsetHeight, room.width + 2, room.height + 2).scale >= FIGURE_FIT_FLOOR;
    };

    const settleFrame = ({ frame, region, table, control }: (typeof frames)[number]) => {
      // A table a little wider than its column closes up to fit, then wraps its phrases.
      floorHeadings(table);
      layTable(region, table, parseFloat(getComputedStyle(root).fontSize));
      pinRowLabels(region, table);
      control.toggleAttribute("data-idle", !tableGains(frame, region, table));
      clearTableControl(frame, region, table, control);
    };
    // Setting a table changes its height, never the width watched, so only a new width resets it.
    const regionWidths = new WeakMap<Element, number>();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (regionWidths.get(entry.target) === entry.contentRect.width) continue;
        regionWidths.set(entry.target, entry.contentRect.width);
        settleFrame(frames.find(({ region }) => region === entry.target)!);
      }
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
    const clearControl = ({ figure, frame, control }: (typeof figureControls)[number]) => {
      frame.removeAttribute("data-zoom-row");
      control.toggleAttribute("data-idle", !figureGains(figure, frame));
      if (!control.hasAttribute("data-idle") && coversControl(frame, control)) frame.setAttribute("data-zoom-row", "");
    };
    on(window, "resize", () => figureControls.forEach(clearControl));
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
