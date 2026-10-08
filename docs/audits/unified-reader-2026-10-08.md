# Unified article reader — 8 October 2026

The two Selected Research manuscripts, four AI articles and four legal papers now share `ArticleReadingLayout` and `ArticleContents`.

## Reading conventions

- Reading order: original title and publication details, Abstract or Overview, Contents, complete body, references or footnotes, return navigation.
- Major chapters use Roman numerals; subsections use capital letters in their displayed order. Abstract, supporting material, references and footnotes remain unnumbered.
- Original manuscript section identities and anchors remain stable. Audited internal Section references link to the corresponding web headings; their source numerals, equation numbers, theorem numbers and external citations remain unchanged.
- Shared typography remains Inter: 17px prose, 18px subsections, 24px chapters on desktop and 22px chapters on mobile. Every body chapter, including the first, has the same divider and spacing: 80px before the rule and 32px after it on desktop; 64px and 24px on mobile.
- Contents uses the existing legal disclosure and active-section behavior: a sticky sidebar where space permits, a collapsed menu following the overview on narrower screens. The manuscript itself is never collapsed.
- Tables and long equations retain native, keyboard-accessible local horizontal scrolling without reducing the reading font.

## Rendering corrections

The outlined proof-ending squares in the Asian manuscript are original QED notation, not missing characters. They now read `Q.E.D.` with an “End of proof” expansion. Their original TeX annotations remain preserved. The equivalent rough-Heston markers receive the same presentation, eliminating the literal end-of-proof symbol's reliance on a fallback font.

Four mathematical heading labels use verified readable Unicode in the plain-text contents menu; the actual headings keep their original mathematical rendering. Unknown mathematical heading labels fail explicitly instead of exposing raw TeX. The architecture search icon now uses vector geometry rather than a font-dependent character.

## Validation

- Independent red-team audit before and after implementation; separate visual review of desktop and mobile screenshots.
- 91 automated checks passed, including source integrity, source-to-output formula equality, complete article content, navigation, footnotes, encoding, local anchors, rendering and static security.
- All 20 exported pages checked at 1440px and 390px; all ten articles additionally checked at 320px, 768px and 1280px: 70 browser states. No document-level horizontal overflow or MathJax errors found.
- All ten mobile contents menus opened and navigated to their first chapter with the correct active link. Native table keyboard scrolling was exercised.
- All 888 research formula inputs retain their original TeX, order and display mode. Main manuscript text, source files, legal content, article metadata, the interactive landing and the five experience domains remain preserved.

Browser measurements and screenshots are retained in the local task audit directory `audits/unified-reader-20261008/`, outside the repository.
