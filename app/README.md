# Application Routes

This directory uses the official Next.js App Router. Static pages keep their
bespoke copy beside their markup; repeatable collections are driven by typed,
validated registries.

Key routes:

- `page.tsx` — Home.
- `education/page.tsx` — Education.
- `past-experience/page.tsx` — Past Experience directory.
- `past-experience/[slug]/page.tsx` — all five experience domain pages.
- `now/page.tsx` — Current Chapter at `/now/`.
- `personal-posts/page.tsx` — Personal Posts index.
- `personal-posts/[slug]/page.tsx` — all article routes.

Shared responsibilities:

- `components/SiteShell.tsx` — navigation, profile sidebar, footer, and skip link.
- `globals.css` — approved visual system and responsive behavior.
- `layout.tsx` — global metadata, icons, and Person structured data.
- `lib/content/site.ts` — site constants, navigation, and metadata helper.
- `lib/content/experience.ts` — strict archive parser and experience registry.
- `lib/content/posts.ts` — article metadata registry.
- `lib/content/routes.ts` — canonical public routes used by the sitemap.
- `robots.ts`, `sitemap.ts`, and `not-found.tsx` — static discovery and failure pages.

See `website-maintenance/01-page-file-map.md` for the complete source map.
