# Release Checklist

Use this checklist for every repository maintenance or website update.

## Before editing

- Read `01-page-file-map.md`.
- Confirm copy/design authorization and protected scope.
- Run `git status --short --branch`.
- Preserve unrelated user changes and protected source files.

## Local validation

```powershell
$env:npm_config_cache = Join-Path (Get-Location) '.npm-cache'
npm.cmd ci --ignore-scripts
npm.cmd run check
npm.cmd audit --omit=dev
npm.cmd run preview:static
```

`check` runs lint, TypeScript, one production build, and final-artifact tests.
Confirm:

- exactly nine HTML routes plus 404, robots, and sitemap export;
- the HTML route manifest and sitemap match exactly;
- the four-item primary navigation appears consistently and has no retired route;
- the five Past Experience domains, 16 entries, 92 bullets, and 31 courses remain;
- protected Education and Past Experience source hashes remain unchanged;
- internal links and responsive image sources resolve;
- the Home canvas is decorative, the fallback is readable, and reduced motion is calm;
- no retired route, asset directory, copy, or legacy runtime marker appears in `out/`.

Review `out/` with the in-app browser at 1440 × 900, 720 px, 390 × 844,
and 320 px. Check keyboard skip navigation, focus, mobile nav wrapping, text
legibility over particles, pointer response on fine pointers, reduced motion,
WebGL fallback, reduced transparency, and high contrast.

## Pull request and publishing

- Commit only intended source, tests, assets, and documentation.
- Never commit generated or local-state directories.
- Push a `codex/` branch and open a pull request against `main`.
- Require the pull-request build to pass before merge.
- Confirm the preservation gate reports protected sources unchanged and
  published-copy snapshot additions only.
- GitHub Pages deploys only after the validated change reaches `main`.
- After deployment, verify the Home page, one dynamic experience route,
  `/robots.txt`, and `/sitemap.xml`.
