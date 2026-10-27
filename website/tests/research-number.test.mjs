import assert from "node:assert/strict";
import test from "node:test";
import { proseNumber } from "../app/lib/content/research-number.ts";

test("inline quantities retain digits, signs, percentages, and scientific exponents in the prose face", () => {
  for (const [tex, expected] of [
    ["100", { base: "100" }],
    ["2,400", { base: "2,400" }],
    ["-0.61", { base: "−0.61" }],
    ["+0.15", { base: "+0.15" }],
    [String.raw`0.5\%`, { base: "0.5", suffix: "%" }],
    [String.raw`1.21 \times 10^{-14}`, { base: "1.21 × 10", exponent: "−14" }],
    [String.raw`10^{5}`, { base: "10", exponent: "5" }],
    [String.raw`-2 \times 10^{-3}\%`, { base: "−2 × 10", exponent: "−3", suffix: "%" }],
  ]) assert.deepEqual(proseNumber(tex), expected, tex);
});

test("expressions, sets, relations, and malformed numbers retain mathematical typesetting", () => {
  for (const tex of ["", "NaN", "1,2", "1.2.3", "x", "x=2", "2+3", "[0,1]", "10^x", "10^{-x}", String.raw`\gamma/s`, String.raw`\frac12`, String.raw`\text{100}`, "100%"]) {
    assert.equal(proseNumber(tex), undefined, tex);
  }
});
