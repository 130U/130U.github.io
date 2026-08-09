# Public Assets

Files under `assets/` are copied into the official Next.js static export.

- `assets/brand/` — browser icons, monogram, source social preview, and optimized preview.
- `assets/fonts/` — approved self-hosted fonts.
- `assets/profile/` — source portrait and responsive AVIF/WebP derivatives.

The repository README uses `.github/assets/readme-cover.jpg`, a 1600 × 800
masthead with a Duke Navy field and the existing Newsreader wordmark. Keep its
path, dimensions, typography, particle composition, and text placement stable;
palette-only refreshes should retain readable light-on-Navy contrast.

The source portrait and social image are integrity-protected by SHA-256 tests.
Never overwrite them. Generate derivatives with:

```powershell
npm.cmd run optimize:images
```

Keep source names stable unless every reference, metadata field, integrity test,
and responsive derivative is updated together.
