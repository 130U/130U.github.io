# Page and File Map

Use this map to locate public pages without searching the repository.

## Public pages

| Public page | URL | Primary source |
|---|---|---|
| Home — particle stage and profile | `/` | `app/page.tsx`, `app/home.module.css`, and `app/components/particle-background/` |
| Education | `/education/` | `app/education/page.tsx` |
| Past Experience directory | `/past-experience/` | `app/past-experience/page.tsx` |
| All five Past Experience domains | `/past-experience/<slug>/` | `app/lib/content/experience.ts`, `content/past-experience/archive-through-2026-06-30.md`, and `app/past-experience/[slug]/page.tsx` |
| Current Chapter | `/now/` | `app/now/page.tsx` |

## Shared presentation and discovery

| Responsibility | Source |
|---|---|
| Page shell, sidebar, navigation, footer | `app/components/SiteShell.tsx` |
| Home particle engine and fallback | `app/components/particle-background/` |
| Typography, layout, responsive rules, motion | `app/globals.css` |
| Global metadata and Person JSON-LD | `app/layout.tsx` |
| Navigation, site constants, metadata helper | `app/lib/content/site.ts` |
| Canonical public route list | `app/lib/content/routes.ts` |
| Experience renderer | `app/past-experience/components/ExperienceDomainPage.tsx` |
| Robots, sitemap, and 404 | `app/robots.ts`, `app/sitemap.ts`, `app/not-found.tsx` |

## Source records and assets

| Material | Source |
|---|---|
| Exact Past Experience archive | `content/past-experience/archive-through-2026-06-30.md` |
| Strict archive parser and domain registry | `app/lib/content/experience.ts` |
| Profile source and derivatives | `public/assets/profile/` |
| Brand, browser icons, and OG source/derivative | `public/assets/brand/` |
| Self-hosted fonts | `public/assets/fonts/` |

## Route conventions

`Current Chapter` remains at `/now/` to preserve inbound links. The Past
Experience `[slug]` route is a framework convention: its validated registry
determines which slugs are statically generated, and `dynamicParams = false`
prevents undocumented pages from appearing at runtime.
