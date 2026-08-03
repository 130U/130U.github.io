# Append-only published copy

Add one JSON file when a new route is first published. Existing JSON files must
never be modified, deleted, or renamed; CI enforces additions-only changes
against the pull request base commit.

Each snapshot records the route, normalized visible `<main>` text, title,
description, headings, links, images, IDs, times, and `aria-label` /
`aria-labelledby` attributes. The artifact test can require recorded content
and structure to remain an ordered subsequence of future exports.

Use this shape:

```json
{
  "schemaVersion": 1,
  "route": "/future-route/",
  "mainText": "Complete normalized visible main text",
  "title": "Page title",
  "description": "Meta description",
  "headings": [],
  "links": [],
  "images": [],
  "ids": [],
  "times": [],
  "ariaAttributes": []
}
```

Build first, derive the snapshot from the reviewed `out/<route>/index.html`,
and inspect the new plaintext fixture in the same pull request. Education and
Past Experience source files remain independently protected by CI and hashes.
