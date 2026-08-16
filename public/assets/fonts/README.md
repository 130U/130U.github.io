# Typography Assets

The interface intentionally uses two self-hosted variable-font families:

- **Newsreader** for editorial text and headings; its italic face is reserved
  for the Theodore Ouyang signature wordmark.
- **Shantell Sans** for navigation and compact interface labels.

The particle word sampler remains on a platform geometric sans stack. This
keeps `THEODORE` and `OUYANG` deterministic and prevents font loading from
changing their point targets.

## Provenance

| File | Package source | Version | License |
| --- | --- | --- | --- |
| `newsreader-variable-latin.woff2` | Existing approved repository asset | — | SIL Open Font License 1.1 |
| `newsreader-variable-italic-latin.woff2` | `@fontsource-variable/newsreader` | 5.2.10 | `licenses/newsreader-OFL.txt` |
| `shantell-sans-variable-latin.woff2` | `@fontsource-variable/shantell-sans` | 5.3.0 | `licenses/shantell-sans-OFL.txt` |

The new files were retrieved from the version-pinned jsDelivr package paths.
Do not replace them with runtime font-provider requests; this site must render
without disclosing visits to a third-party font service.
