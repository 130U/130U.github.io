# Website Maintenance — Start Here

This directory is the maintenance entry point for Theodore Ouyang's personal
website. It is written for Theodore, future collaborators, and AI coding
assistants.

## Non-negotiable guardrail

The current public copy is protected by a committed rendered-site baseline. New
content may be added, but existing wording, headings, links, accessible labels,
deep-link IDs, dates, and image alternatives must not be deleted or silently
rewritten unless Theodore explicitly approves that copy change.

The visual system is intentionally restrained. Preserve its typography,
material hierarchy, responsive behavior, reduced-motion support, and immediate
pointer feedback unless a visible redesign is explicitly requested.

## Where to begin

1. Use `01-page-file-map.md` to locate the relevant source and registry.
2. Read `02-repository-structure.md` before moving or adding infrastructure.
3. Follow `03-adding-personal-posts.md` for article work.
4. Follow `04-release-checklist.md` before publishing.
5. Read `05-architecture-decisions.md` before introducing a CMS, API, database,
   client state, or a second repository.
6. Read `06-public-assets.md` before adding or replacing source media.

## Technology and publishing

- Official Next.js App Router with `output: "export"`.
- React, TypeScript, Tailwind's PostCSS pipeline, and self-hosted fonts.
- Typed registries generate repeatable routes, index entries, canonicals, and sitemap URLs.
- `main` is the published branch.
- Pull requests validate only; pushes to `main` and manual reruns from `main`
  validate, upload, and deploy to GitHub Pages. Other refs cannot deploy.
- Generated `.next/` and `out/` directories are excluded from Git.

## Safe maintenance principle

Prefer standard framework conventions, a single source of truth, strict build
validation, and static output. Add operational complexity only when a concrete
product requirement justifies it.
