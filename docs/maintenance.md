# Maintenance

The site is a static personal record published at [theodoreoy.com](https://www.theodoreoy.com/).

## Repository

| Directory | Responsibility |
| --- | --- |
| `.github/` | Repository presentation and the Pages workflow |
| `architecture/` | Interactive system map and its editable specification |
| `docs/` | Design principles and maintenance guidance |
| `website/` | Application, content, assets, tools, and tests |

Run application commands from `website/`, or use `npm --prefix website run <command>`
from the repository root. Generated files remain inside the ignored `website/out/`
and `website/.next/` directories. Keep local screenshots and audit logs outside the repository.

## Routes and content

Paths in this table are relative to `website/`.

| Page | Route | Source |
| --- | --- | --- |
| Home | `/` | `app/page.tsx`, `app/home.module.css` |
| Education | `/education/` | `app/education/page.tsx` |
| Past Experience | `/past-experience/` | `app/past-experience/page.tsx` |
| Experience details | `/past-experience/[slug]/` | `app/lib/content/experience.ts`, `content/past-experience/` |
| Current Chapter | `/now/` | `app/now/page.tsx` |
| Architecture | `/architecture/` | `../architecture/index.html` |

`content/past-experience/experience.md` contains the current experience record.
Use domain, organization, project, and optional subsection headings, followed by
plain-text bullets. Each organization requires Position, Location, and Dates.
Separate a project's title and optional supporting context with a spaced em dash.
The detail renderer omits the separator and displays supporting context in italics.
The experience registry validates five domains and their Markdown entries during
build. `app/lib/content/routes.ts` supplies the website sitemap. The architecture
viewer is a separate repository reference, linked from the GitHub introduction.

Seven biographical source files are checked against `content/protected-sources.json`.
`content/visible-copy-manifest.json` independently records text, metadata, alt text,
and ARIA labels for all nine website pages. Copy changes require the owner's explicit
request and an intentional update to these contracts. Presentation-only changes to
a protected component update its source hash while preserving the visible-copy
manifest. Tests also verify page counts and navigation independently of the registry.

## Application

Next.js exports static HTML, CSS, and JavaScript. GitHub Pages serves these files;
there is no request-time backend, database, authentication, form submission, or analytics.

- `app/components/SiteShell.tsx` owns the shared reading frame.
- `app/components/SiteNavigation.tsx` owns the mobile menu and focus handling.
- `app/components/dithered-entrance/` owns the Home Canvas2D wordmark and static fallback.
- `app/globals.css` and `app/home.module.css` implement the [design system](design.md).
- `app/lib/content/site.ts` owns site identity and metadata helpers.

Add a website page by updating its source, the route registry, sitemap expectations,
and output tests together. Keep browser interaction in focused client components.
Add a server only when a defined product requirement needs one.

## Brand assets

`website/source-assets/brand/lo-mark.svg` is the editable LO master.
`npm run generate:brand-icons` creates its public SVG, favicon, and Apple touch derivatives.
`website/source-assets/brand/og.png` is the social-preview master;
`npm run optimize:images` creates `public/assets/brand/og-1774.jpg`.
`.github/assets/readme-cover.jpg` is the repository cover.

Editable masters and served derivatives have separate roles. Only assets needed by
visitors belong in `website/public/`.

## Typography assets

`website/public/assets/fonts/` contains the unmodified Inter 4.1 variable WOFF2
files, their SIL Open Font License, and the shared font stylesheet. The source is
the [official Inter 4.1 release](https://github.com/rsms/inter/releases/tag/v4.1).
The site layout and architecture viewer load this same stylesheet and regular-face
preload. Keep text in the inherited font; reserve separate lettering for brand artwork.

## Validation and publishing

```sh
cd website
npm ci --ignore-scripts
npm run check
npm run typecheck
npm audit --audit-level=low
npm run preview:static
```

Review the export at desktop and phone widths, including 320px. Check keyboard
navigation, menu dismissal and resizing, reduced motion, the JavaScript-free fallback,
local links, and the architecture viewer. Run `git diff --check` and inspect staged
files for credentials, temporary files, and generated build output.

The SHA-pinned GitHub Actions workflow validates pull requests. A push to `main`
validates, audits dependencies, and uploads `website/out/` to GitHub Pages. Build jobs
have read-only repository access; only deployment receives Pages write and OIDC access.
After publishing, verify the workflow for the exact commit and the live domain separately.

The build computes SHA-256 permissions for the exact inline scripts in each exported
HTML page, including the architecture viewer. The policy appears before scripts and
blocks arbitrary inline scripts, evaluation, frames, objects, and form submission.
Fonts load from the site's own origin. Inline event handlers are blocked on every
page. Inline styles support the canvas and viewer.
GitHub Pages controls HTTP response headers; the HTML policy is not a substitute for
host-level controls. Dependency audit results describe the advisories available at
run time and do not prove the absence of vulnerabilities.

See [architecture](../architecture/README.md) for viewer editing and validation.
