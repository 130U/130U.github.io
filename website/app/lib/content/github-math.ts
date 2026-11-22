// The paper repositories write their manuscripts for GitHub's renderer: a display formula is a
// picture whose alt text holds its TeX, and a few letters are spelled in Unicode. The site sets
// the TeX itself, so it reads both back before parsing.

const LETTERS: Readonly<Record<string, string>> = {
  "𝟎": "\\mathbf{0}", "𝟏": "\\mathbf{1}", "𝟐": "\\mathbf{2}", "𝟓": "\\mathbf{5}",
  "𝒜": "\\mathcal{A}", "ℬ": "\\mathcal{B}", "𝒟": "\\mathcal{D}", "𝒢": "\\mathcal{G}", "ℒ": "\\mathcal{L}", "𝒮": "\\mathcal{S}",
  "ℕ": "\\mathbb{N}", "ℝ": "\\mathbb{R}",
};
const LETTER = new RegExp(`[${Object.keys(LETTERS).join("")}]`, "gu");
// GitHub draws no space after \log and its kin, so the repositories add a thin one the site does not need.
const FUNCTION_SPACE = /(\\(?:log|ln|lg|exp|sin|cos|tan|sec|csc|cot|sinh|cosh|tanh|coth|arcsin|arccos|arctan|ker|dim|deg|hom|arg)(?![A-Za-z])(?:\s*[_^](?:\{[^{}]*\}|\\[A-Za-z]+|[A-Za-z0-9]))*)\\,/gu;
const PICTURE = /(?:<p align="center">\s*)?<picture>[\s\S]*?<img [^>]*\balt="([^"]*)"[^>]*>\s*<\/picture>(?:\s*<\/p>)?/gu;
const ENTITY: Readonly<Record<string, string>> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text: string) {
  return text.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(amp|lt|gt|quot|apos));/giu, (_, hex?: string, decimal?: string, name?: string) =>
    hex ? String.fromCodePoint(Number.parseInt(hex, 16)) : decimal ? String.fromCodePoint(Number(decimal)) : ENTITY[name!.toLowerCase()]);
}

// GitHub sets |x| loosely, so the repositories write \left\vert x\right\vert; MathJax sets |x| as the papers do.
function tex(source: string) {
  return source.replace(LETTER, (letter) => LETTERS[letter]).replace(FUNCTION_SPACE, "$1 ")
    .replace(/\\left\\vert\s?/gu, "|").replace(/\\right\\vert/gu, "|");
}

/** The manuscript as TeX: pictures become display formulas, inline formulas lose their GitHub spellings. */
export function restoreGithubMath(markdown: string) {
  return markdown
    .replace(PICTURE, (_, alt: string) => `$$\n${tex(decode(alt))}\n$$`)
    .replace(/\$`([^`]*)`\$/gu, (_, inline: string) => `$\`${tex(inline)}\`$`);
}
