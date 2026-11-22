// The bound on the cost of the kink in Black's model, per unit of strike, as
// "Certified Valuation of Arithmetic Asian Options" states it: the right side
// of (4.2) for a flat forward curve, and its leading term (4.4). Time runs in
// years of 252 trading days; fixings are daily.

const TRADING_DAYS = 252;

/**
 * Proposition 4.1: the bound (4.2) for `fixings` daily fixings that start
 * `leadDays` trading days ahead, at variance rate `variance`.
 */
export function kinkBoundPerStrike(leadDays: number, fixings: number, variance: number) {
  const times = Array.from({ length: fixings }, (_, index) => (leadDays + index) / TRADING_DAYS);
  // Covariance of each log fixing with log G, and the variance of log G, per unit of variance rate.
  const withAverage = times.map((time) => times.reduce((sum, other) => sum + Math.min(time, other), 0) / fixings);
  const ofAverage = withAverage.reduce((sum, value) => sum + value, 0) / fixings;
  const meanTime = times.reduce((sum, time) => sum + time, 0) / fixings;
  // A/G is the mean of n lognormal ratios S_i/G, and exp(exponent[i]) is the expectation of the i-th.
  const exponent = withAverage.map((value) => variance * ((meanTime + ofAverage) / 2 - value));
  let first = 0;
  let second = 0;
  for (let i = 0; i < fixings; i += 1) {
    first += Math.expm1(exponent[i]);
    for (let j = 0; j < fixings; j += 1) {
      const covariance = variance * (Math.min(times[i], times[j]) - withAverage[i] - withAverage[j] + ofAverage);
      second += Math.expm1(exponent[i] + exponent[j] + covariance) - Math.expm1(exponent[i]) - Math.expm1(exponent[j]);
    }
  }
  const excess = first / fixings;
  const squaredExcess = second / fixings ** 2;
  const sigma = Math.sqrt((variance * leadDays) / TRADING_DAYS);
  return (Math.log1p(excess) - excess + squaredExcess / 2) / (sigma * Math.sqrt(2 * Math.PI));
}

/** The cubic law (4.4): the leading term of the bound under continuous monitoring. */
export function cubicLaw(leadDays: number, fixings: number, variance: number) {
  const window = (fixings - 1) / TRADING_DAYS;
  return (variance ** 1.5 * window ** 2) / (360 * Math.sqrt((2 * Math.PI * leadDays) / TRADING_DAYS));
}
