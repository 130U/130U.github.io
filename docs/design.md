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

Page headings scale continuously from 1.5rem to 2.25rem with a 1.2 line height and
-0.02em tracking. Institution headings and directory names scale from 1.25rem to
1.5rem. Compact copy and metadata use 0.9375rem / 1.5. Sustained reading on Home,
Current Chapter, and Past Experience scales from 1rem to 1.0625rem with a 1.6 line
height. Shared `--type-title`, `--type-heading`, `--type-reading`, and
`--reading-leading` tokens keep pages consistent and respect text-size preferences.
Blue marks active navigation, focus, and link feedback. Flat surfaces and square corners
keep hierarchy in typography, spacing, and rules.

### Past Experience typography

Domain links and institution headings use regular Inter at 24px on desktop and 20px
on phones. Within an experience, project headings, subsection headings, and bullets
share the fluid reading scale. Project headings use semibold 600; subsection
headings use regular italic. The shared `--experience-font-size` keeps their reading
scale consistent. Headings wrap with balanced lines. Numbered project titles use a
colon between the project number and name. A project title can include supporting
context after a spaced em dash; the renderer places that context in a separate,
regular-weight paragraph while preserving its text and punctuation.

Narrative bullets use regular Inter, a 1.6 line height, and 18px between items.
Their measure is capped at 720px including the metadata alignment indent.
Metadata stays compact, upright, and regular; labels use the shared muted color.
Bold identifies a project and italic introduces a theme within it. Dates, roles,
and bullets stay upright. Preserve the approved resume prose and its emphasis
through this structural hierarchy.

## Reading frame

The desktop frame is capped at 1440px and divided into 15 columns, with a three-column
sticky navigation rail. The content field reserves one internal track for indices and
aligns headings and prose to the reading track. Tablet uses 12 outer columns.
Below 768px, the navigation becomes a 64px sticky header with a Menu / Close panel.
Media-query ranges cover fractional viewport widths continuously.
Without JavaScript, the links remain visible in normal document flow.

Horizontal gutters are 64px on desktop, 32px on tablet, and 20px on phones.
Structural guides are decorative and hidden from assistive technology; phone layouts
omit them. Below 1280px, experience narrative text uses the full reading track;
below 1024px, metadata also stacks. Long values wrap without narrowing the prose.
Phone indices use a compact 24px track and a 10px gap.
Coursework uses 14px / 1.55 text, four columns at 1280px and above, two from 768px,
and one on phones. Column padding preserves useful space for long course names.
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

Review widths from 320 through 2560 pixels, including both sides of the 768, 1024,
and 1280px breakpoints, iPad portrait and landscape sizes, keyboard use, and
reduced-motion settings. The [architecture viewer](../architecture/) is a separate
technical reference with its own light and dark viewing controls.
