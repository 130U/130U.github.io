# Application Routes

This directory contains every public page and the shared site interface.

The router requires the filename `page.tsx`; the directory determines the URL.
For a complete page-to-file index, see:

```text
website-maintenance/01-page-file-map.md
```

Key routes:

- `page.tsx` — Home.
- `education/page.tsx` — Education.
- `past-experience/` — Past Experience directory and five domain pages.
- `now/page.tsx` — Current Chapter at `/now/`.
- `personal-posts/` — Personal Posts index and article pages.

Shared files:

- `components/SiteShell.tsx` — navigation, profile sidebar, and footer.
- `globals.css` — approved visual system and responsive behavior.
- `layout.tsx` — global metadata, fonts, and browser icons.
- `lib/` — source parsing and route-independent logic.
