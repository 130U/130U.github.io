# Public Assets

Files under `assets/` are copied into the official Next.js static export.

- `assets/brand/` — browser icons, monogram, source social preview, and optimized preview.
- `assets/fonts/` — approved self-hosted fonts.
- `assets/posts/` — source diagrams and responsive derivatives.
- `assets/profile/` — source portrait and responsive AVIF/WebP derivatives.

The source portrait, social image, and research diagram are integrity-protected
by SHA-256 tests. Never overwrite them. Generate derivatives with:

```powershell
npm.cmd run optimize:images
```

Keep source names stable unless every reference, metadata field, integrity test,
and responsive derivative is updated together.
