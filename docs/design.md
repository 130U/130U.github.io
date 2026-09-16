# Design

Theodore Ouyang's site pairs an expressive personal entrance with a precise editorial
reading frame. The visual language is quiet technical authority: warm paper, black ink,
clear typography, a monochrome LO mark, and selective blue feedback.

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

Inter 4.1 is the shared typeface for headings, prose, navigation, directories, controls,
metadata, and the architecture viewer. Two self-hosted WOFF2 files provide variable
weights and true italics. `website/public/assets/fonts/inter.css` owns `--font-text`,
optical sizing, and the font faces. The regular face is preloaded; italic loads when used.
System sans fallbacks cover unavailable glyphs, including Chinese in the technical viewer.
The LO mark and dithered identity retain their independent artwork.

Desktop page headings use 2.25rem / 1.1 regular with -0.02em tracking; phone headings
use 1.5rem / 1.2. Compact copy and metadata use 0.9375rem / 1.5. Sustained reading
on Home, Current Chapter, and Past Experience uses 17px / 1.55, reducing to 16px
on phones, expressed in rem to respect the reader's text-size preference.
Blue marks active navigation, focus, and link feedback. Flat surfaces and square corners
keep hierarchy in typography, spacing, and rules.

### Past Experience typography

Domain links and institution headings use regular Inter at 24px on desktop and 20px
on phones. Within an experience, project headings, subsection headings, and bullets
share Inter at 17px / 1.55 (16px on phones). Project headings use semibold 600; subsection
headings use regular italic. The shared `--experience-font-size` keeps their reading
scale consistent. Headings wrap with balanced lines. Numbered project titles use a
colon between the project number and name.

Narrative bullets use regular Inter, a 1.55 line height, and 18px between items.
Their measure is capped at 720px including the existing metadata alignment indent.
Metadata stays compact, upright, and regular; labels use the shared muted color.
Bold identifies a project and italic introduces a theme within it. Dates, roles,
and bullets stay upright. Preserve the approved resume prose and its emphasis
through this structural hierarchy.

## Reading frame

The desktop frame is capped at 1440px and divided into 15 columns, with a three-column
sticky navigation rail. The content field reserves one internal track for indices and
aligns headings and prose to the reading track. Tablet uses 12 outer columns.
Below 768px, the navigation becomes a 64px sticky header with a Menu / Close panel.
Without JavaScript, the links remain visible in normal document flow.

Horizontal gutters are 64px on desktop, 32px on tablet, and 20px on phones.
Structural guides are decorative and hidden from assistive technology; phone layouts
omit them. Below 1024px, experience metadata stacks and narrative text uses the full
reading track. Long values can wrap without narrowing the experience prose.
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
