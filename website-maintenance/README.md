# Website Maintenance — Start Here

This directory is the maintenance entry point for Theodore Ouyang's personal
website. It is written for Theodore, future collaborators, and AI coding
assistants.

## Non-negotiable guardrail

Education, Past Experience, and Current Chapter source files are protected from
modification. Any other removal or rewrite requires Theodore's explicit
approval and must update routes, tests, and documentation in the same change.

The visual system is intentionally restrained. Preserve its typography,
material hierarchy, responsive behavior, reduced-motion support, and immediate
pointer feedback unless a visible redesign is explicitly requested.

## Where to begin

1. Use `01-page-file-map.md` to locate the relevant source and registry.
2. Read `02-repository-structure.md` before moving or adding infrastructure.
3. Read `03-home-particle-system.md` before changing the Home visual system.
4. Follow `04-release-checklist.md` before publishing.
5. Read `05-architecture-decisions.md` before introducing a CMS, API, database,
   client state, or a second repository.
6. Read `06-public-assets.md` before adding or replacing source media.

## Technology and publishing

- Official Next.js App Router with `output: "export"`.
- React, TypeScript, Tailwind's PostCSS pipeline, Three.js on Home, and self-hosted fonts.
- A typed registry generates repeatable experience routes and sitemap URLs.
- `main` is the published branch.
- Pull requests validate only; pushes to `main` validate, upload, and deploy to
  GitHub Pages. A failed `main` run can be rerun with its original preservation
  guard context; feature refs cannot deploy.
- Generated `.next/` and `out/` directories are excluded from Git.

## Safe maintenance principle

Prefer standard framework conventions, a single source of truth, strict build
validation, and static output. Add operational complexity only when a concrete
product requirement justifies it.
