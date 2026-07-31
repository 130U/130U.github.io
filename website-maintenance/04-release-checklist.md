# Release Checklist

Use this checklist for every repository maintenance or website update.

## Before editing

- Read `01-page-file-map.md`.
- Confirm whether the request permits visible copy or design changes.
- Run `git status --short --branch`.
- Preserve unrelated user changes.

## Validation

Run:

```powershell
npm.cmd run check
npm.cmd run export:static
```

The checks must confirm:

- all 11 public routes render;
- the 92 archived Past Experience bullets remain exact;
- Current Chapter and Personal Posts retain their approved copy;
- required images and browser icons exist;
- motion and accessibility invariants remain intact;
- no unused backend scaffold is reintroduced.

For a repository-only reorganization, compare the exported HTML and CSS with
the pre-change export. User-visible output should remain unchanged.

## Publishing

- Commit only intended source and documentation files.
- Never commit `dist/`, `.vinext/`, `.wrangler/`, `github-pages/`,
  `node_modules/`, or `.npm-cache/`.
- Publish to `main` only after local validation passes.
- Verify the GitHub Pages workflow succeeds.
- Confirm the remote repository contains only intentional branches.
