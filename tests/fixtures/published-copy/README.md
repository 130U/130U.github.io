# Append-only published copy

Add one JSON file when a route is first published after the frozen 11-route
baseline. Existing JSON files must never be modified, deleted, or renamed; CI
enforces additions-only changes against the pull request base commit.

Each snapshot records the route, normalized visible `<main>` text, title,
description, headings, links, images, IDs, times, and `aria-label` /
`aria-labelledby` attributes. The artifact test requires every route outside
the original baseline to have exactly one snapshot and treats the recorded
content and structure as an ordered subsequence of future exports.

Use this shape:

```json
{
  "schemaVersion": 1,
  "route": "/personal-posts/example/",
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
and inspect the new plaintext fixture in the same pull request. The original
`content-baseline.json` and `accessible-label-baseline.json` remain unchanged.
