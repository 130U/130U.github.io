# Build and Preview Utilities

- `next build` renders every registered static route into Next.js's ignored
  `out/` deployment artifact.
- `preview-static.mjs` serves that exact artifact for final review, including
  the exported `404.html` response.
- `optimize-images.mjs` creates reproducible web derivatives while preserving
  the original image files.

Whenever a public route is added, update the route registry, sitemap
expectations, and final-artifact tests in the same change.
