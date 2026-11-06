# minimatch compatibility for lint dependencies

This private package supplies the callable CommonJS/default export used by the
installed ESLint plugins while delegating all matching to the official
`minimatch@11.0.1` package. The dependency has an explicit alias so the root
`minimatch` override cannot replace the engine with this adapter recursively.
The package has no installation scripts and bundles no other matching engine.

Both CommonJS and ESM expose the v11 named API. Callable constructors,
static helpers, and chained `defaults()` retain the same option precedence.
The `GLOBSTAR` symbol is the engine's symbol, including for consumers such as glob.

The installed `eslint-plugin-import` uses `makeRe(pattern)` only by calling
`.test(path)` on the result. This adapter implements that specific interface
with the v11 matcher. It does **not** return a JavaScript `RegExp` or support
its `.source`, `.exec()`, or string replacement interfaces. The upstream v11
engine does not generate regular expressions or expose `AST` and several internal
methods; this adapter does not add them and matches only with the v11 engine.

Security references:

- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/isaacs/minimatch/blob/v11.0.1/changelog.md
- https://github.com/isaacs/minimatch/commit/77a0f5c

Remove this adapter once the installed lint dependencies call the v11 named API
without `makeRe().test()`.
