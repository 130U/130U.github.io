# Design

Theodore Ouyang's site uses a precise editorial reading frame: warm paper, black ink,
clear typography, a monochrome LO mark, and selective blue feedback. Its grid, paper
color, restrained rules, and spacing take their reference from [Cognition](https://cognition.com/).
The site uses self-hosted Inter and its own content hierarchy.

## Identity

The compact LO mark appears in the navigation and browser icons. About opens with
the interactive full-screen THEODORE OUYANG particle wordmark, followed by the
profile and contact information. This signature entrance is an intentional part
of the owner's identity; preserve its pointer and keyboard interaction, scroll
link, static fallback, and reduced-motion behavior. The mark's editable master is
`website/source-assets/brand/lo-mark.svg`.

## Color and type

| Role | Value |
| --- | --- |
| Paper | `#f7f6f5` |
| Ink | `#0b0b0b` |
| Supporting text | `#70706c` |
| Supporting prose and source links | `#5c5c58` |
| Text-link underline | `#a6a6a1` |
| Active state and focus | `#2200ff` |
| Structural rule | `rgba(0, 0, 0, 0.06)` |
| Strong rule | `rgba(0, 0, 0, 0.24)` |

Inter 4.1 is the shared typeface for headings, prose, navigation, directories, controls,
metadata, and the architecture viewer. Two self-hosted WOFF2 files provide variable
weights and true italics. `website/public/assets/fonts/inter.css` owns `--font-text`,
the default optical sizing, and the font faces. The regular face is preloaded; italic loads when used.
System sans fallbacks cover unavailable glyphs.
The LO mark uses independent artwork.
About's reading frame uses this same Inter family with automatic optical sizing
disabled and the `opsz` axis fixed at 14. Its headings and prose use normal tracking.
Small indices and field labels use the shared label tracking.

Typography follows semantic roles. At any viewport, text with the same role uses
the same size across every section and page. Weight, color, spacing, and italics
provide emphasis within a role. Research prose and table cells use the same reading
size as the biography, experience record, and legal articles. Mathematical expressions
scale relative to surrounding text without changing the prose size.

| Role | Shared token | Size at the default text setting | Leading |
| --- | --- | --- | --- |
| Page title | `--type-title` | 22px, weight 400 | 1.25 |
| Section heading | `--type-heading` | 22px, weight 400 | 1.25 |
| Project, About institution, course-category heading | `--type-subheading` | 18px, weight 600 | 1.45 |
| About degree | `--type-reading` | 14px, weight 500 | 1.6 |
| Body, records, introductions, course names, metadata values | `--type-reading` | 14px | 1.6 |
| Navigation, menu, wordmark name, return link | `--type-interface` | 14px | 1.4 |
| Experience directory item and number | `--type-subheading` | 18px, weight 400 | 1.45 |
| Project reading action | `--type-action`, alias of `--type-interface` | 14px, weight 500 | 1.4 |
| Research prose and table cells | `--type-reading` | 14px | 1.6 |
| Mathematical expression | `--type-math` | 1.15em of its surrounding text | Intrinsic mathematical geometry |
| Field label, section margin index, footer | `--type-label` | 14px | 1.4 |

Text roles use rem units and scale with the user's text setting. The 22px, 18px,
and 14px hierarchy stays the same at every viewport across the site and architecture
viewer; mobile layouts do not reduce type sizes. About headings use zero tracking; other page and section
headings retain -0.02em tracking. Reading text stays near zero. The shared
`--reading-leading` supports sustained reading.
Blue marks active navigation, focus, and link feedback. Editorial surfaces use flat
rules and typography; the note-preview dialog uses a rounded surface to distinguish
its temporary reading state.

### Experience presentation

Experience shares About's Inter family, fixed optical size, role sizes, grid, and
paper/ink palette. It is one page with five numbered sections and a compact anchor
directory that stays in one column at every screen width. Its labels and numbers
use the 18px subheading size at weight 400; section margin indices
use 14px on both About and Experience. Section spacing separates
domains; thin rules and 28px gaps distinguish entries within them. Category
introductions are omitted. Summaries use upright
black body text at 14px; project and organization titles use the 18px subheading
role. No content is truncated to fit a card.

The black and blue in the approved Word document identify outer and detail content;
blue is not a prose color on the website. All body copy uses the existing ink colors.
Blue remains reserved for navigation, hover, and keyboard focus.

All eighteen entries use real Read More links to dedicated pages. The eight AI and
legal articles use their manuscript URLs; the other ten entries have pages at
`/experience/{slug}/`. Outer entries lead with the institution or organization;
legal entries use `Duke Law School: {research area} Research`. Detail-page H1s use
`{institution}: {project title}`, with any internal title colon rendered as an em
dash so the institution separator is the title's only colon. Position, Location, and Dates appear as three
stacked rows in one column at every viewport, followed by the approved Key
Contributions, with contextual notes as the final bullets in the same list and
type style. Links work without JavaScript and have accessible
keyboard focus and touch targets. Do not repeat the outer summary in the detail view.

AI pages proceed directly from Key Contributions to the first numbered chapter.
The complete protected source JSON includes the title, Project and Author lines,
and introductory material for provenance. Legal pages place Key Contributions
before the complete Abstract and manuscript. The shared contents rail includes
the contribution block and source chapter links. Return links target the matching
entry on Experience.

Research article prose, emphasis, citations, and table cells use the shared 14px
reading size. Subsection headings use the shared 18px size with weight 600. Inline
and standalone formulas use a relative 1.15em scale. Subscripts,
superscripts, fractions, accents, and equation labels retain their mathematical
hierarchy. Multiline equations have explicit row spacing and generous surrounding
space. Equation blocks use symmetric 2.25rem margins and 0.75rem vertical padding.
Wide equations scroll locally at their natural size. Displayed equations omit
sentence-ending punctuation while original TeX annotations preserve the authored
source. Mathematical SVG glyphs are artwork rather than an additional prose font.

Research tables preserve normal word boundaries and a minimum useful column width.
Only tables wider than the reading column scroll horizontally; their formulas move
with the table instead of creating nested scrolling areas. Table and equation
regions retain native touch, trackpad, scrollbar, and keyboard navigation. Article
paragraphs have 1.5rem separation. New main chapters begin after 5rem of space, a
fine rule, and 2rem of inset; phone spacing is 4rem and 1.5rem. Subsections use
3rem of separation. These boundaries distinguish argument levels without changing
the site's fonts or type sizes.

Section margin indices and metadata labels use `--type-label`. Navigation, the wordmark name,
the mobile menu, and return links share `--type-interface` at every breakpoint.
Text links share a 1px underline, `--link-rule`, and `--link-underline-offset`.
Focus remains a visible blue outline, and hover feedback respects pointer capability.

## Reading frame

The desktop frame is capped at 1440px and divided into 15 columns, with a three-column
sticky navigation rail. The content field reserves one internal track for indices and
aligns headings and prose to the reading track. Tablet uses 12 outer columns.
The shared `--reading-measure` caps narrative containers at 720px. Page introductions,
the education list and outer coursework field, Experience records and detail pages,
and AI project articles align their headings and prose to this common right edge.
Nested paragraphs fill their container with natural ragged-right wrapping. Each
coursework category flows into up to two independent columns on desktop; legal articles retain
their own reading and contents layout.
Below 768px, the navigation becomes a 4rem sticky header with a Menu / Close panel.
Media-query ranges cover fractional viewport widths continuously.
Without JavaScript, the links remain visible in normal document flow.

Horizontal gutters are 64px on desktop, 32px on tablet, and 20px on phones.
Structural guides are decorative and hidden from assistive technology; phone layouts
omit them. Below 1280px, experience narrative text uses the full reading track.
Experience metadata remains in one column at every width. Long values wrap without
narrowing the prose.
Phone indices use a 1.5rem track and a 0.625rem gap. These tracks and the mobile
header scale with the user's text size. The wordmark wraps at word boundaries,
and the desktop navigation rail scrolls internally when its contents exceed the
viewport height. Its minimum track width follows the interface type size, navigation
indent, padding, and scrollbar allowance. The reading field and structural guides
reflow together when enlarged text needs more rail space. Long reading content has
emergency wrapping when an unbroken word would exceed its container.
Coursework uses four stacked category blocks. Each list flows down up to two CSS
columns with a 16rem target width and a 24px gap, returning to one column below
768px. Course names stay together across column breaks, with 2px between items;
wrapped names do not reserve empty space in the adjacent column. Lists keep the
shared reading size and leading. Category headings share the same size, weight,
leading, and tracking as research titles and the About institution heading, without
reserving a second line. Duke University appears once above the two degree records;
degree names use the reading size at weight 500. Compact notes and a thin rule
separate the degree records. Profile details and contact values also use the reading
scale; field labels use the label scale. Email and GitHub occupy two columns
above 540px and stack in one column at 540px and below. Long contact values can wrap
when text is enlarged.
Coarse pointers receive 44px primary navigation and standalone link targets.

About uses compact spacing inside each research or education record and larger
breaks between its numbered sections. The research title is an underlined manuscript
link in black ink, with blue hover and keyboard-focus feedback, followed by
supporting paragraphs. Paragraphs wrap naturally
without forced line breaks. Section headings, entry headings, and reading text use
the shared 22px, 18px, and 14px hierarchy; scoped spacing overrides do not affect other pages.

Page titles own the H1 position. About's two-line "Thinking mathematically / Working in AI"
supplies its main heading; the particle wordmark retains the full name artwork.
Experience domains use `01`–`05` indices, and entries use lowercase letters.
Bullet markers occupy an 18px gutter beside the text. Narrative lines stay within
the shared 720px reading measure and reflow with the viewport.

## Interaction

About opens with its Canvas2D name entrance and direct scroll link to the profile. Routine links
use color and underline feedback.
Anchor navigation uses native scrolling. The mobile menu uses a short opening
transition, with reduced-motion support.
Focus outlines remain visible. The mobile menu traps keyboard focus, closes on Escape
or navigation, and releases the page when the viewport reaches desktop width.

## Content and extension

Page, domain, institution, project, and course titles use title case. Interface
labels use title case, including Read More, Back to Top, Full Manuscript, Author
Note, and View in Footnotes. Research article titles and chapters preserve their
authored capitalization. Supporting sentences and accessibility descriptions use
sentence case. Preserve official spellings and acronyms such as GitHub, AI, ESG,
LLM, SHAP, and IPhO; sentence case does not lowercase proper names.
Use "and" in editorial category labels. Preserve official course and organization
names, including their ampersands. The fellowship name is `Sequoia Fellow`, and
its cohort is owned by the identity configuration in `app/lib/content/site.ts`.
Site metadata uses this identity configuration; About omits the fellowship.

Use straight apostrophes and quotation marks with English commas, periods,
colons, semicolons, and parentheses in public copy and metadata, including the
architecture viewer. Preserve source date punctuation and meaningful mathematical
symbols, collaboration marks, and navigation arrows. An em dash can separate
clauses. Unicode English dashes, ©, ×, and navigation arrows are intentional;
Chinese full-width punctuation is not used in public interface copy.
Legal section symbols, paragraph symbols, mathematical notation, and author names
with diacritics remain part of the source text.

The primary navigation contains About and Experience. About at
`/` combines the introduction, Selected Research, Education, Selected Coursework,
and contact details. The supplied first-person introduction leads the page; both
Duke degrees, the advisor, scholarships, and all 49 courses remain
available. Coursework keeps its four subject groups. The `/education/` compatibility
page shares the About content without repeating the particle entrance, uses `/`
as its canonical URL, and remains outside primary navigation and the sitemap.
Experience contains all five domains and eighteen entries. The five category
URLs provide compatibility pages with `/experience/` as their canonical URL and a
return link to the matching Experience section. Domain `03` is Legal Research and
Policy Analysis; its four selected papers
use dedicated article URLs. Domain `01`, AI Research and Engineering,
has four project reading URLs. The other ten entries open dedicated detail
pages under `/experience/`.
About's Selected Research section presents three entries. The first,
[Critical Dependence Stress for Portfolio Diversification](https://github.com/130U/mathematical-finance-project),
links to its GitHub project; the Asian-options and Rough Heston entries follow and
link to their on-site manuscripts. Titles use black links that turn blue on hover
or keyboard focus, followed by supporting paragraphs with selected bold emphasis. Numerical guarantees retain their
model, horizon, payoff, and comparison scope.
It does not repeat the abstracts or add a separate action row. Titles use the same
18px subheading role; supporting paragraphs use the 14px reading role. Thin
horizontal rules separate entries. Typography, spacing, and wrapping adapt within
the shared reading frame without introducing cards or changing the palette.

Each research page provides a contents list and the manuscript's abstract, core
chapters, formulas, and references. The Asian-options paper includes chapters 1–10;
the Rough Heston paper includes chapters 1–8. Appendices and supporting material are
linked on GitHub. Each JSON source records the exact source commit, blob, and manuscript
URL; source links should continue to identify that version. The full manuscript is
available from the article header, and return links lead to the corresponding
research entry on About. The `/education/<paper>/` manuscript URLs are stable.

Research chapter headings display Roman numerals, and subsections display letters
in reading order. Source numbering and anchors remain intact. Verified internal
section references link to the matching heading and preserve their source numerals.

The website has twenty-two canonical content routes: About, Experience, two Selected
Research articles, eight Experience manuscripts, and ten other Experience detail
pages. Eight compatibility pages bring the content export to thirty routes. The
architecture viewer adds one technical reference route, making thirty-one exported
routes in total, excluding 404.
Keep factual claims, metadata, copy, and content order aligned with the integrity manifests.

### Legal articles

Each paper uses the shared shell and Inter type system with a restrained reading
measure. Preserve the source title, subtitle, author name, date, abstract, original
chapter numbering, paragraph order, legal citations, and acknowledgments. The
detail-page H1 combines the institution and approved project title; chapters and
subsections use semantic H2 and H3 headings.
Chapter headings use the section role at weight 400; subsections use the 18px
subheading role at weight 600. Preserve source capitalization, italics, and emphasis.
Legal citations within a paragraph use its body size and spacing, including text
marked as small capitals in the source. Note previews use the same reading role;
their headings use the section role at weight 400.

A contents navigation links to Key Contributions, the abstract, chapters, and
footnotes. It occupies a
sticky side column when the reading field has enough space, and collapses into a
single-column disclosure as the viewport or text size narrows. Section tracking
identifies the current reading location without changing the document order.

Numbered superscript references open the original note in a native dialog. Desktop
previews are centered; phones use a bottom sheet with a scrollable note body and
44px controls. Escape, background activation, and Close return focus to the cited
passage. View in Footnotes closes the preview and focuses the complete endnote.
Full notes and bidirectional links remain available without JavaScript.

Reading pages retain a visible return link to the corresponding Experience entry. Contents,
long citations, and note previews adapt to phone widths, enlarged text, keyboard
navigation, and reduced motion. Keep the original PDFs outside public assets and
the static export; article pages publish the text and its citation structure.

Use shared tokens in `website/app/globals.css`, focused CSS Modules for local surfaces,
and semantic HTML for new content. Match the existing type, reading measure, and
spacing before adding a new component pattern. Keep interactions focused on navigation
and reading while preserving the signature interactive name entrance. Visual
identity may be expressive; biographical and research claims remain measured.

Review widths from 320 through 2560 pixels, including both sides of the 768, 1024,
and 1280px breakpoints, iPad portrait and landscape sizes, keyboard use, and
reduced-motion settings. The [architecture viewer](../architecture/) is a separate
technical reference with its own light and dark viewing controls.
