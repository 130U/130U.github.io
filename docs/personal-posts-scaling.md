# Scaling Personal Posts

The current implementation is appropriate for a small number of carefully
designed essays, but one route file per article will become inefficient at a
cadence of three or more posts each week.

## Recommended next step

Keep posts in this repository and move to a content-first structure:

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

## Why not create a second repository yet

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
