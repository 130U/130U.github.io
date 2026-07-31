# Release Checklist

Use this checklist for every repository maintenance or website update.

## Before editing

- Read `01-page-file-map.md`.
- Confirm copy/design authorization and protected scope.
- Run `git status --short --branch`.
- Preserve unrelated user changes and original text-bearing assets.

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

- all current routes plus 404, robots, and sitemap export, with the HTML route manifest matching the sitemap exactly;
- every frozen or append-only word token, heading, link target, accessible label/reference, deep-link ID, date, and image alternative remains;
- the five domains, 16 entries, 92 bullets, 31 courses, 10 article sections, and five primary sources remain;
- internal links and responsive image sources resolve;
- source archive and original artwork hashes remain unchanged;
- no legacy Vinext/Vite-RSC/Wrangler runtime marker is reintroduced.

Review `out/` with the in-app browser at desktop, 720 px, 390 px, and 320 px.
Check keyboard skip navigation, focus, mobile nav wrapping, diagram legibility,
reduced motion, reduced transparency, and high contrast.

## Pull request and publishing

- Commit only intended source, tests, assets, and documentation.
- Never commit generated or local-state directories.
- Push a `codex/` branch and open a pull request against `main`.
- Require the pull-request build to pass before merge.
- Confirm the preservation-fixture gate reports additions only; it protects the
  frozen baselines and append-only published-copy snapshots on PRs and pushes.
- GitHub Pages deploys only after the validated change reaches `main`.
- After deployment, verify `https://www.theodoreoy.com/`, one dynamic experience route, one article route, `/robots.txt`, and `/sitemap.xml`.
