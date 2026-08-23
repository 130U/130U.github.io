# Public Assets

Files under `public/assets/` are copied into the official Next.js static
export and must be required by the live site.

- `public/assets/brand/` — browser icons and the optimized social preview.
- `public/assets/fonts/` — the approved self-hosted Shantell Sans variable
  font and its OFL license.
- `public/assets/profile/` — the referenced portrait fallback and responsive
  AVIF/WebP derivatives.

Original brand artwork lives under `source-assets/brand/`. The social preview
source is used by the image optimization script; the monogram and large icon
remain available for future brand work without being deployed.

The repository README uses `.github/assets/readme-cover.jpg`, a 1600 × 800
pre-rendered masthead with a Duke Navy field. Keep its path, dimensions,
typography, particle composition, and text placement stable; palette-only
refreshes should retain readable light-on-Navy contrast.

The source portrait and original brand artwork are integrity-protected by
SHA-256 tests. Never overwrite them. Generate derivatives with:

```powershell
npm.cmd run optimize:images
```

Keep source names stable unless every script reference, metadata field,
integrity test, and responsive derivative is updated together.
