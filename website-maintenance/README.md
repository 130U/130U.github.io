# Website Maintenance — Start Here

This directory is the maintenance entry point for Theodore Ouyang's personal
website. It is written for Theodore, future collaborators, and AI coding
assistants.

## Non-negotiable guardrail

The current public copy, visual design, typography, layout, and interaction
behavior are approved. Repository-only maintenance must not alter them unless
Theodore explicitly requests a visible change.

## Where to begin

1. Open [`01-page-file-map.md`](01-page-file-map.md) to find the exact source
   file for every public page.
2. Open [`02-repository-structure.md`](02-repository-structure.md) to understand
   each top-level directory and why six files remain at the root.
3. Open [`03-adding-personal-posts.md`](03-adding-personal-posts.md) before
   publishing or scaling Personal Posts.
4. Follow [`04-release-checklist.md`](04-release-checklist.md) before changing
   `main`.

## Technology and publishing

- The site uses React, a Next-compatible `app/` router, Vinext, and Vite.
- `main` is the published branch.
- `.github/workflows/pages.yml` validates and deploys the static export to
  GitHub Pages.
- Generated output is intentionally excluded from Git.

## Safe maintenance principle

Prefer a documented, conventional structure over clever renaming. Names such as
`app`, `public`, `package.json`, `tsconfig.json`, and `vite.config.ts` are
recognized entry points for the tools used by this project.
