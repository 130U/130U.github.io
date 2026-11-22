type ProseNumber = { base: string; exponent?: string; suffix?: string };

/** Recognize only complete numeric literals; mathematical relations stay in TeX. */
export function proseNumber(tex: string): ProseNumber | undefined {
  const compact = tex.trim().replace(/\s+/gu, "");
  const number = String.raw`[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?|\.\d+)`;
  const plain = compact.match(new RegExp(`^(${number})(\\\\%)?$`, "u"));
  if (plain) return { base: plain[1].replace(/^-/u, "−"), ...(plain[2] ? { suffix: "%" } : {}) };
  const scientific = compact.match(new RegExp(`^(?:(${number})\\\\times)?10\\^\\{([+-]?\\d+)\\}(\\\\%)?$`, "u"));
  if (!scientific) return undefined;
  return {
    base: scientific[1] === undefined ? "10" : `${scientific[1].replace(/^-/u, "−")} × 10`,
    exponent: scientific[2].replace(/^-/u, "−"),
    ...(scientific[3] ? { suffix: "%" } : {}),
  };
}

/**
 * The digits after a number's decimal point as the site sets them in tables:
 * groups of three from the point, a lone final digit joining the group before
 * it, as CODATA prints its constants (.030 7690, 6.508 371 733, .010 642 371 599);
 * four digits or fewer stand as one group. The groups are parted by spacing
 * alone, so the number's text stays the manuscript's. Every table of the site
 * groups its digits through this one helper.
 */
export function fractionDigitGroups(fraction: string): string[] {
  const groups = fraction.match(/\d{1,3}/gu) ?? [];
  if (groups.length > 1 && groups[groups.length - 1].length === 1) groups.splice(-2, 2, groups[groups.length - 2] + groups[groups.length - 1]);
  return groups;
}

// The numbers of a research table, and of a table of mathematics, set as a
// printed table sets them: each value in tabular figures, its digits after the
// point grouped (fractionDigitGroups), and each column aligned on the decimal
// point. A value is a number, a percentage, an interval [a, b], a bound with its
// relation (≤ .008018821658) or a list of numbers (a / b / c, a–b–c, a, b),
// written in the cell's text or as its one formula; in a research table it may
// carry a note in parentheses after it ("1.0035464 (used)"). Nothing is
// inserted: the groups are spans and the alignment is set by invisible generated
// text, so the copied and searched text is the manuscript's.

export type NumberField = {
  /** What precedes the number in its cell, after the previous field: a separator, a relation and any opening bracket. */
  separator: string;
  open: string;
  sign: string;
  integer: string;
  /** The digits after the point, or undefined for a number written without one. */
  fraction?: string;
  /** What closes against the number: a percent sign, a closing bracket, the comma of an interval. */
  close: string;
};

/** A value; `note` is the text after it in its cell, from the space before its opening parenthesis. */
export type TableNumber = { bold: boolean; tex?: string; fields: NumberField[]; note?: string };

/**
 * Invisible text that pads a value to its column's alignment, and the digit-group
 * gaps it stands for. In a column of both weights, a pad takes the weight of the
 * digits it stands for (`bold`), so it is as wide as they are; otherwise it takes
 * its value's weight.
 */
export type Pad = { text: string; gaps: number; bold?: boolean };

/**
 * A field aligned in its column. In a column of both weights, where bold figures
 * are wider than regular ones, or of signs of different widths (a plus beside a
 * minus written as a hyphen), a number's lead (its bracket, sign and integer
 * part) stands at the end of a box as wide as the column's widest lead set in
 * bold, its sign a plus (`lead`), so its point stands where every other's does.
 */
export type AlignedField = NumberField & { groups: string[]; before: Pad; after: Pad; lead?: string };
export type AlignedNumber = { bold: boolean; tex?: string; interval: boolean; fields: AlignedField[]; tail: Pad[]; note?: string };

const NUMBER = String.raw`([-+−]?)(\d{1,3}(?:,\d{3})+|\d*)(?:\.(\d+))?`;
// A bound stands after its relation and a space, as TeX sets a relation apart.
const FIELD = new RegExp(String.raw`^((?:[≤≥<>] )?\[?)${NUMBER}(%?\]?)`, "u");
const RELATIONS: Readonly<Record<string, string>> = { le: "≤", leq: "≤", ge: "≥", geq: "≥", lt: "<", gt: ">" };

/**
 * The TeX of a formula that writes only numbers, as the drawing reads: spacing
 * commands go, bold digits stay digits, a minus is a minus sign, a relation is
 * its sign and a space, and an interval's comma takes the space TeX sets after
 * punctuation in mathematics.
 */
function texText(tex: string) {
  let bold = false;
  let text = tex.trim()
    .replace(/\\mathbf\{([\d.,]+)\}/gu, (_, digits: string) => { bold = true; return digits; })
    .replace(/\\%/gu, "%")
    .replace(/^(?:\\(leq?|geq?|lt|gt)(?![A-Za-z])|([<>]))\s*/u, (_, name?: string, sign?: string) => `${name ? RELATIONS[name] : sign} `);
  text = text.startsWith("[") ? text.replace(/,\s*(?:\\[;,:]\s*)?/gu, ", ") : text;
  text = text.replace(/\\[;,:!]|\\ /gu, "").replace(/-/gu, "−");
  return /[\\{}^_]/u.test(text) ? undefined : { text, bold };
}

/** The fields of a value written as text, or undefined when the text is not a value. */
function fields(text: string): NumberField[] | undefined {
  const result: NumberField[] = [];
  let rest = text.trim();
  let separator = "";
  for (;;) {
    const match = FIELD.exec(rest);
    if (!match || (match[3] === "" && match[4] === undefined)) return undefined;
    const [whole, open, sign, integer, fraction, close] = match;
    result.push({ separator, open, sign, integer, fraction, close });
    rest = rest.slice(whole.length);
    if (!rest) break;
    // An interval's comma closes against its lower end; a list's separator stands between its values.
    const next = /^,( ?)|^ \/ |^–/u.exec(rest);
    if (!next) return undefined;
    if (next[0].startsWith(",") && result[0].open.endsWith("[") && result.length === 1) {
      result[0].close = ",";
      separator = next[1];
    } else {
      separator = next[0];
    }
    rest = rest.slice(next[0].length);
  }
  const opened = result.filter((field) => field.open.endsWith("[")).length;
  const closed = result.filter((field) => field.close.endsWith("]")).length;
  if (opened !== closed || (opened && (!result[0].open.endsWith("[") || !result.at(-1)!.close.endsWith("]") || result.length !== 2))) return undefined;
  return result;
}

/** The value a formula writes, when it writes only numbers: $`[.0307690,.0307764]`$, $`\le.008018821658`$. */
export function parseTexNumber(tex: string, bold = false): TableNumber | undefined {
  const text = texText(tex);
  const parsed = text && fields(text.text);
  return parsed ? { bold: bold || text.bold, tex, fields: parsed } : undefined;
}

/**
 * A cell's value, from its Markdown source: plain text such as "0.023182246099",
 * "14.81% / 3.00%", "[4.825094, 6.778350]" or "**0.515**", or one formula that
 * writes only numbers, such as $`[-0.011024692273,\;0.010642371599]`$. Anything
 * else (a fraction, a power of ten, a word) is not a value of this kind. With
 * `note`, a value written as text may be followed by a note in parentheses,
 * "1.0035464 (used)", which the cell sets after the value as text.
 */
export function parseTableNumber(source: string, { note = false }: { note?: boolean } = {}): TableNumber | undefined {
  let value = source.trim();
  let bold = false;
  const strong = /^\*\*([\s\S]+)\*\*$/u.exec(value);
  if (strong) {
    bold = true;
    value = strong[1].trim();
  }
  const formula = /^\$`([^`]*)`\$$|^\\\(([\s\S]*)\\\)$/u.exec(value);
  if (formula) return parseTexNumber(formula[1] ?? formula[2], bold);
  const noted = note && !bold ? /^([^\s(]+)( \([\s\S]*\))$/u.exec(value) : null;
  if (noted) {
    // The value before a note is plain text, as the manuscript writes "1.0035464 (used)".
    const parsed = parseTableNumber(noted[1]);
    return parsed && parsed.tex === undefined && !parsed.bold ? { ...parsed, note: noted[2] } : undefined;
  }
  if (/[$`\\*_[\]]/u.test(value.replace(/^\[|\]$/gu, ""))) return undefined;
  const parsed = fields(value);
  return parsed ? { bold, fields: parsed } : undefined;
}

// Widths are kept as the characters that make them, so a pad is the text a
// shorter value lacks: a bracket, a sign, the leading digits of the widest
// integer part, and digits after the point with the gaps of their groups.
type Slot = { separator: string; open: string; sign: string; integer: string; bold: boolean; fraction: number; groups: number; close: string };

function groupCount(digits: number) {
  return Math.max(0, fractionDigitGroups("0".repeat(digits)).length - 1);
}

function longer(a: string, b: string) {
  return b.length > a.length ? b : a;
}

function slotsOf(values: TableNumber[]) {
  const slots: Slot[] = [];
  for (const value of values) {
    value.fields.forEach((field, index) => {
      const slot = slots[index] ?? { separator: "", open: "", sign: "", integer: "", bold: false, fraction: -1, groups: 0, close: "" };
      const fraction = field.fraction?.length ?? -1;
      slots[index] = {
        separator: longer(slot.separator, field.separator),
        open: longer(slot.open, field.open),
        sign: longer(slot.sign, field.sign),
        integer: longer(slot.integer, field.integer),
        // The weight of the widest integer part, whose leading digits a shorter one's pad repeats.
        bold: field.integer.length > slot.integer.length ? value.bold : slot.bold,
        fraction: Math.max(slot.fraction, fraction),
        groups: Math.max(slot.groups, groupCount(Math.max(fraction, 0))),
        close: longer(slot.close, field.close),
      };
    });
  }
  return slots;
}

function fractionPad(slot: Slot, field: NumberField): Pad {
  const own = field.fraction?.length ?? -1;
  if (slot.fraction < 0) return { text: "", gaps: 0 };
  const point = own < 0 ? "." : "";
  return { text: `${point}${"0".repeat(slot.fraction - Math.max(own, 0))}`, gaps: slot.groups - groupCount(Math.max(own, 0)) };
}

function wholeSlot(slot: Slot): Pad {
  const fraction = slot.fraction < 0 ? "" : `.${"0".repeat(slot.fraction)}`;
  return { text: `${slot.separator}${slot.open}${slot.sign}${slot.integer}${fraction}${slot.close}`, gaps: slot.groups };
}

function join(...pads: Pad[]): Pad {
  return { text: pads.map((pad) => pad.text).join(""), gaps: pads.reduce((sum, pad) => sum + pad.gaps, 0) };
}

export function isInterval(value: TableNumber) {
  return value.fields[0].open.endsWith("[");
}

export type AlignedColumn = { values: AlignedNumber[]; start: boolean };

const NO_PAD: Pad = { text: "", gaps: 0 };

/**
 * Align a column of values on the decimal point. Each field is padded before
 * its number to the column's widest bracket, sign and integer part. Where every
 * value holds as many fields, each is padded after its closing marks to the
 * column's longest fraction and marks, so every value takes one width and the
 * column keeps its right alignment with the points of each field in line. Where
 * values hold different numbers of fields (an interval among single values, a
 * list among numbers), or some are bold, or some carry a note after them, the
 * column aligns from its start (`start`), padded before its numbers only. An
 * interval holds one line and keeps its upper end against its comma, its pads
 * moved to its end, so no gap opens inside the brackets.
 */
export function alignColumn(values: TableNumber[]): AlignedColumn {
  const slots = slotsOf(values);
  // Bold figures are wider than regular ones, so a column that sets some values in bold aligns from its start too,
  // as does one whose notes, of their own lengths, follow its values.
  const weights = new Set(values.map((value) => value.bold)).size > 1;
  // Signs of different widths: a plus or a minus sign beside a minus written as a hyphen, which is narrower.
  const signs = new Set(values.flatMap((value) => value.fields.map((field) => field.sign)).filter(Boolean)).size > 1;
  const boxed = weights || signs;
  const start = weights || new Set(values.map((value) => value.fields.length)).size > 1 || values.some((value) => value.note !== undefined);
  return {
    start,
    values: values.map((value) => {
      const aligned = value.fields.map((field, index): AlignedField => {
        const slot = slots[index];
        const groups = field.fraction === undefined ? [] : fractionDigitGroups(field.fraction);
        const after = start ? NO_PAD : join(fractionPad(slot, field), { text: slot.close.slice(field.close.length), gaps: 0 });
        // In a column of both weights, or of signs of different widths, a number's lead stands in a box as wide
        // as the widest lead in bold, its sign a plus, the widest sign; an interval's upper end follows its comma.
        if (boxed && !(isInterval(value) && index === 1)) {
          return { ...field, groups, before: { text: slot.separator.slice(field.separator.length), gaps: 0 }, after, lead: `${slot.open}${slot.sign ? "+" : ""}${slot.integer}` };
        }
        const before: Pad = {
          text: `${slot.separator.slice(field.separator.length)}${slot.open.slice(field.open.length)}${slot.sign.slice(field.sign.length)}${slot.integer.slice(0, slot.integer.length - field.integer.length)}`,
          gaps: 0,
          // In a column of both weights, a pad takes the weight of the integer part it repeats.
          ...(start && field.integer.length < slot.integer.length ? { bold: slot.bold } : {}),
        };
        return { ...field, groups, before, after };
      });
      if (!isInterval(value)) {
        const tail: Pad[] = start ? [] : [join(...slots.slice(value.fields.length).map(wholeSlot))];
        return { bold: value.bold, tex: value.tex, interval: false, fields: aligned, tail, ...(value.note === undefined ? {} : { note: value.note }) };
      }
      // The upper end follows the comma: what would pad the lower end's fraction and the upper end's lead
      // stands after the closing bracket instead.
      const [lower, upper] = aligned;
      const moved = join(lower.after, upper.before, upper.after);
      return {
        bold: value.bold,
        tex: value.tex,
        interval: true,
        fields: [{ ...lower, after: NO_PAD }, { ...upper, before: NO_PAD, after: NO_PAD }],
        tail: start ? [] : [moved],
        ...(value.note === undefined ? {} : { note: value.note }),
      };
    }),
  };
}

/**
 * A column of a table of mathematics whose every cell writes only numbers (an
 * interval, a bound with its relation, a number), as a research table's column
 * of values: aligned on the decimal point, set in the reading face. The values
 * carry no TeX of their own, since the table's one assistive expression carries
 * the whole display; an empty cell stays empty. A column with any other cell (a
 * fraction, a symbol, an expression) stays mathematics, undefined here.
 */
export function alignTexColumn(cells: readonly string[]): { values: (AlignedNumber | undefined)[]; start: boolean } | undefined {
  const parsed = cells.map((tex) => (tex.trim() ? parseTexNumber(tex) : null));
  const values = parsed.filter((value): value is TableNumber => Boolean(value));
  if (!values.length || parsed.includes(undefined)) return undefined;
  const column = alignColumn(values.map((value) => ({ ...value, tex: undefined })));
  let next = 0;
  return { values: parsed.map((value) => (value ? column.values[next++] : undefined)), start: column.start };
}

/** The digits of a value exactly as the manuscript writes them, with its marks: what copying the cell returns. */
export function writtenNumber(value: TableNumber | AlignedNumber) {
  return value.fields.map((field) => `${field.separator}${field.open}${field.sign}${field.integer}${field.fraction === undefined ? "" : `.${field.fraction}`}${field.close}`).join("");
}
