# Repository Structure

The repository separates public routes, structured content, presentation,
source assets, validation, documentation, and deployment while keeping the
official Next.js conventions discoverable.

## Directory responsibilities

### `app/`

Next.js App Router routes and shared interface code.

- `components/` contains the site shell and the isolated Home particle system.
- `lib/content/` contains typed parsing, canonical routes, and site metadata helpers.
- Static page folders contain bespoke page copy.
- The Past Experience `[slug]` route renders its registered collection.
- `globals.css` owns design tokens, typography, responsive layout, and interaction states.

### `content/`

Durable source records that remain readable without React. The Past Experience
archive is preserved byte-for-byte and parsed only during the static build.

### `public/assets/`

Original and optimized identity assets grouped by role.
`scripts/optimize-images.mjs` produces deterministic, reviewable derivatives
without replacing the source.

### `config/`

ESLint configuration. PostCSS remains at the root because Next.js discovers it
there automatically.

### `scripts/`

`preview-static.mjs` serves the exact `out/` artifact locally.
`optimize-images.mjs` regenerates responsive image derivatives.
`check-protected-sources.mjs` enforces protected-source immutability.

### `tests/`

Final-artifact integrity tests verify the exact nine-route manifest, internal
links, SEO files, protected source hashes, approved structural counts, particle
fallback semantics, and removal of retired content.

### `website-maintenance/`

Human- and AI-readable operating documentation.

### `.github/`

Pull-request validation and main-only GitHub Pages deployment.

## Root discovery files

- `package.json` and `package-lock.json` define the reproducible npm project.
- `next.config.ts` enables the official static export and trailing slashes.
- `postcss.config.mjs` is discovered by Next.js.
- `tsconfig.json` configures TypeScript.
- `.gitignore` excludes generated artifacts and local state.
- `README.md` is the public repository introduction.

## Maintenance rules

1. Do not modify Education, Past Experience, or Current Chapter source text.
2. Add repeatable experience content through its registry; do not clone route wrappers.
3. Keep one canonical slug/path definition per collection.
4. Preserve original identity assets and generate derivatives through the script.
5. Keep decorative client code isolated so every page remains statically readable.
6. Do not add a database, API layer, CMS, client store, or server runtime without a concrete requirement.
7. Run `npm.cmd run check` before publishing.
8. Review the final `out/` artifact locally at desktop and narrow mobile widths.
9. Never commit `node_modules/`, `.next/`, `out/`, `.npm-cache/`, or `*.tsbuildinfo`.
