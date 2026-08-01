# Source Content

This directory contains source records that must remain readable independently
of the interface.

- `past-experience/archive-through-2026-06-30.md` is the immutable archive
  parsed across the five Past Experience domain pages.
- The parser rejects unknown or duplicate metadata, missing required fields,
  empty entries, and registry/archive drift during the build.

Current Chapter keeps its copy beside its bespoke page markup. Personal Post
metadata is centralized in `app/lib/content/posts.ts`, while long-form article
bodies remain in `app/personal-posts/_articles/`.
