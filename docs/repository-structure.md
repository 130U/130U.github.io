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

The minimal Vinext runtime entry required for the production build.

## Why configuration remains at the root

Files such as `package.json`, `tsconfig.json`, `vite.config.ts`,
`next.config.ts`, and `eslint.config.mjs` are root-level by convention and are
discovered there by their respective tools. Moving them into decorative
folders would make the repository look unusual while adding path overrides and
failure modes.

## Maintenance rules

1. Keep page copy in its route unless it is a shared source record.
2. Place new media under the matching `public/assets/` category.
3. Add every public route to the static exporter and rendered-route tests.
4. Run `npm run check`, `npm run export:static`, and `npm run preview:static`
   before publishing.
5. Do not commit generated directories such as `dist/`, `.vinext/`,
   `github-pages/`, or `node_modules/`.
