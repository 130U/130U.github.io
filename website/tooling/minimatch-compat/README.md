# minimatch compatibility for lint dependencies

This private package supplies the callable CommonJS/default export used by the
installed ESLint plugins while delegating all matching to the official
`minimatch@11.0.1` package. The dependency has an explicit alias so the root
`minimatch` override cannot replace the engine with this adapter recursively.
The package has no installation scripts and contains no older matching engine.

Both CommonJS and ESM expose the v11 named API. Legacy callable constructors,
static helpers, and chained `defaults()` retain the same option precedence.
The `GLOBSTAR` symbol is the engine's symbol, including for consumers such as glob.

The installed `eslint-plugin-import` uses `makeRe(pattern)` only by calling
`.test(path)` on the result. This adapter implements that specific interface
with the v11 matcher. It does **not** return a JavaScript `RegExp` or support
its `.source`, `.exec()`, or string replacement interfaces. The upstream v11
engine removed regular expression generation, `AST`, and several internal
methods. This adapter does not restore those internals or promise identical
behavior for all patterns supported by older major versions.

Security references:

- https://github.com/advisories/GHSA-g3hv-75wg-m249
- https://github.com/isaacs/minimatch/blob/v11.0.1/changelog.md
- https://github.com/isaacs/minimatch/commit/77a0f5c

Remove this adapter when the installed lint dependencies support the maintained
named API and no longer need `makeRe().test()`.
