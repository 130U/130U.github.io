# Application Routes

This directory uses the official Next.js App Router. Static pages keep their
bespoke copy beside their markup; the repeatable Past Experience collection is
driven by a typed, validated registry.

Key routes:

- `page.tsx` — Home, including the progressively enhanced particle backdrop.
- `education/page.tsx` — Education.
- `past-experience/page.tsx` — Past Experience directory.
- `past-experience/[slug]/page.tsx` — all five experience domain pages.
- `now/page.tsx` — Current Chapter at `/now/`.

Shared responsibilities:

- `components/SiteShell.tsx` — navigation, profile sidebar, footer, and skip link.
- `components/particle-background/` — persistent Three.js narrative/ambient
  visual layer, static fallback, reduced-motion behavior, and lifecycle cleanup.
- `globals.css` — visual system and responsive behavior.
- `layout.tsx` — global metadata, icons, and Person structured data.
- `lib/content/site.ts` — site constants, navigation, and metadata helper.
- `lib/content/experience.ts` — strict archive parser and experience registry.
- `lib/content/routes.ts` — canonical public routes used by the sitemap.
- `robots.ts`, `sitemap.ts`, and `not-found.tsx` — static discovery and failure pages.

See `website-maintenance/01-page-file-map.md` for the complete source map.
