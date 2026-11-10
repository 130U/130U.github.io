# Design

Theodore Ouyang's site is a precise editorial reading frame: warm paper, black ink, a
monochrome LO mark, and blue reserved for feedback. Its grid, paper color, rules, and
spacing take their reference from [Cognition](https://cognition.com/); its typography
pairs self-hosted Inter with Source Serif 4 inside the site's own content hierarchy.
The aim is restraint, not absence.

## Principles

- **One size per role.** Text with the same role has the same size on every page at a
  given viewport. Weight, color, spacing, and italics carry emphasis within a role.
- **Few styles per component.** Each component uses at most two text styles. Small gray
  labels appear only where a field needs naming: the record strip, contact details,
  diagrams, and figures.
- **Structure in three weights.** A strong solid rule opens each page-level section;
  one faint, unfilled frame holds each group of content; dashed hairlines divide the
  inside of a frame.
- **A result belongs in its sentence.** Summaries and records carry no metric rows,
  pills, or badges. A summary on About or Experience states at most one headline
  figure; the other figures live on the entry's own page, where article figures may
  chart them.
- **Reading comes first.** Every page, figure, and link works without JavaScript;
  interaction refines what is already there.

## Color

| Role | Token | Value |
| --- | --- | --- |
| Paper | `--page` | `#f7f6f5` |
| Ink | `--ink` | `#0b0b0b` |
| Supporting text | `--muted` | `#70706c` |
| Supporting prose and source links | `--supporting-ink` | `#5c5c58` |
| Text-link underline | `--link-rule` | `#a6a6a1` |
| Active state, focus, and feedback | `--accent` | `#2200ff` |
| Structural rule | `--rule` | `rgba(0, 0, 0, 0.06)` |
| Diagram node border | `--rule-medium` | `rgba(0, 0, 0, 0.12)` |
| Strong rule | `--rule-strong` | `rgba(0, 0, 0, 0.24)` |
| Frame edge | `--frame` | `rgba(0, 0, 0, 0.08)` |
| Dashed hairline, drawn by `--dash-x` and `--dash-y` | `--dash` | `rgba(0, 0, 0, 0.15)`, 4px dash, 4px gap |
| Diagram node surface | `--panel` | `#fcfbfa` |
| Figure second series | `--chart-sky` | `#4fb0e3` |
| Figure exact segment | `--chart-green` | `#0d8a57` |
| Figure context | `--chart-steel`, `--chart-mist` | `#8d8d88`, `#d9d8d4` |
| Figure emphasis | `--chart-tint`, `--chart-tint-strong` | `rgba(34, 0, 255, 0.05)`, `rgba(34, 0, 255, 0.1)` |

Body copy uses the ink colors. Blue marks active navigation, hover, keyboard focus, and
the decision or feedback path in diagrams and figures.

## Typography

Inter 4.1 sets headings, navigation, directory labels, controls, metadata, and the
architecture viewer. Source Serif 4 sets narrative prose and the small section and
directory indices: Inter marks structure, Source Serif 4 marks reading.
`public/assets/fonts/inter.css` owns `--font-text` and the Inter faces, with automatic
optical sizing disabled, the `opsz` axis fixed at 14, and lining numerals.
`source-serif.css` owns `--font-prose` and the Source Serif 4 faces. Both families are
variable WOFF2 files with true italics and bundled licenses; no other typeface is
loaded. Prose numerals are proportional; indices and numeric table columns are tabular.
Bold is weight 600.

| Role | Token | Size and face | Leading |
| --- | --- | --- | --- |
| Page title | `--type-title` | 36px, 30px below 768px; Inter 400, -0.022em | 1.12 |
| Section or chapter heading | `--type-heading` | 24px, 22px below 768px; Inter 400, -0.015em | 1.25 |
| Item title: project, paper, institution, subsection; directory label | `--type-subheading` | 18px, Inter 500; 400 for directory labels | 1.4 |
| Reading: body, summaries, record values, courses, table cells, captions | `--type-reading` | 16px, Source Serif 4 400 | 1.65 |
| Interface: navigation, contents, Read More, degree names, node titles | `--type-interface`, `--type-action` | 15px, Inter 400; 500 for actions and node titles | 1.5 |
| Label: field labels, diagram and chart text, footer | `--type-label` | 13px, Inter 400 | 1.45 |
| Index: section margin index, directory and contribution numbers | `--type-index` | 11px, Source Serif 4 400 | 1.5 |
| Inline mathematics | | 1em of the surrounding text | Intrinsic |
| Displayed mathematics | `--type-math` | 1.15em | Intrinsic |

Roles use rem units and scale with the reader's text setting. Only titles and headings
step down below 768px. Titles, headings, and item titles use `--title-tracking`,
`--heading-tracking`, and `--subheading-tracking`; reading text and indices use none.
Inline `code` inherits the surrounding face, and summaries carry no bold. In Key
Contributions, the lead sentence and results set in bold in the AI manuscript render at
weight 600, so each contribution opens with its claim; italic run-ins and bold theorem
labels belong to the mathematics papers. The hero name is the one display exception:
it scales with the viewport.

Apply a role by meaning: an institution or paper name is an item title even when it is
the page's H1.

## Layout

### Reading frame

The desktop frame is capped at 1440px and divided into 15 columns: a three-column
sticky navigation rail and a twelve-column content field. Tablets between 768px and
1024px use 12 columns, with content running to the right gutter so portrait iPads keep
a full line of prose. Horizontal gutters are 64px on desktop, 32px on tablets, and 20px
on phones. The content field reserves one internal track for margin indices and aligns
headings and prose to the reading track. Structural column guides are decorative,
hidden from assistive technology, and omitted on phones.

The rail's minimum width follows the interface type size, indent, padding, and
scrollbar allowance, so the rail, reading field, and guides reflow together when text
is enlarged. The rail scrolls internally when its contents exceed the viewport height.
Below 768px, top-level pages use a 4rem sticky header with a Menu / Close panel; detail
pages show the wordmark and their parent link in the header without a menu. Without
JavaScript, the links stay visible in normal document flow. Media-query ranges cover
fractional viewport widths continuously.

### Measure

`--reading-measure` (36rem, about seventy characters of Source Serif 4 at the reading
size) caps every narrative container: introductions, standfirsts, stacked ledger prose,
detail pages, captions, posts, and article reading columns. Lines average about 33
characters on a 320px phone (26 inside a frame), 51 to 66 on a portrait iPad, and 72 in a
full reading column; prose on the hanging axis holds 42 at 1200px and 52 from 1440px.
Paragraphs wrap ragged-right with no forced breaks, and long unbroken strings wrap in an
emergency.

### Hanging layout

About, Experience, Coursework, Blog, and the ten detail pages hang content on two axes
of the ten-column field (`--hang-columns`, 4fr / 6fr). From 1200px each title sits alone
on axis A and its prose on axis B; below 1200px each title stacks above its prose.
Sections end on the reading-end guide, 11 of the 12 content columns. On wide article
layouts the reading column takes seven grid columns and the contents rail three, so the
split lands on the column-12 guide.

## Structure

### Frames and ledgers

One faint, unfilled 1px frame holds each group of content: a section's entries, the
section index, the record strip, contact details, a course list. Frames have square
corners, no fill, no shadow, and `--frame-pad` (44px, easing to 32px at 1200px) of room
inside. Entries of one
section share a frame and are separated by space; frames never stack with a gap between
them.

Framed lists use the global `ledger`, `ledger-item`, `ledger-title`, `ledger-body`, and
`ledger-prose` classes. From 1200px one continuous dashed spine runs down the frame
between titles and prose, with 72px between entries; below 1200px entries are divided
by a dashed line inside the frame. On About, the contact strip's first divider falls on
the same axis as the spine.

### Links and actions

Text links share a 1px underline in `--link-rule` at `--link-underline-offset`; hover
and focus turn them blue. Read More is underlined interface text at weight 500 with the
decorative chevron from `ReadingArrow`; its accessible name identifies the destination.
View Now on a post uses the same chevron.

Every return action reads "Back to {destination}" with the decorative arrow from
`ReturnArrow`: Back to Education, Back to Selected Research, Back to Experience, and
Back to Blog. On detail pages it is the parent link beside the wordmark; article,
detail-page, and post footers repeat it beside Back to Top. The destination is the
originating section or entry, so the link works after opening a page directly. The 404
page offers Return Home with the same arrow. Parent links have 44px targets; coarse
pointers also receive 44px primary navigation and standalone link targets.

### Section directory

Experience and Coursework share `SectionDirectory`: a framed index whose rows are
divided by inset dashed hairlines, with serif numbers at the left (01–05 on Experience,
01–04 on Coursework) and labels at the item-title size and weight 400. From 1200px the
page title hangs on axis A and the index on axis B; the index keeps one column at every
width. A right-aligned View label appears on hover and keyboard focus and stays visible
on touch devices; the whole row turns blue. The numbers and View labels are hidden from
assistive technology, so each link's accessible name is the section title.

### Record strip

Organization, Position, Location, and Dates form a framed strip divided by dashed
hairlines: four fields on desktop, two per row below 1200px, and one below 420px. Each
field is a label above a value in the reading face; long values wrap without narrowing
the prose.

## Pages

### About

About opens with the name beside the clarinet hero; phones and portrait tablets stack
the name above the instrument. The name and the institutions Duke and Sequoia use Inter;
the roles Alumnus and Fellow use Source Serif 4. The two-line "Thinking Mathematically /
Working in AI" introduction is an H2 at the title size, its second line in the muted
tone, with the biography below on the same edge within the measure. Links inside the
biography and the Fellowship paragraph are underlined in the link rule and open in a
new tab.

Five numbered sections follow: the introduction, Selected Research, Education,
Fellowship, and Contact. Fellowship is one ledger with Sequoia Fellow on axis A and a
paragraph on axis B that names the program's organizer and what its fellows share.
Margin indices use the index role; below 768px About hides them, while
Experience and Coursework set theirs above the section headings. Selected Research
lists three manuscripts in one ledger, each with its title, complete summary, and a
Read More link; titles stay outside the link and summaries keep selected bold. Education
names Duke University once above both degree records; degree names use the interface
size at weight 500 on axis B, with compact notes and a dashed hairline between records.
Read More beneath them opens Coursework, and the `#coursework` anchor marks that
entrance. Email, GitHub, and X share one frame with dashed dividers, in three columns
above 540px and stacked at 540px and below.

### Experience and Coursework

Experience is one page of five numbered sections under the directory headed Experience:
Areas of Focus. Entries have no leading markers or category introductions. AI entries
lead with the project name, legal entries with `Duke Law School: {research area}
Research`, and the others with the organization. The AI section opens with its confidentiality note as a
standfirst: directly under the heading, on the same edge, in the reading face and
supporting ink, with a visually hidden heading that labels the aside.

Coursework presents 49 courses in four subject sections, each a framed list at the
reading size: three columns from 1200px and two from 768px, divided by dashed column
rules. Courses keep their official wording and order.

### Detail pages

Each of the eighteen Experience entries opens its own page. The H1 is the project or
paper title; the browser title is `{institution}: {title}`. The record strip follows,
then Key Contributions as an ordered list with decorative serif indices and any
contextual notes as its final items. On the ten pages that are not articles, the Key
Contributions heading hangs on axis A beside its list. A page never repeats the summary
shown on Experience.

### Articles

The four AI articles, four legal articles, and three Selected Research manuscripts
share `ArticleReadingLayout`. The contents rail lists chapters and opens subsections
only for the chapter being read; it is a sticky column when the field has room and a
disclosure when the viewport or text size narrows it. Each AI and legal article opens
with its logic diagram under the record strip.

AI pages present the scope disclosure, Problem and Approach, Key Contributions, and
the numbered manuscript chapters. Selected Research headers hold the title, GitHub
link, and Full Manuscript link; reading begins at Abstract, and appendices and
supporting material link to the pinned manuscript on GitHub. Chapter headings display
Roman numerals and subsections letters in reading order, while source numbering and
anchors stay intact; verified internal section references link to their headings.

Paragraphs are 1.5rem apart. A new chapter begins after 5rem of space, a fine rule, and
2rem of inset (4rem and 1.5rem on phones); subsections are 3rem apart. Equation blocks
have symmetric 2.25rem margins and 0.75rem vertical padding, explicit row spacing, and
no sentence-ending punctuation; wide equations and tables scroll locally at their
natural size with native touch, trackpad, scrollbar, and keyboard navigation. Plain
numbers, including scientific notation and percentages, use the prose face with native
superscripts while keeping accessible MathML and the original TeX. Mathematical SVG
glyphs are artwork, not an additional prose font.

Legal articles keep the source title, subtitle, author, date, abstract, chapter
numbering, paragraph order, citations, and acknowledgments. Chapters are H2 headings in
the heading role at weight 400 and subsections H3 headings in the item-title role;
italics inside subsection headings render upright. Citations, including text marked as
small capitals, use the reading size. Numbered footnote references open the note in a
native dialog: centered on desktop, a bottom sheet with 44px controls on phones. Escape,
the backdrop, and Close return focus to the cited passage; View in Footnotes focuses the
full endnote. Full notes and two-way links work without JavaScript.

### Blog

Blog follows Cognition's blog: an index of posts and posts that present a work and link
to it. The index has the title alone and one ledger of posts, newest first; each entry
hangs its title, with the date beneath in the label role, on axis A and its summary and
Read More on axis B.

A post is one column at the reading measure, starting on the reading-start guide. The
title sits above a byline in the label role (author left, date right) and a hairline. A
hero image follows, then the work: a band tinted 3% ink, without a frame, holding the
work's name in the item-title role, its one-line description in muted serif, and View
Now. The band deepens on hover and View Now turns blue. Section headings use the heading
role at weight 400. An epigraph hangs off the dashed spine in italic serif with its
source in the label role. Figures sit in a faint frame at the column's width with a
caption in supporting ink; a panorama, at least two and a half times as wide as it is
tall, keeps a legible height on phones and scrolls sideways.

## Figures and diagrams

### Logic diagrams

Each AI and legal article opens with a `LogicDiagram`, its visual abstract, drawn from
`app/lib/content/architecture-diagrams.ts`. Four stages read left to right, each holding
one node or one node per lane, with an optional feedback loop to an earlier stage.
Stage labels sit on short rules with blue ticks; nodes are flat panels with a 1px
border, and the stage holding the decisive mechanism is set in ink. Connectors are CSS
on the same grid as the nodes; the loop is the one blue path, labeled beneath. Node
details accept inline TeX. Below 640px of figure width the diagram becomes a vertical
sequence (parallel nodes side by side from 480px) and the loop a labeled return note.
A prose caption follows. The build fails if a stage holds neither one node nor as many
as the widest stage.

### Article figures

Figures inside the eleven full articles take their grammar from Cognition's research
posts: a faint 1px frame, a title at the interface size and weight 500, every chart
label at the label size, axis names in flat gray pills, dashed hairline grids, and a
caption in the reading face and supporting ink below the frame. Ink and the accent carry
the argument; `--chart-sky` marks a second series, `--chart-green` an exactly known
segment, `--chart-steel` and `--chart-mist` hold context, and `--chart-tint` marks an
emphasized row, column, or region.

Text is HTML at its true size, so labels stay legible at every width; only curves live
in a stretched SVG layer whose strokes keep their width, and schematics scale uniformly
so arrows and angles keep their shape. Labels sit in open space beside the marks they
name and never cover a curve. Bar rows align on one grid; in a narrow figure each label
shares a line with its value above a full-width bar. A title stands alone on its line,
with any view switch beneath it as one segmented control.

A segmented switch swaps views, a readout follows the pointer on line charts, marks
show exact values, the proof-obligation graph accepts a chosen failure, and each figure
draws in once as it scrolls into view, except under reduced motion. Every plotted value
restates the manuscript, and conceptual figures carry no numeric scale. Titles,
captions, legends, and axis names use sentence case; view switches use title case.
Captions state what the figure shows in the article's own terms. The dependence
article's four manuscript figures are drawn the same way from the manuscript's formulas,
with its captions below them.

### Research tables

Research tables share the figures' frame. A manuscript caption ("Table N.") becomes the
title inside the frame; the header is a faintly tinted band in label type over a firm
rule; rows part on hairlines; numeric columns align right in tabular figures. The
hovered row and column take a quiet tint and the hovered column's header turns blue; a
row or column the table emphasizes carries the accent tint. Rows enter once, top to
bottom, as a table scrolls into view.

A row of values holds one line. Only a column whose widest cell is a sentence wraps, at
a 16rem minimum, and headings take at most two lines. A table wider than the reading
column closes up its columns if that makes it fit, and otherwise scrolls: its row labels
stay in view when they leave room for the values, and the right edge fades while more
remains.

Every table carries a magnifier in the top-right corner of its frame, on the title's
first line or on the header band. Zoom lifts the table from its place to the center of
the window, on a square sheet with the page blurred behind it. The stage sets the
largest type that keeps every row on one line: 20px, then 18px, then 16px, then closer
columns, then headings on two lines, and only then does it wrap the sentence columns
across the full width. The magnifier, the blurred page, and Escape close the stage and
return focus to the table's own control.

## Clarinet hero

The hero is a Canvas 2D particle field in the shape of a clarinet: a slender beak,
reflective mouthpiece face, six silver ring keys, joint bands and pads, two long rods,
and a flared bell with an elliptical rim and a dark cavity. Every part, including the
ring-key centers and the bell cavity, is made of separated points with transparent gaps;
the cavity uses denser ink points. Four short blue marks define the stage corners. An
open arc of larger, closely spaced blue points passes behind the instrument. A single
solid blue oval and four solid musical notes are the composition's only filled shapes,
drawn with reusable `Path2D` paths. The hero has no call to action or playback control.

Clean mother-shape paths are rasterized into temporary masks when the field is built
or resized; the masks identify the body, fittings, and outlines and are released after
sampling. Silver fittings use separated dark outline points and sparse gray interior
points. Settled points align to device pixels in a transparent cache copied at native
resolution; canvas resolution follows the device pixel ratio, capped at 3, independent
of the CSS coordinates used for physics. Moving points use subpixel edge coverage and
return to their exact cached positions. `alignCanvas`
derives dimensions from the stage and matches the canvas box and origin to its backing
store, including at fractional pixel ratios.

The points gather from seeded positions on entry. A fine pointer gently displaces
nearby points, which spring back; the bell is the steadiest part. Scrolling away
disperses the points in step with scroll progress, and scrolling back restores the
shape, with native document scrolling. The body breathes subtly through opacity while
its points stay fixed and sharp, and the notes drift, turn, scale, and fade on
independent periods while the hero is visible. Physics advances at a fixed 60 Hz with
interpolated rendering; a spatial index activates only nearby particles and repaints
only affected regions. Rendering pauses offscreen and in hidden tabs and resumes without
a jump. Resizing keeps the aspect ratio without replaying the entrance. Reduced motion
shows the complete static field at once. Before the script runs, and without
JavaScript, a same-shape SVG of separated dots stands in.

## Interaction and motion

Hover feedback applies only to fine pointers, and focus is always a visible blue
outline. Anchor links use native scrolling. The mobile menu opens with a short
transition, traps keyboard focus, closes on Escape or navigation, and releases the page
when the viewport reaches desktop width. Editorial surfaces are flat. Two temporary
surfaces lift off the page with a shadow: the note-preview dialog, whose rounded corners
mark its state, and the zoomed table's square sheet. Reduced motion removes every
decorative transition, entrance, and scroll effect.

## Copy

### Case

Page, section, domain, institution, project, course, and post titles use title case,
as do post section headings, navigation, and action labels: Skip to Main Content,
Read More, View Now, Back to Education, Back to Selected Research, Back to Experience,
Back to Blog, Back to Top, Return Home, Full Manuscript, Author Note, and View in
Footnotes. Function words such as "to" and "in" stay lowercase. Manuscript titles and
chapters keep their authored capitalization. Supporting sentences, accessibility
labels, and figure text use sentence case; the architecture viewer uses sentence case
for its tool commands and export menus. Official spellings and acronyms such as GitHub,
AI, ESG, LLM, SHAP, and IPhO are kept, and editorial category labels use "and" while
official course and organization names keep their ampersands.

### Punctuation

Site copy, posts included, uses English punctuation with straight apostrophes and
quotation marks; manuscripts keep the marks they were written with. An em dash may
separate clauses, and an en dash marks ranges. The multiplication sign, ©, mathematical
symbols, legal section and paragraph marks, and diacritics in names are part of the text,
and the architecture viewer's controls use arrows and symbols as icons. No full-width or
CJK punctuation appears anywhere.

### Voice

Public prose is first person singular in the active voice: past tense for Experience
summaries and contributions, present tense for research summaries. Manuscripts keep
their authored voice, and the mathematics papers keep the authorial "we". The home page
title is the name alone. Descriptions state the work directly, without hedges such as
"exploring", and biographical and research claims stay measured. The fellowship is
written `Sequoia Fellow` everywhere: the hero, About's Fellowship section, site metadata
from `app/lib/content/site.ts`, the social card, and the repository README. The
Fellowship paragraph names HongShan as the organizer and describes the program as a
selected community.

## Identity

The LO mark is drawn on a 20-unit grid: the L forms the left and bottom axes, two units
thick, and the O is a ring in the quadrant they enclose, two units clear of each axis.
The rail sets it at 20px beside the name, which is interface type at weight 500, and
draws it inline so it takes the link's color. Its editable master,
`website/source-assets/brand/lo-mark.svg`, is also the browser icon: ink on light
browser chrome and white on dark. The ICO (16, 32, and 48px) and the touch icon place
the same geometry, aligned to whole pixels, in white on an ink tile.

The social card master, `website/source-assets/brand/og.png`, repeats the hero on the
paper background: the name, Duke Alumnus and Sequoia Fellow, the dotted clarinet with
its blue corner marks, and the domain in the lower band. The repository README displays the same card.

## Review

Before a release, review every width from 320 to 2560 pixels, including both sides of
the 768, 1024, and 1200px breakpoints and iPad portrait and landscape sizes; check
keyboard use, enlarged text, reduced motion, and pages without JavaScript. Use the
shared tokens in `app/globals.css`, focused CSS Modules for local surfaces, and semantic
HTML, and match the existing type, measure, and spacing before adding a new pattern. The
[architecture viewer](../architecture/) is a separate technical reference with its own
light and dark themes.
