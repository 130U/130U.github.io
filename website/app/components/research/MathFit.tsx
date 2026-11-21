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

/** A displayed equation's pieces: the formula, whose line wraps its number beneath the expression;
 * the expression's box, which scrolls; the expression; and its number, if it has one. */
function pieces(region: HTMLElement) {
  const formula = region.querySelector<HTMLElement>('[data-research-formula="display"]');
  const scroll = formula?.querySelector<HTMLElement>("[data-equation-scroll]");
  const expression = scroll?.firstElementChild as HTMLElement | null | undefined;
  const number = formula?.querySelector<HTMLElement>("[data-equation-edge]") ?? null;
  return formula && scroll && expression ? { formula, scroll, expression, number } : undefined;
}
type Pieces = NonNullable<ReturnType<typeof pieces>>;

/** Sets a displayed equation at its natural size, its number a gap of 1.5em away. */
function naturalDisplay(region: HTMLElement) {
  region.removeAttribute("data-fit");
  region.style.removeProperty("--equation-fit");
}

/** The room the number takes beside its expression: the gap before it and its figures. */
function numberWidth(number: HTMLElement | null) {
  if (!number) return 0;
  const text = document.createRange();
  text.selectNodeContents(number);
  return text.getBoundingClientRect().width + parseFloat(getComputedStyle(number).paddingInlineStart);
}

/** The drawings of a stacked display's last line: its last row, or that row's last part where it parts. */
function lastLine(expression: HTMLElement) {
  const row = expression.querySelector<HTMLElement>("[data-display-stack] > :last-child");
  const line = row?.hasAttribute("data-row-parted") ? row.lastElementChild : row;
  return line ? [...line.querySelectorAll<SVGSVGElement>("svg[data-research-svg]")] : [];
}

/**
 * Where the last line of a stacked display leaves room for its number, the number stands beside
 * that line, on its baseline, as TeX sets a tag beside the last line of a display that has room
 * for it there (data-number-last, --number-top). Returns whether it does.
 */
function besideLastLine(region: HTMLElement, { formula, expression, number }: Pieces) {
  const svg = lastLine(expression).at(-1);
  if (!number || !svg) return false;
  const box = formula.getBoundingClientRect();
  const ink = svg.getBoundingClientRect();
  // The drawing keeps a gutter past its ink.
  if (ink.right - parseFloat(getComputedStyle(svg).fontSize) * GUTTER_EM + numberWidth(number) > box.right - SLACK_PX) return false;
  const view = svg.viewBox.baseVal;
  const baseline = ink.top - view.y * (ink.height / view.height);
  // The number's box reaches a strut's height above its baseline.
  region.style.setProperty("--number-top", `${(baseline - box.top - number.getBoundingClientRect().height).toFixed(2)}px`);
  region.setAttribute("data-number-last", "");
  return true;
}

/** Whether the display stands whole in its column: its number beside it, or beside its last line,
 * or, if `alone`, on the line beneath it. */
function stands(region: HTMLElement, found: Pieces, alone: boolean) {
  const { scroll, number } = found;
  if (overflow(scroll) > 0) return false;
  if (!number || number.getBoundingClientRect().top < scroll.getBoundingClientRect().bottom - 1) return true;
  return besideLastLine(region, found) || alone;
}

/**
 * Sets a display at its natural size, or fitted to its room: beside its number unless `alone`,
 * where the number takes the line beneath. Fitted, the gap before its number closes to 1em, and
 * the expression is set smaller, down to the floor; its left gutter scales with it and the
 * padding before it grows by as much, so the ink keeps its axis. Returns whether it stands whole.
 */
function fitDisplay(region: HTMLElement, found: Pieces, alone: boolean) {
  const { formula, scroll, expression, number } = found;
  naturalDisplay(region);
  if (stands(region, found, alone)) return true;
  region.setAttribute("data-fit", "");
  if (stands(region, found, alone)) return true;
  const room = formula.getBoundingClientRect().width - SLACK_PX;
  const ink = expression.getBoundingClientRect().width;
  const padding = parseFloat(getComputedStyle(scroll).paddingInlineStart);
  const gutter = parseFloat(getComputedStyle(expression).fontSize) * GUTTER_EM;
  const scale = Math.floor(((room - (alone ? 0 : numberWidth(number)) - padding - gutter) / (ink - gutter)) * 1000) / 1000;
  if (scale >= MATH_FIT_FLOOR && scale < 1) {
    region.style.setProperty("--equation-fit", String(scale));
    if (stands(region, found, alone)) return true;
  }
  naturalDisplay(region);
  return false;
}

/** Parts each row of a stacked display that the column cannot hold whole at its natural size;
 * returns whether any row parted. */
function partRows({ formula, scroll }: Pieces) {
  const room = formula.getBoundingClientRect().width - SLACK_PX - parseFloat(getComputedStyle(scroll).paddingInlineStart);
  let parted = false;
  for (const row of scroll.querySelectorAll<HTMLElement>("[data-row-parts]")) {
    const drawings = [...row.querySelectorAll<HTMLElement>(":scope > [data-row-part] > *")];
    if (!drawings.length) continue;
    // Each drawing keeps a gutter on either side; the stack keeps one around its rows.
    if (drawings.at(-1)!.getBoundingClientRect().right - drawings[0].getBoundingClientRect().left > room) {
      row.setAttribute("data-row-parted", "");
      parted = true;
    }
  }
  return parted;
}

/**
 * Lays out a displayed equation in the first of these forms that stands whole in its column:
 * as set, its number beside it or beside its last line, at its natural size or fitted; as set,
 * its number on a line of its own beneath it (the formula's line wraps), natural or fitted; then
 * the same with each row that the column cannot hold parted, its qualifier or connecting word on
 * a line of its own. A display that stands whole in none of them scrolls at its natural size, its
 * rows parted where that helps, its number beneath it, and fades at the column's edge
 * (data-scrolls).
 */
function layDisplay(region: HTMLElement) {
  naturalDisplay(region);
  region.removeAttribute("data-scrolls");
  region.removeAttribute("data-number-last");
  region.style.removeProperty("--number-top");
  region.querySelectorAll("[data-row-parted]").forEach((row) => row.removeAttribute("data-row-parted"));
  const found = pieces(region);
  if (!found) return;
  for (const parted of [false, true]) {
    if (parted && !partRows(found)) break;
    if (fitDisplay(region, found, false) || fitDisplay(region, found, true)) return;
  }
  region.setAttribute("data-scrolls", "");
}

// At rest, a display that scrolls fades out over an em at the column's edge. Ink within the
// first half of that em reads as fading; where the edge falls in a blank, as between two parts of
// a display, the fade reaches back to end a quarter of an em past the last ink before the edge,
// so the reader meets fading ink, never an expression that looks finished.
const FADE_VISIBLE_EM = 0.5;
const FADE_PAST_INK_EM = 0.25;

/** How far the fade of a scrolling display reaches back at rest, in pixels, or 0. */
function fadeReach(region: HTMLElement) {
  const scroll = region.querySelector<HTMLElement>("[data-equation-scroll]");
  const fade = scroll?.querySelector<HTMLElement>("[data-equation-fade]");
  if (!scroll || !fade || !region.hasAttribute("data-scrolls") || overflow(scroll) <= 0) return 0;
  const em = parseFloat(getComputedStyle(fade).fontSize);
  // Positions at rest, whatever the present scroll: the fade holds the box's right side.
  const start = scroll.getBoundingClientRect().left + scroll.clientWidth - fade.getBoundingClientRect().width;
  let last = -Infinity;
  for (const node of scroll.querySelectorAll("svg path, svg rect, svg line")) {
    const ink = node.getBoundingClientRect();
    if (!ink.width && !ink.height) continue;
    const [left, right] = [ink.left + scroll.scrollLeft, ink.right + scroll.scrollLeft];
    if (left < start + FADE_VISIBLE_EM * em && right > start) return 0;
    if (right <= start) last = Math.max(last, right);
  }
  return Number.isFinite(last) ? start - last + (1 - FADE_PAST_INK_EM) * em : 0;
}

function reachFade(region: HTMLElement) {
  const reach = fadeReach(region);
  if (reach > 0) region.style.setProperty("--fade-reach", `${reach.toFixed(2)}px`);
  else region.style.removeProperty("--fade-reach");
  const scroll = region.querySelector<HTMLElement>("[data-equation-scroll]");
  if (scroll) markScrolled(scroll);
}

/** Marks whether a display's box has scrolled past its start, where the fade returns to its em at the edge. */
function markScrolled(scroll: HTMLElement) {
  scroll.toggleAttribute("data-scrolled", scroll.scrollLeft > 0);
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
 * Lays out the article's displayed equations (layDisplay) and fits the inline
 * formulas wide enough to scroll, whenever their room changes. An inline formula
 * that would need more than the floor allows scrolls in place at its natural
 * size; a display scrolls only where it stands whole in no form, its number
 * beneath it and its fade over ink at rest. Every formula is complete without it.
 */
export function MathFit() {
  useEffect(() => {
    // A table of mathematics is laid out as a research table, by ZoomStage.
    const displays = [...document.querySelectorAll<HTMLElement>('[data-research-block-type="equation"]:not([data-math-table])')];
    const boxes = displays.map((region) => region.querySelector<HTMLElement>("[data-equation-scroll]")).filter((box): box is HTMLElement => box !== null);
    const onScroll = (event: Event) => markScrolled(event.currentTarget as HTMLElement);
    boxes.forEach((box) => box.addEventListener("scroll", onScroll, { passive: true }));
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
        if (displays.includes(entry.target as HTMLElement)) {
          layDisplay(entry.target as HTMLElement);
          reachFade(entry.target as HTMLElement);
        }
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
      boxes.forEach((box) => {
        box.removeEventListener("scroll", onScroll);
        box.removeAttribute("data-scrolled");
      });
      displays.forEach((region) => {
        region.style.removeProperty("--fade-reach");
        region.removeAttribute("data-scrolls");
        region.removeAttribute("data-number-last");
        region.style.removeProperty("--number-top");
        region.querySelectorAll("[data-row-parted]").forEach((row) => row.removeAttribute("data-row-parted"));
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
