# Adding and Scaling Personal Posts

## Current implementation

The Personal Posts index is:

```text
app/personal-posts/page.tsx
```

The first article is:

```text
app/personal-posts/from-vision-and-instructions-to-robot-actions/page.tsx
```

Its diagram is:

```text
public/assets/posts/wam-vla-two-paths-en.png
```

The route folder is the public slug. Its required `page.tsx` file contains the
article metadata and rendered article. When adding a post under the current
system:

1. Create `app/personal-posts/<post-slug>/page.tsx`.
2. Add the post to `app/personal-posts/page.tsx`.
3. Put post media in `public/assets/posts/`.
4. Add the public route to `scripts/export-static.mjs`.
5. Add content-preservation assertions to `tests/rendered-html.test.mjs`.
6. Run the release checklist in `04-release-checklist.md`.

## When to introduce a content collection

The current implementation is appropriate for a small number of carefully
designed essays, but one route file per article will become inefficient at a
cadence of three or more posts each week.

At that point, keep posts in this repository and move to a content-first
structure:

```text
content/
  personal-posts/
    2026/
      07/
        from-vision-and-instructions-to-robot-actions.mdx
```

Each post should carry structured metadata such as title, summary, publication
date, reading time, topic, and hero asset. A single dynamic route can then
render every article and generate the index by date and topic.

## Why a second repository is not yet recommended

A separate content repository would introduce synchronization, authentication,
build-trigger, and preview complexity without solving a problem the current
site has encountered. It becomes worthwhile only when at least one of these is
true:

- the writing has a different access policy from the website code;
- several websites or products consume the same post library;
- editorial releases need an independent review and deployment cycle;
- media volume becomes large enough to require separate storage.

Until then, one repository provides atomic previews, simpler links, and a
single version history for copy, design, and deployment.
