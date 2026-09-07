# Design

Theodore Ouyang's site pairs an expressive personal entrance with a precise editorial
reading frame. The visual language is quiet technical authority: warm paper, black ink,
serif prose, a monochrome LO mark, and selective blue feedback.

## Identity

The compact LO mark appears in the navigation and browser icons. The full name becomes
a dithered wordmark on Home. Both share a monochrome identity. The mark's editable
master is `website/source-assets/brand/lo-mark.svg`.

## Color and type

| Role | Value |
| --- | --- |
| Paper | `#f7f6f5` |
| Ink | `#0b0b0b` |
| Dither ink | `#070707` |
| Supporting text | `#70706c` |
| Active state and focus | `#2200ff` |
| Structural rule | `rgba(0, 0, 0, 0.06)` |
| Strong rule | `rgba(0, 0, 0, 0.24)` |

Interface text uses Helvetica Neue, Helvetica, and Arial. Narrative text uses Georgia
with Times New Roman and system serif fallbacks. The website uses system fonts.
Desktop page headings use 36px / 1.1 regular sans with -0.02em tracking; phone headings
use 24px / 1.2. Body copy uses 15px / 1.5 serif on desktop and 16px on phones.
Blue marks active navigation, focus, and link feedback. Flat surfaces and square corners
keep hierarchy in typography, spacing, and rules.

## Reading frame

The desktop frame is capped at 1440px and divided into 15 columns, with a three-column
sticky navigation rail. The content field reserves one internal track for indices and
aligns headings and prose to the reading track. Tablet uses 12 outer columns.
Below 768px, the navigation becomes a 64px sticky header with a Menu / Close panel.
Without JavaScript, the links remain visible in normal document flow.

Horizontal gutters are 64px on desktop, 32px on tablet, and 20px on phones.
Structural guides are decorative and hidden from assistive technology; phone layouts
omit them. At 540px and below, metadata stacks and long values can wrap.
Coordinates use a content-weighted desktop row, a tablet matrix, and a phone column.
Coarse pointers receive 44px primary navigation and standalone link targets.

Page titles own the H1 position. Home's name supplies its identity heading.
Experience domains use `01`–`05` indices, and entries use lowercase letters.
Bullet markers occupy an 18px gutter beside the text. Narrative lines remain within
roughly 64–72 characters where the layout permits.

## Interaction

The Home wordmark is the primary expressive gesture. Its Canvas2D stage follows the
shorter viewport side, capped at 720px on desktop and 380px on phones. Hover repels
points; press, release, and keyboard activation produce bounded feedback. Up to four
ripples can coexist. The animation loop stops at rest and pauses off-screen.
Reduced motion displays the complete static wordmark. The visible HTML fallback
supplies the name before the canvas is ready and when JavaScript is unavailable.

Navigation and links use brief color, opacity, rule, or transform feedback.
Focus outlines remain visible. The mobile menu traps keyboard focus, closes on Escape
or navigation, and releases the page when the viewport reaches desktop width.

## Content and extension

The four primary pages are Home, Education, Past Experience, and Current Chapter.
Five domain pages carry the experience record. Keep factual claims, metadata, copy,
and content order aligned with the integrity manifests.

Use shared tokens in `website/app/globals.css`, focused CSS Modules for local surfaces,
and semantic HTML for new content. Match the existing type, reading measure, and
spacing before adding a new component pattern. Keep expressive motion concentrated
in the opening identity so the rest of the site supports reading.

Review widths of 1440, 1024, 768, 540, 430, 390, and 320 pixels, keyboard use, and
reduced-motion settings. The [architecture viewer](../architecture/) is a separate
technical reference with its own light and dark viewing controls.
