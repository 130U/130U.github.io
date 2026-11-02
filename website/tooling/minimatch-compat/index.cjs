"use strict";

// The legacy ESLint consumers load this synchronous CommonJS entry point.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const engine = require("minimatch-engine");

// Every match uses the maintained, nonrecursive v11 engine. The old lint
// packages additionally expect a callable CommonJS export and makeRe().test().
function createCompatibility(defaultOptions = {}) {
  const optionsFor = (options) => ({ ...defaultOptions, ...options });

  function Minimatch(pattern, options) {
    if (!new.target) return new Minimatch(pattern, options);
    return Reflect.construct(engine.Minimatch, [pattern, optionsFor(options)], new.target);
  }
  Object.setPrototypeOf(Minimatch, engine.Minimatch);
  Minimatch.prototype = Object.create(engine.Minimatch.prototype, {
    constructor: { value: Minimatch, writable: true, configurable: true },
    makeRe: {
      value() {
        // eslint-plugin-import only calls .test(). Returning a matcher avoids
        // rebuilding the backtracking regular expressions removed upstream.
        return Object.freeze({ test: (value) => this.match(value) });
      },
      writable: true,
      configurable: true,
    },
  });
  Minimatch.GLOBSTAR = engine.GLOBSTAR;
  Minimatch.defaults = (options) => minimatch.defaults(options).Minimatch;

  function minimatch(path, pattern, options) {
    return new Minimatch(pattern, options).match(path);
  }

  Object.assign(minimatch, {
    minimatch,
    Minimatch,
    GLOBSTAR: engine.GLOBSTAR,
    sep: engine.sep,
    escape: (value, options) => engine.escape(value, optionsFor(options)),
    unescape: (value, options) => engine.unescape(value, optionsFor(options)),
    braceExpand: (pattern, options) => engine.braceExpand(pattern, optionsFor(options)),
    filter: (pattern, options) => (path) => minimatch(path, pattern, options),
    makeRe: (pattern, options) => new Minimatch(pattern, options).makeRe(),
    match(paths, pattern, options) {
      const matcher = new Minimatch(pattern, options);
      const matches = paths.filter((path) => matcher.match(path));
      if (matcher.options.nonull && matches.length === 0) matches.push(pattern);
      return matches;
    },
    defaults(options) {
      if (!options || typeof options !== "object" || Object.keys(options).length === 0) {
        return minimatch;
      }
      return createCompatibility(optionsFor(options));
    },
  });

  return minimatch;
}

module.exports = createCompatibility();
