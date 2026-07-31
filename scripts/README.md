# Build and Preview Utilities

- `export-static.mjs` renders all 11 public routes into the ignored
  `github-pages/` deployment artifact.
- `preview-static.mjs` serves that exact artifact for final review.

Whenever a public route is added, update `export-static.mjs` and the rendered
route tests together.
