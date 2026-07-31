# Repository Structure

This site keeps content, presentation, assets, validation, and deployment
responsibilities separate while retaining the conventions expected by Next.js
and Vinext.

## Directory responsibilities

### `app/`

Public routes and shared interface code. The `page.tsx` name is required by the
Next-compatible router; the surrounding directory determines the public URL.

- `components/` contains site-wide components.
- `lib/` contains data parsing and route-independent application logic.
- Route folders such as `education/`, `now/`, `past-experience/`, and
  `personal-posts/` mirror the public URLs.
- `globals.css` owns the design tokens, typography, responsive layout, and
  interaction states.
- `README.md` provides a quick route map for maintainers.

### `content/`

Source material that should remain readable without the interface.

- `past-experience/` preserves the complete archive used to render the five
  historical domain pages.
- `README.md` explains which content is archival and which content currently
  lives with its page component.

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

### `website-maintenance/`

The human- and AI-readable maintenance entry point: page map, repository map,
Personal Posts workflow, and release checklist.

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

### `.github/`

GitHub Pages automation. `workflows/pages.yml` validates, exports, and deploys
the site whenever `main` changes.

## Why six files remain at the root

Only files that must be discovered at the repository root remain there:

- `package.json` and `package-lock.json` define the npm project and its exact
  dependency graph.
- `tsconfig.json` is discovered by TypeScript and the Next-compatible toolchain.
- `vite.config.ts` is the Vinext build entry used locally and in GitHub Actions.
- `.gitignore` controls repository-wide generated-file exclusions.
- `README.md` is GitHub's repository introduction.

These are not unfiled documents. Their root placement is part of the contract
used by GitHub, npm, TypeScript, Vite, and Vinext. Moving them would require
custom flags, weaken tool discovery, or break reproducible installation.

Empty or unused root configuration has been removed. Configuration that
supports an explicit command, rather than automatic root discovery, belongs in
`config/`.

## Maintenance rules

1. Start with `website-maintenance/01-page-file-map.md` before editing.
2. Keep page copy in its route unless it becomes a shared or structured source.
3. Do not rename `page.tsx`; it is a router convention, not a vague filename.
4. Preserve `/now/` as the URL for Current Chapter unless redirects and inbound
   links are intentionally migrated.
5. Place new media under the matching `public/assets/` category.
6. Add every public route to the static exporter and rendered-route tests.
7. Run `npm run check` and `npm run export:static` before publishing.
8. Do not commit generated directories such as `dist/`, `.vinext/`,
   `github-pages/`, or `node_modules/`.
