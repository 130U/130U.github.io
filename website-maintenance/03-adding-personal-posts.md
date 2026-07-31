# Adding and Scaling Personal Posts

## Current workflow

1. Add one metadata entry to `app/lib/content/posts.ts`.
2. Add the bespoke article body under `app/personal-posts/_articles/`.
3. Register that component in the dispatch map in `app/personal-posts/[slug]/page.tsx`.
4. Put source media in `public/assets/posts/`; add responsive derivatives through `scripts/optimize-images.mjs`.
5. After building, add `tests/fixtures/published-copy/<slug>.json` from the reviewed export, following that directory's README; CI keeps these plaintext snapshots append-only while the original 11-route fixtures remain unchanged.
6. Run the release checklist; it discovers the new route automatically by comparing the sitemap with every exported HTML page.

The registry is the single source for index copy, title, description, canonical
path, publication date, reading time, social image, static params, and sitemap
path. The build rejects duplicate slugs and slug/path mismatches.
The component dispatch map is compile-time exhaustive, so a registry entry
without an article component fails type checking before the production build.

## When to adopt MDX

The current component-per-essay body is appropriate while posts have bespoke
editorial structures. Introduce local MDX only when repeated article markup is
causing measurable maintenance cost—typically several posts per month with a
stable component vocabulary.

A future migration can keep the current registry contract and move bodies to:

```text
content/
  personal-posts/
    2026/
      07/
        from-vision-and-instructions-to-robot-actions.mdx
```

MDX front matter should be schema-validated and feed the same index, metadata,
static params, sitemap, and integrity checks.

## When a CMS or second repository is justified

Keep one repository until at least one requirement is real:

- non-developers need browser-based authoring;
- writing and code require different access policies;
- multiple products consume the same content library;
- editorial releases need an independent review/deploy cycle;
- media volume needs specialized storage.

Otherwise a CMS or second repository adds synchronization, authentication,
preview, webhook, and failure-mode complexity without improving this site.
