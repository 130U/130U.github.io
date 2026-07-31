# Repository structure

This site keeps content, presentation, assets, validation, and deployment
responsibilities separate while retaining the conventions expected by Next.js
and Vinext.

## Directory responsibilities

### `app/`

Application routes and shared interface code.

- `components/` contains site-wide components.
- `lib/` contains data parsing and route-independent application logic.
- Route folders such as `education/`, `now/`, `past-experience/`, and
  `personal-posts/` mirror the public URLs.
- `globals.css` owns the design tokens, typography, responsive layout, and
  interaction states.

### `content/`

Source material that should remain readable without the interface.

- `past-experience/` preserves the complete archive used to render the five
  historical domain pages.

### `public/assets/`

Static files grouped by their role rather than mixed at the public root.

- `brand/` contains browser icons, the monogram, and social preview art.
- `fonts/` contains the two self-hosted variable fonts.
- `posts/` contains diagrams and other post-specific media.
- `profile/` contains the sidebar portrait.

### `config/`

Tool configuration that does not need to sit at the repository root.

- `eslint.config.mjs` defines code-quality rules used by `npm run lint`.
- `postcss.config.mjs` provides the stylesheet transformation pipeline loaded
  explicitly by Vite.

### `docs/`

Repository architecture and editorial workflow documentation.

### `scripts/`

Build-adjacent utilities. `export-static.mjs` renders every public route and
packages the deployable GitHub Pages artifact. `preview-static.mjs` serves that
exact artifact for final visual review.

### `tests/`

Rendered HTML, content preservation, asset existence, accessibility, motion,
and design-system invariants.

### `worker/`

The minimal Cloudflare-compatible Vinext runtime entry required for the
production build.

## Why configuration remains at the root

Only files that must be discovered at the repository root remain there:

- `package.json` and `package-lock.json` define the npm project and its exact
  dependency graph.
- `tsconfig.json` is discovered by TypeScript and the Next-compatible toolchain.
- `vite.config.ts` is the Vinext build entry used locally and in GitHub Actions.
- `.gitignore` controls repository-wide generated-file exclusions.
- `README.md` is GitHub's repository introduction.

Empty or unused root configuration is removed. Configuration that supports an
explicit command, rather than automatic root discovery, belongs in `config/`.

## Maintenance rules

1. Keep page copy in its route unless it is a shared source record.
2. Place new media under the matching `public/assets/` category.
3. Add every public route to the static exporter and rendered-route tests.
4. Run `npm run check`, `npm run export:static`, and `npm run preview:static`
   before publishing.
5. Do not commit generated directories such as `dist/`, `.vinext/`,
   `github-pages/`, or `node_modules/`.
