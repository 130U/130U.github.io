import { fractionDigitGroups } from "../../lib/content/research-number";

/** A run of a figure's text: plain text, or a group of digits that stands a thin space after the run before it. */
export type DigitRun = { text: string; group: boolean };

// A number with five or more digits after its point.
const LONG_FRACTION = /(\d*\.)(\d{5,})(?!\d)/gu;

/**
 * A figure's text split so that each number with five or more digits after its
 * point stands in the groups a research table sets (fractionDigitGroups): the
 * point and the first group close against the integer part, and each later
 * group is a run of its own, parted from the one before by spacing alone. The
 * runs joined are the text unchanged, so copying a label or a readout returns
 * the manuscript's digits.
 */
export function digitRuns(text: string): DigitRun[] {
  const runs: DigitRun[] = [];
  let cursor = 0;
  for (const match of text.matchAll(LONG_FRACTION)) {
    const [first, ...rest] = fractionDigitGroups(match[2]);
    const head = match.index + match[1].length + first.length;
    runs.push({ text: text.slice(cursor, head), group: false });
    for (const group of rest) runs.push({ text: group, group: true });
    cursor = match.index + match[0].length;
  }
  runs.push({ text: text.slice(cursor), group: false });
  return runs.filter((run) => run.text);
}

/** Whether a text holds a number whose digits after the point are grouped in a figure. */
export function hasLongFraction(text: string) {
  return /\.\d{5,}/u.test(text);
}
