# Static export integrity tests

`rendered-html.test.mjs` audits the final official Next.js static export in
`out/`. It does not import application registries, so a broken registry cannot
rewrite its own expected route manifest.

The suite verifies:

- the exact nine-route HTML manifest, canonicals, Open Graph URLs, robots, sitemap, and 404;
- consistent four-item primary navigation and local runtime assets;
- protected Education, Past Experience, and Current Chapter source hashes plus
  their approved counts;
- Home and Current Chapter copy, semantic fallback, and dither-system guardrails;
- the approved runtime-asset manifest and repository deployment policy.

`npm test` always rebuilds first, preventing a stale `out/` directory from
producing a false pass. Use `test:artifact` only when the export was built in the
same validation run:

```powershell
npm.cmd test
# Or, after npm.cmd run build:
npm.cmd run test:artifact
```

`npm run check:visible-copy` separately compares every public route against the
approved text, metadata, alt-text, and ARIA-label manifest. `Menu` and `Close`
are the only permitted new visible interface strings.
