# Theodore Ouyang

This repository contains the source for [theodoreoy.com](https://www.theodoreoy.com/),
a selective personal archive built around four public sections:

- **Home** — a particle-first opening stage followed by Theodore's profile,
  biography, and contact coordinates.
- **Education** — Theodore's academic record and selected coursework.
- **Past Experience** — a five-domain archive generated from a validated source
  record.
- **Current Chapter** — a concise account of Theodore's exploration of practical
  AI use cases in everyday life.

The Home page gives visual priority to an interactive Three.js particle field.
A same-shape particle fallback makes the first visible frame a stable word;
the canvas then takes over without flashing solid text. The complete identity
and biographical content remains available as static HTML below it.

## Architecture and publishing

The site uses the Next.js App Router, React, and TypeScript, and ships as a
Next.js static export. There is no application server, database, or request-time
API: GitHub Pages serves the generated HTML, CSS, JavaScript, fonts, and images.
Pull requests validate the complete export; pushes to `main` deploy it.

## Development and validation

```sh
npm ci --ignore-scripts
npm run check
npm audit --omit=dev
npm run preview:static
```

`npm run check` runs linting, TypeScript, a production build, and final-artifact
tests. Generated `.next/` and `out/` directories are intentionally not committed.
See [`website-maintenance/`](website-maintenance/) for the source map, design
boundaries, particle-system notes, and release checklist.

## Rollback

Publish changes through a pull request and keep `main` history intact. To undo a
release, create a new `codex/` branch from the current `main`, revert the relevant
merge commit, run the full validation suite, and merge that rollback through a
new pull request. Do not rewrite the published branch.

[Visit the website →](https://www.theodoreoy.com/)
