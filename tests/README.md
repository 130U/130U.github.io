# Static export integrity tests

`rendered-html.test.mjs` audits the final official Next.js static export in
`out/`. It does not import application modules or regenerate its fixture, so a
broken content registry cannot make the preservation check pass by changing
both the implementation and its expected values.

The committed fixture records the rendered public site at commit
`69d6e7134132da51f4961dbe5509fc6adb657284`. For every one of the 11 public
routes, the test requires the old rendered token stream to remain an ordered
subsequence of the new page. Additions such as a skip link, SEO metadata, and
the restored Alignerr summary are allowed; deleting, rewriting, or reordering
the original copy is not.

The suite also verifies authored headings, links, all `aria-label` and
`aria-labelledby` values,
image alternatives, time metadata, and IDs; exact self-referencing canonical
and Open Graph URLs; internal link and asset resolution; the 404, robots, and
sitemap artifacts; removal of Vinext and Cloudflare runtime references; exact
archive and original-asset hashes; and the approved structural counts for Past
Experience, Education, and the first research note. Every current exported page
is discovered automatically and must match the sitemap exactly.

`npm test` always rebuilds first, preventing a stale `out/` directory from
producing a false pass. Use `test:artifact` only when the export was built in the
same validation run:

```powershell
npm.cmd test
# Or, after npm.cmd run build:
npm.cmd run test:artifact
```
