// Closed forms of "Certified Joint Pricing Errors in Rough Heston" that its
// figures evaluate: the forward variance curve (7.1) with its damped version,
// the derivative of the series (3.9), and the netting ratio (5.7) with its
// Herfindahl level (5.9) on the strike ladder of Section 7.

/** The calibrated curve (7.1) and the model parameters of Section 7. */
export const ROUGH_HESTON = {
  alpha: 0.52,
  alpha0: 0.5286,
  v0: 0.0262,
  theta: 0.0721,
  lambdaXi: 0.5037,
  nu: 0.2897,
  rho: -0.7445,
  forward: 4221.86,
  strikes: Array.from({ length: 12 }, (_, index) => 3700 + 100 * index),
} as const;

const LANCZOS = [
  0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

/** 1/Γ(x) for x > 0, by the Lanczos approximation. */
function reciprocalGamma(x: number): number {
  if (x < 0.5) return (Math.sin(Math.PI * x) / Math.PI) / reciprocalGamma(1 - x);
  const shifted = x - 1;
  const base = shifted + 7.5;
  const series = LANCZOS.slice(1).reduce((sum, coefficient, index) => sum + coefficient / (shifted + index + 1), LANCZOS[0]);
  return Math.exp(-(0.5 * Math.log(2 * Math.PI) + (shifted + 0.5) * Math.log(base) - base + Math.log(series)));
}

/** The Mittag-Leffler function E_{a,b}(z), by its power series. */
function mittagLeffler(a: number, b: number, z: number): number {
  let sum = 0;
  let power = 1;
  for (let n = 0; n < 60; n += 1) {
    sum += power * reciprocalGamma(a * n + b);
    power *= z;
  }
  return sum;
}

/**
 * The forward variance at time t under mean-reversion speed λ: ξ(t) of (7.1) at
 * λ = 0, and the expected variance under the tilted measure of Proposition 3.2
 * for λ > 0.
 */
export function forwardVariance(t: number, lambda: number): number {
  const { alpha, alpha0, v0, theta, lambdaXi } = ROUGH_HESTON;
  if (t === 0) return v0;
  let total = 0;
  for (let n = 0; n < 40; n += 1) {
    total += (-lambda) ** n * t ** (n * alpha)
      * (theta * reciprocalGamma(1 + n * alpha) + (v0 - theta) * mittagLeffler(alpha0, 1 + n * alpha, -lambdaXi * t ** alpha0));
  }
  return total;
}

/** The damping rate of Theorem 3.1 on the Lewis contour. */
export const halfShareDamping = 0.5 * Math.abs(ROUGH_HESTON.rho) * ROUGH_HESTON.nu;

const loads = (weights: readonly number[]) => weights.map((weight, index) => weight * Math.sqrt(ROUGH_HESTON.strikes[index] / ROUGH_HESTON.forward));

/** The netting ratio (5.7) of a position on the twelve strikes at the frequency u. */
export function nettingRatio(weights: readonly number[], u: number): number {
  let real = 0;
  let imaginary = 0;
  let gross = 0;
  loads(weights).forEach((load, index) => {
    const phase = u * Math.log(ROUGH_HESTON.strikes[index] / ROUGH_HESTON.forward);
    real += load * Math.cos(phase);
    imaginary -= load * Math.sin(phase);
    gross += Math.abs(load);
  });
  return Math.hypot(real, imaginary) / gross;
}

/** The square root of the Herfindahl index (5.9) of a position. */
export function herfindahlLevel(weights: readonly number[]): number {
  const values = loads(weights);
  return Math.sqrt(values.reduce((sum, load) => sum + load * load, 0)) / values.reduce((sum, load) => sum + Math.abs(load), 0);
}

/** A position on the twelve strikes with the given weights at the given strikes. */
export function position(legs: Readonly<Record<number, number>>): number[] {
  return ROUGH_HESTON.strikes.map((strike) => legs[strike] ?? 0);
}
