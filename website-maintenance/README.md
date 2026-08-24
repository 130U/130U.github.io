# Website Maintenance

This is the authoritative maintainer guide for Theodore Ouyang's personal site.
It describes the current production system, not the redesign process that led
to it.

## Product boundary

The site is a static personal record with four primary routes:

| Page | Route | Primary source |
| --- | --- | --- |
| Home | `/` | `app/page.tsx`, `app/home.module.css` |
| Education | `/education/` | `app/education/page.tsx` |
| Past Experience | `/past-experience/` | `app/past-experience/`, `app/lib/content/experience.ts` |
| Current Chapter | `/now/` | `app/now/page.tsx` |

Five Past Experience domain routes are generated from the validated registry
and `content/past-experience/archive-through-2026-06-30.md`. `app/sitemap.ts`
and `app/lib/content/routes.ts` derive from the same route sources.

## Architecture

- Next.js App Router with `output: "export"` and trailing slashes.
- React Server Components for static pages; client code is isolated to the
  navigation menu and Home dither interaction.
- Native CSS and CSS Modules. There is no UI framework or runtime styling
  dependency.
- Canvas2D for the Home-only dithered wordmark. It uses typed arrays, a capped
  device-pixel ratio, `ResizeObserver`, Pointer Events, reduced-motion support,
  and a requestAnimationFrame loop that stops at rest.
- GitHub Pages serves immutable HTML, CSS, JavaScript, icons, and the social
  preview. There is no API, database, authentication, form submission, Server
  Action, middleware, CMS, analytics runtime, or request-time data fetch.

Do not add backend or client-state infrastructure until a concrete product
requirement cannot be met by this static architecture.

## Design system

`DESIGN.md` is the visual source of truth. The north star is Quiet Technical
Authority: one expressive identity entrance followed by a warm-white editorial
shell with a 3/12 desktop rail, hairline rules, restrained sans/serif type, and
rare signal blue.

Keep the body calm. Do not add cards, glass, shadows, ambient particles, scroll
reveals, parallax, GSAP storytelling, a custom cursor, or decorative interface
copy. The Home entrance is the only authored spectacle.

## Code map

| Responsibility | Source |
| --- | --- |
| Shared shell and footer | `app/components/SiteShell.tsx` |
| Navigation and mobile focus handling | `app/components/SiteNavigation.tsx` |
| Home dither renderer and physics | `app/components/dithered-entrance/` |
| Global tokens, layout, and responsive rules | `app/globals.css` |
| Site constants and metadata helper | `app/lib/content/site.ts` |
| Experience parser and registry | `app/lib/content/experience.ts` |
| Content preservation | `scripts/check-protected-sources.mjs` |
| Rendered-copy preservation | `scripts/verify-visible-copy.mjs` |
| Final-artifact and policy checks | `tests/` |
| Pages build and deployment | `.github/workflows/pages.yml` |

## Content protection

Education, Past Experience, and Current Chapter source files are protected.
Their normalized source hashes and rendered output are verified in tests. Any
future copy revision needs explicit approval, updated hashes, a refreshed copy
manifest, and a release note explaining the change.

Home microcopy may evolve only when the user explicitly requests a brand or
copy revision. Preserve factual claims and do not introduce unsupported titles,
metrics, affiliations, or employer language.

## Assets

Only files required by production belong under `public/assets/`:

- `public/assets/brand/`: browser icons and the social preview derivative.
- `source-assets/brand/og.png`: editable source for the social preview.
- `source-assets/brand/icon-512.png`: editable source for browser icons.
- `.github/assets/readme-cover.png`: current repository cover.

Regenerate the optimized social preview with `npm.cmd run optimize:images`.
Do not retain portraits, fonts, prototypes, or derivatives that the live site
does not reference.

## Release checklist

Record the exact pre-change commit before editing:

```powershell
$env:BASE_SHA = (git rev-parse HEAD).Trim()
git status --short --branch
```

Before publishing, run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:artifact
npm.cmd run check:visible-copy
npm.cmd audit --audit-level=moderate
npm.cmd audit --omit=dev --audit-level=moderate
npm.cmd run check:protected-sources
git diff --check
```

Then inspect the exact `out/` artifact at 1440 × 900, 390 × 844, and
320 × 800. Verify keyboard navigation, the mobile menu, reduced motion, the
Canvas fallback, horizontal overflow, canonical metadata, robots, sitemap, and
one Past Experience domain route.

`main` is the only production branch. Pull requests validate; pushes to `main`
validate and deploy. After publishing, verify the GitHub Actions run and the
live custom domain independently.
