# Repository Structure

The repository separates public routes, structured content, presentation,
source assets, validation, documentation, and deployment while keeping the
official Next.js conventions discoverable.

## Directory responsibilities

### `app/`

Next.js App Router routes and shared interface code.

- `components/` contains the site shell.
- `lib/content/` contains typed registries, parsing, canonical routes, and site metadata helpers.
- Static page folders contain bespoke page copy.
- Dynamic `[slug]` routes render registered collections.
- `globals.css` owns design tokens, typography, responsive layout, and interaction states.

### `content/`

Durable source records that remain readable without React. The Past Experience
archive is preserved byte-for-byte and parsed only during the static build.

### `public/assets/`

Original and optimized static assets grouped by role. Original text-bearing
artwork is immutable; `scripts/optimize-images.mjs` produces deterministic,
reviewable derivatives without replacing the source.

### `config/`

ESLint configuration. PostCSS remains at the root because Next.js discovers it
there automatically.

### `scripts/`

`preview-static.mjs` serves the exact `out/` artifact locally.
`optimize-images.mjs` regenerates responsive image derivatives.

### `tests/`

Final-artifact integrity tests. The committed fixture is independent of the
current registries, so application drift cannot rewrite its own expected
result. Tests also check links, assets, source hashes, route counts, SEO files,
and removal of legacy runtime markers.

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

1. Preserve public URLs and the committed content baseline.
2. Add repeatable content through its registry; do not clone route wrappers.
3. Keep one canonical slug/path definition per collection.
4. Preserve original assets and generate derivatives through the script.
5. Do not add a database, API layer, CMS, client store, or server runtime without a concrete requirement.
6. Run `npm.cmd run check` before publishing.
7. Review the final `out/` artifact locally at desktop and narrow mobile widths.
8. Never commit `node_modules/`, `.next/`, `out/`, `.npm-cache/`, or `*.tsbuildinfo`.
