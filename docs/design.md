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
| Project abstracts | `#5c5c58` |
| Text-link underline | `#a6a6a1` |
| Active state and focus | `#2200ff` |
| Structural rule | `rgba(0, 0, 0, 0.06)` |
| Strong rule | `rgba(0, 0, 0, 0.24)` |

Inter 4.1 is the shared typeface for headings, prose, navigation, directories, controls,
metadata, and the architecture viewer. Two self-hosted WOFF2 files provide variable
weights and true italics. `website/public/assets/fonts/inter.css` owns `--font-text`,
optical sizing, and the font faces. The regular face is preloaded; italic loads when used.
System sans fallbacks cover unavailable glyphs, including Chinese in the technical viewer.
The LO mark and dithered identity retain their independent artwork.

Typography follows semantic roles. At any viewport, text with the same role uses
the same size across every section and page. Weight, color, spacing, and italics
provide emphasis within a role. Page-specific font-size overrides are not used.

| Role | Shared token | Size at the default text setting | Leading |
| --- | --- | --- | --- |
| Page title | `--type-title` | 24–36px | 1.2 |
| Section or institution heading, directory item | `--type-heading` | 20–24px | 1.25 |
| Body, records, introductions, course names | `--type-reading` | 16–17px | 1.6 |
| Project, degree, course-category heading | `--type-reading` | 16–17px, weight 600 | 1.45 |
| Navigation, menu, wordmark name, return link | `--type-interface` | 14px | Contextual |
| Field label, index, footer, scroll cue | `--type-label` | 12px | 1–1.5 |

Title, section, and reading sizes use rem-based fluid scales. Labels and interface
text use rem units. Headings have -0.02em tracking; reading text stays near zero.
The optical font sizing and the shared `--reading-leading` support sustained reading.
Blue marks active navigation, focus, and link feedback. Flat surfaces and square corners
keep hierarchy in typography, spacing, and rules.

### Past Experience typography

Domain links and institution headings use the shared section scale. Project titles,
subsection headings, introductions, reference notes, metadata values, and bullets
use the same reading size. Project titles use weight 600, subsection headings use
regular italic, and headings wrap with balanced lines. Numbered project titles use
a colon between the project number and name. Descriptions are separate paragraphs.

All five domain pages use true italics and the supporting ink color for project
introductions. Contribution leads use weight 600; additional spacing groups each
contribution with its supporting evidence. These semantic roles share the same
reading size, leading, emphasis, and spacing across domains.

Narrative bullets use regular Inter, a 1.6 line height, and 18px between items.
Their measure is capped at 720px including the metadata alignment indent.
Metadata values stay upright and regular; labels use the shared muted color.
Bold identifies a project and italic introduces a theme within it. Dates, roles,
and bullets stay upright. Preserve the approved resume prose and its emphasis
through this structural hierarchy.

Small indices and metadata labels use `--type-label`. Navigation, the wordmark name,
the mobile menu, and return links share `--type-interface` at every breakpoint.
Text links share a 1px underline, `--link-rule`, and `--link-underline-offset`.
Focus remains a visible blue outline, and hover feedback respects pointer capability.

## Reading frame

The desktop frame is capped at 1440px and divided into 15 columns, with a three-column
sticky navigation rail. The content field reserves one internal track for indices and
aligns headings and prose to the reading track. Tablet uses 12 outer columns.
Below 768px, the navigation becomes a 4rem sticky header with a Menu / Close panel.
Media-query ranges cover fractional viewport widths continuously.
Without JavaScript, the links remain visible in normal document flow.

Horizontal gutters are 64px on desktop, 32px on tablet, and 20px on phones.
Structural guides are decorative and hidden from assistive technology; phone layouts
omit them. Below 1280px, experience narrative text uses the full reading track;
below 1024px, metadata also stacks. Long values wrap without narrowing the prose.
Phone indices use a 1.5rem track and a 0.625rem gap. These tracks and the mobile
header scale with the user's text size. The wordmark can wrap, and long reading
content has emergency wrapping when an unbroken word would exceed its container.
Coursework uses the shared reading size and leading, two columns from 768px, and
one on phones. Course-category headings match degree and project headings. Column
padding preserves useful space for long course names. Profile details and contact
values also use the reading scale; field labels use the label scale. Coordinates use
a content-weighted desktop row, a tablet matrix, and a phone column. Long contact
values can wrap when text is enlarged.
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

Page, domain, institution, project, and course titles use title case. Supporting
sentences, subsection headings, accessibility descriptions, and action labels use
sentence case. Preserve official spellings and acronyms such as GitHub, AI, ESG,
LLM, SHAP, and IPhO; sentence case does not lowercase proper names.
Use "and" in editorial category labels. Preserve official course and organization
names, including their ampersands. The fellowship name is `Sequoia Fellow`, and
its cohort is owned by the identity configuration in `app/lib/content/site.ts`.

Use straight apostrophes and quotation marks with English commas, periods,
colons, semicolons, and parentheses in public copy and metadata, including the
architecture viewer. Dates use a spaced en dash. Preserve meaningful mathematical
symbols, collaboration marks, and navigation arrows. An em dash can separate
clauses. Unicode English dashes, ©, ×, and navigation arrows are intentional;
Chinese full-width punctuation is not used in public interface copy.
Legal section symbols, paragraph symbols, mathematical notation, and author names
with diacritics remain part of the source text.

The four primary pages are Home, Education, Past Experience, and Current Chapter.
Five domain pages carry the experience record. Domain `03` is Legal Research and
Policy Analysis; its four selected papers each open a dedicated article page.
The website has thirteen public routes, with the architecture viewer as a separate
technical reference. Keep factual claims, metadata, copy, and content order aligned
with the integrity manifests.

### Legal articles

Each paper uses the shared shell and Inter type system with a restrained reading
measure. Preserve the source title, subtitle, author name, date, abstract, original
chapter numbering, paragraph order, legal citations, and acknowledgments. The
article title owns H1; chapters and subsections use semantic H2 and H3 headings.
Use source italics and small capitals for legal citation emphasis.

A contents navigation links directly to chapter anchors. Numbered superscript
references link to complete endnotes, and each endnote links back to the cited
passage. Reading pages retain a visible return link to the legal experience page.
The contents and long citations adapt to phone widths, enlarged text, keyboard
navigation, and reduced motion. Keep the original PDFs outside public assets and
the static export; article pages publish the text and its citation structure.

Use shared tokens in `website/app/globals.css`, focused CSS Modules for local surfaces,
and semantic HTML for new content. Match the existing type, reading measure, and
spacing before adding a new component pattern. Keep expressive motion concentrated
in the opening identity so the rest of the site supports reading.

Review widths from 320 through 2560 pixels, including both sides of the 768, 1024,
and 1280px breakpoints, iPad portrait and landscape sizes, keyboard use, and
reduced-motion settings. The [architecture viewer](../architecture/) is a separate
technical reference with its own light and dark viewing controls.
