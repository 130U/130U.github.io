"use client";

import { useEffect } from "react";

/** The smallest share of its size a formula is set at to fit its room. A displayed equation is set
 * at 1.15 times the reading size, so a fitted display still stands above the text around it. */
export const MATH_FIT_FLOOR = 0.9;
// The transparent gutter each formula drawing carries on either side (RESEARCH_MATH_GUTTER_EM).
const GUTTER_EM = 0.375;
// Room left inside a fitted box, against subpixel overflow.
const SLACK_PX = 1;

const overflow = (box: HTMLElement) => box.scrollWidth - box.clientWidth;

/** Sets a displayed equation at its natural size, its number a gap of 1.5em away. */
function naturalDisplay(region: HTMLElement) {
  region.removeAttribute("data-fit");
  region.style.removeProperty("--equation-fit");
}

/**
 * A displayed equation that overshoots its column by a little is fitted to it:
 * the gap before its number closes to 1em, and the expression is set smaller,
 * down to the floor. Its left gutter scales with it and the padding
 * before it grows by as much, so the ink keeps its axis.
 */
function fitDisplay(region: HTMLElement) {
  naturalDisplay(region);
  const display = region.firstElementChild as HTMLElement | null;
  const expression = display?.firstElementChild as HTMLElement | null;
  if (!display || !expression || overflow(region) <= 0) return;
  region.setAttribute("data-fit", "");
  const width = display.getBoundingClientRect().width;
  const room = region.getBoundingClientRect().width - SLACK_PX;
  if (width <= room) return;
  const ink = expression.getBoundingClientRect().width;
  const gutter = parseFloat(getComputedStyle(display).fontSize) * GUTTER_EM;
  const scale = Math.floor(((room - (width - ink) - gutter) / (ink - gutter)) * 1000) / 1000;
  if (scale >= MATH_FIT_FLOOR) region.style.setProperty("--equation-fit", String(scale));
  if (scale < MATH_FIT_FLOOR || overflow(region) > 0) naturalDisplay(region);
}

// At rest, a display that scrolls fades out beneath its number's edge over an em. Ink within
// the first half of that em reads as fading; where the edge falls in a blank, as between two
// parts of a display, the fade reaches back to end a quarter of an em past the last ink before
// the edge, so the reader meets fading ink, never an expression that looks finished.
const FADE_VISIBLE_EM = 0.5;
const FADE_PAST_INK_EM = 0.25;

/** How far the fade of a scrolling display reaches back at rest, in pixels, or 0. */
function fadeReach(region: HTMLElement) {
  const display = region.firstElementChild as HTMLElement | null;
  const edge = display?.querySelector<HTMLElement>("[data-equation-edge]");
  if (!display || !edge || overflow(region) <= 0) return 0;
  const em = parseFloat(getComputedStyle(edge).fontSize);
  // Positions at rest, whatever the present scroll: the edge holds the scrollport's right side.
  const box = region.getBoundingClientRect();
  const start = box.left + region.clientWidth - edge.getBoundingClientRect().width;
  let last = -Infinity;
  for (const node of display.querySelectorAll("svg path, svg rect, svg line")) {
    const ink = node.getBoundingClientRect();
    if (!ink.width && !ink.height) continue;
    const [left, right] = [ink.left + region.scrollLeft, ink.right + region.scrollLeft];
    if (left < start + FADE_VISIBLE_EM * em && right > start) return 0;
    if (right <= start) last = Math.max(last, right);
  }
  return Number.isFinite(last) ? start - last + (1 - FADE_PAST_INK_EM) * em : 0;
}

function reachFade(region: HTMLElement) {
  const reach = fadeReach(region);
  if (reach > 0) region.style.setProperty("--fade-reach", `${reach.toFixed(2)}px`);
  else region.style.removeProperty("--fade-reach");
  markScrolled(region);
}

// A tabular display that scrolls keeps its row labels in view when they take no more than this
// share of its room, as a research table does.
const PIN_SHARE = 0.5;

/** Marks whether a display has scrolled past its start, where pinned labels take an edge and the
 * fade returns to its em beneath the edge. */
function markScrolled(region: HTMLElement) {
  region.toggleAttribute("data-scrolled", region.scrollLeft > 0);
}

/** Pins a tabular display's row labels while it scrolls, when they leave room for the values. */
function pinRowLabels(region: HTMLElement) {
  const labels = region.querySelector<HTMLElement>("[data-display-table] > :first-child > :first-child");
  const pinned = Boolean(labels) && overflow(region) > 0 && labels!.getBoundingClientRect().width <= region.clientWidth * PIN_SHARE;
  region.toggleAttribute("data-pinned", pinned);
  markScrolled(region);
}

const inlineAlign = new WeakMap<HTMLElement, string>();

/** Sets an inline formula at its natural size. */
function naturalInline(formula: HTMLElement) {
  formula.style.removeProperty("--formula-fit");
  const align = inlineAlign.get(formula);
  if (align !== undefined) formula.style.verticalAlign = align;
}

const SCROLLABLE_LABEL = "Scrollable mathematical expression";

/** A formula that scrolls is a keyboard stop named as one; a formula that fits is neither. */
function markScrollable(formula: HTMLElement, scrolls: boolean) {
  if (scrolls) {
    formula.tabIndex = 0;
    formula.setAttribute("aria-label", SCROLLABLE_LABEL);
  } else {
    formula.removeAttribute("tabindex");
    formula.removeAttribute("aria-label");
  }
}

/**
 * An inline formula a little wider than its line is set smaller, down to the
 * floor. Its drawing's depth scales with it while the box's gutter margins keep
 * the text's size, so its baseline offset becomes the gutter less the scaled
 * depth, and it keeps the text's baseline.
 */
function fitInline(formula: HTMLElement) {
  if (!inlineAlign.has(formula)) inlineAlign.set(formula, formula.style.verticalAlign);
  naturalInline(formula);
  const drawing = formula.firstElementChild as HTMLElement | null;
  if (drawing && overflow(formula) > 0) {
    const room = formula.getBoundingClientRect().width - SLACK_PX;
    const scale = Math.floor((room / drawing.getBoundingClientRect().width) * 1000) / 1000;
    if (scale >= MATH_FIT_FLOOR) {
      formula.style.setProperty("--formula-fit", String(scale));
      // The natural offset is the gutter less the depth (ResearchMath).
      formula.style.verticalAlign = `${((parseFloat(inlineAlign.get(formula)!) || 0) - GUTTER_EM) * scale + GUTTER_EM}em`;
      if (overflow(formula) > 0) naturalInline(formula);
    }
  }
  markScrollable(formula, overflow(formula) > 0);
}

/**
 * Fits the article's displayed equations and the inline formulas wide enough
 * to scroll, whenever their room changes. An equation or formula that would
 * need more than the floor allows scrolls in place at its natural size, its
 * fade over ink at rest; a tabular display that scrolls keeps its row labels
 * in view. Every formula is complete without it.
 */
export function MathFit() {
  useEffect(() => {
    const displays = [...document.querySelectorAll<HTMLElement>('[data-research-block-type="equation"]')];
    const tables = displays.filter((region) => region.querySelector("[data-display-table]"));
    const onScroll = (event: Event) => markScrolled(event.currentTarget as HTMLElement);
    displays.forEach((region) => region.addEventListener("scroll", onScroll, { passive: true }));
    const inline = [...document.querySelectorAll<HTMLElement>('[data-research-formula="inline"][tabindex]')]
      .filter((formula) => formula.querySelector(":scope > span > svg"));
    // An inline formula's room is the block that holds its line.
    const holders = new Map<Element, HTMLElement[]>();
    for (const formula of inline) {
      let holder = formula.parentElement;
      while (holder && getComputedStyle(holder).display.startsWith("inline")) holder = holder.parentElement;
      if (holder) holders.set(holder, [...(holders.get(holder) ?? []), formula]);
    }
    // Fitting changes heights, never the widths watched, so only a new width refits.
    const widths = new WeakMap<Element, number>();
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (widths.get(entry.target) === entry.contentRect.width) continue;
        widths.set(entry.target, entry.contentRect.width);
        if (displays.includes(entry.target as HTMLElement)) fitDisplay(entry.target as HTMLElement);
        if (tables.includes(entry.target as HTMLElement)) pinRowLabels(entry.target as HTMLElement);
        if (displays.includes(entry.target as HTMLElement)) reachFade(entry.target as HTMLElement);
        holders.get(entry.target)?.forEach(fitInline);
      }
    });
    let active = true;
    document.fonts.ready.then(() => {
      if (!active) return;
      displays.forEach((region) => observer.observe(region));
      holders.forEach((_, holder) => observer.observe(holder));
    });
    return () => {
      active = false;
      observer.disconnect();
      displays.forEach((region) => {
        region.removeEventListener("scroll", onScroll);
        region.removeAttribute("data-pinned");
        region.removeAttribute("data-scrolled");
        region.style.removeProperty("--fade-reach");
        naturalDisplay(region);
      });
      inline.forEach((formula) => {
        naturalInline(formula);
        markScrollable(formula, true);
      });
    };
  }, []);
  return null;
}
