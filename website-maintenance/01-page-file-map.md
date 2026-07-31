# Page and File Map

Use this map to locate public pages without searching the repository.

## Public pages

| Public page | URL | Primary source |
|---|---|---|
| Home — “Quis ego sum?” | `/` | `app/page.tsx` |
| Education | `/education/` | `app/education/page.tsx` |
| Past Experience directory | `/past-experience/` | `app/past-experience/page.tsx` |
| Artificial Intelligence archive | `/past-experience/artificial-intelligence/` | `app/past-experience/artificial-intelligence/page.tsx` |
| Data Science archive | `/past-experience/data-science/` | `app/past-experience/data-science/page.tsx` |
| Environmental, Social, and Governance archive | `/past-experience/environmental-social-and-governance/` | `app/past-experience/environmental-social-and-governance/page.tsx` |
| Finance archive | `/past-experience/finance/` | `app/past-experience/finance/page.tsx` |
| STEM Academic Competitions and Training archive | `/past-experience/stem-academic-competitions-and-training/` | `app/past-experience/stem-academic-competitions-and-training/page.tsx` |
| Current Chapter — “A New Chapter” | `/now/` | `app/now/page.tsx` |
| Personal Posts index | `/personal-posts/` | `app/personal-posts/page.tsx` |
| “From Vision and Instructions to Robot Actions” | `/personal-posts/from-vision-and-instructions-to-robot-actions/` | `app/personal-posts/from-vision-and-instructions-to-robot-actions/page.tsx` |

## Shared presentation

| Responsibility | Source |
|---|---|
| Page shell, sidebar, navigation, footer | `app/components/SiteShell.tsx` |
| Site-wide typography, layout, responsive rules, motion | `app/globals.css` |
| Global metadata and browser icons | `app/layout.tsx` |
| Past Experience route labels | `app/past-experience/domainRoutes.ts` |
| Past Experience rendering component | `app/past-experience/components/ExperienceDomainPage.tsx` |

## Source records and assets

| Material | Source |
|---|---|
| Exact Past Experience archive | `content/past-experience/archive-through-2026-06-30.md` |
| Past Experience parser | `app/lib/pastExperience.ts` |
| Profile portrait | `public/assets/profile/theodore-avatar-warm.png` |
| Brand and browser icons | `public/assets/brand/` |
| Self-hosted fonts | `public/assets/fonts/` |
| Personal Posts diagrams | `public/assets/posts/` |

## Why Current Chapter uses `now`

`Current Chapter` is the public navigation label and page title. Its route
remains `/now/`, so the router directory must remain `app/now/`. Renaming that
directory would change the public URL unless a redirect migration were added.

## Why every route file is called `page.tsx`

`page.tsx` is required by the Next-compatible app router. The directory gives
the page its identity; the filename is intentionally repeated.
