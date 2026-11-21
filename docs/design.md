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
| Reading: body, summaries, record values, courses, table cells, captions | `--type-reading` | 16px, Source Serif 4 400 | 1.65; 1.75 in manuscripts with mathematics (`--manuscript-leading`) |
| Interface: navigation, contents, Read More, degree names, node titles | `--type-interface`, `--type-action` | 15px, Inter 400; 500 for actions and node titles | 1.5 |
| Label: field labels, diagram and chart text, footer | `--type-label` | 13px, Inter 400 | 1.45 |
| Index: section margin index, directory and contribution numbers | `--type-index` | 11px, Source Serif 4 400 | 1.5 |
| Inline mathematics | | 1em of the surrounding text | The surrounding text's |
| Displayed mathematics | `--type-math` | 1.15em | Rows 1.8217em apart |

Roles use rem units and scale with the reader's text setting. Only titles and headings
step down below 768px. Titles, headings, and item titles use `--title-tracking`,
`--heading-tracking`, and `--subheading-tracking`; reading text, labels, and indices
use none.
Inline `code` inherits the surrounding face, and summaries carry no bold. In Key
Contributions, the lead sentence and results set in bold in the AI manuscript render at
weight 600, so each contribution opens with its claim; italic run-ins and bold theorem
labels belong to the mathematics papers. The hero name is the one display exception:
it scales with the viewport.

Apply a role by meaning: an institution or paper name is an item title even when it is
the page's H1.

## Layout

### Reading frame

The desktop frame is capped at 1440px and divided into 15 columns: a three-column sticky
navigation rail and a twelve-column content field. Tablets between 768px and 1024px use
12 columns, with content running to the right gutter so portrait iPads keep a full line
of prose. Horizontal gutters are 64px on desktop, 32px on tablets, and 20px on phones.
The content field reserves one internal track for margin indices and aligns headings and
prose to the reading track. Structural column guides are decorative, hidden from
assistive technology, and omitted on phones. A guide meets the content edge it marks at
every width; the closing guide on tablets sits on the last column's end, and the closing
guide is drawn on the last pixel column of the frames that end on it, so a frame's edge
and the guide read as one line. The site footer runs from the frame's first guide to the
closing guide, and a page shorter than the window closes on the footer without scrolling
(`--site-footer-height`). Every page
title starts 112px below the top of the content field on desktop and 52px below the
header on phones; the rail's wordmark starts at the same 112px (`--content-top`), so it
sits on the title's line. A landscape phone, under 500px tall, keeps the rail and starts
both at 48px. A page title keeps to four fifths of its column
(`--title-width`); below 1200px, where it stacks above its content, it takes the whole
column less the frame inset, and on phones the whole column, so a long title holds a few
balanced lines and never reaches the closing guide. On a reading page (papers, AI and legal articles) the
title also keeps to the reading measure, so it closes on the same edge as the text and
never reaches the guide that marks the measure. A hyphenated compound in a title
(PCA-Based, Green-Credit) holds one line, so a display line never ends on a hyphen.

The rail takes three columns, or more where its widest fixed item, the parent link Back
to Experience, needs more with its insets (`--rail-item-width`; 12px insets below
1200px): the wordmark keeps the mark beside the name and the parent link holds one line
on every tablet. The extra comes out of the fourth column, the margin-index track before
the reading start, never below the frames' inset (41px at 768, 46px at 1024 as the
narrowest), so the reading start and every column after it stand where the equal grid
puts them; the content column and the sections of About, Experience, and Coursework take
the frame's columns as a subgrid, so an index or a section rule starts where the rail
ends. The rail, reading field, and guides reflow together when text is enlarged. A
longer label, Back to Selected Research, wraps in balanced lines beside its arrow. The rail is as tall as its contents, so the footer
never pushes it, and scrolls internally when they exceed the viewport height.
Below 768px, top-level pages use a 4rem sticky header with a Menu / Close panel; detail
pages show the wordmark and their parent link in the header without a menu, and while
the page scrolls the wordmark row leaves and the return row stays pinned, 53px tall.
Without JavaScript, the links stay visible in normal document flow. Media-query ranges
cover fractional viewport widths continuously.

### Measure

`--reading-measure` (36rem, about seventy characters of Source Serif 4 at the reading
size) caps every narrative container: introductions, standfirsts, stacked ledger prose,
detail pages, captions, posts, and article reading columns. Lines average about 33
characters on a 320px phone (26 inside a frame), 51 to 66 on a portrait iPad, and 72 in
a full reading column; prose on the hanging axis holds 42 at 1200px and 52 from 1440px.
Paragraphs wrap ragged-right with no forced breaks, and long unbroken strings wrap in an
emergency; a word still sets the narrowest width of the column, cell, or label that
holds it, so no word splits because its box was narrowed. Text never runs onto a hairline that bounds it: `--frame-inset` (20 to 24px)
separates the rail's links, a section's margin index, a framed list's numbers, the
text of framed rows on phones (directory, record strip, contact strip), the
contents rail and right-aligned footer actions from their lines, and on tablets, where
running text would otherwise reach the closing guide, `--reading-width` keeps the same
inset. Frames themselves may meet a guide.

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
between titles and prose, on axis B where the column guide stands, with 72px between
entries; below 1200px entries are divided by a dashed line inside the frame. On About,
the contact strip's first divider falls on the same axis as the spine. A section heading
stands 56px above its frame, 32px on phones, on About, Experience, and Coursework.

### Links and actions

Text links share a 1px underline in `--link-rule` at `--link-underline-offset`; hover
and focus turn them blue. Read More is underlined interface text at weight 500 with the
decorative chevron from `ReadingArrow`; its accessible name identifies the destination.
View Now on a post uses the same chevron.

Every return action reads "Back to {destination}" with the decorative arrow from
`ReturnArrow`: Back to Education, Back to Selected Research, Back to Experience, and
Back to Blog. On detail pages it is the parent link beside the wordmark; article,
detail-page, and post footers repeat it beside Back to Top, in one footer: a hairline,
then both actions on one centered 44px row, the return link underlined and Back to Top
plain; both turn blue on hover and keyboard focus. On articles and posts the footer spans
the reading column. Back to Top returns the page to its top, as it opened, and moves
focus to the title; on a page that fits the window it steps aside. The destination of a
return link is the originating section or entry, so the link works after opening a page
directly; a return to the first entry of a section lands on the section, with its
heading above the entry. On phones every section and entry lands half a rem below the
header. The 404
page, on the index guides, offers Return Home with the same arrow, standing off its
sentence by the room the title keeps above that sentence. Parent links have 44px targets; coarse
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
hairlines: two fields per row in equal columns, and one below 540px, as the contact
strip stacks. An entry whose four values together run to at most 80 characters sets
them in one row, each column as wide as its value, once the strip is 53rem wide and so
holds every value on one line; a longer entry keeps two per row, and one with a value
longer than 40 characters stacks its fields where the strip is narrower than 36rem, so no
value folds into one-word lines. Each field is a label above a value in the reading face; a value breaks
only between its parts, after a comma, a semicolon, or a range's dash, or before a
parenthesis, so a place name (North Carolina) or a date (December 2024) holds one line
and no line starts with a dash.

## Pages

### About

About opens with the name beside the clarinet hero; phones and portrait tablets up to
1100px, the 13-inch iPad included, stack the name above the instrument, and a tall
portrait tablet gives the instrument the height the name leaves, so the composition
fills the first screen. From 768px the frame's side lines run the hero's full height
and meet the column guides below it. The name and the institutions Duke and Sequoia use Inter;
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
size at weight 500 on axis B, with compact notes and a dashed hairline between records;
from 1200px the first degree name stands on the baseline of Duke University beside it.
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
reading size: three columns from 1200px and two from 768px, divided by the site's
dashed hairline (4px on, 4px off) drawn on the middle of each column gap. Courses keep
their official wording and order.

### Detail pages

Each of the eighteen Experience entries opens its own page. The H1 is the project or
paper title; the browser title is `{institution}: {title}`. The record strip follows,
then Key Contributions as an ordered list with decorative serif indices; a list of one
stands without an index. Contextual notes are its final items, unnumbered, under a
dashed hairline, in supporting ink, with a leading label run in at the interface size
and weight 500. Contributions wrap with `text-wrap: pretty`, so a paragraph does not end
on one word, and a word that joins numbers, a number and a word (50-member, tier-1), or a
short prefix or an acronym and its word (e-commerce, co-founder, IPhO-level) holds one
line, here and in the legal articles' text. On the ten pages that are not articles, the
Key Contributions heading hangs on axis A beside its list, on its first line's baseline.
Between title and strip and between strip and contributions stand 48px and 72px, 32px
and 48px on phones. A page never repeats the summary shown on Experience.

### Articles

The four AI articles, four legal articles, and three Selected Research manuscripts
share `ArticleReadingLayout`. The contents rail lists chapters and opens subsections
only for the chapter being read; it is a sticky column when the field has room and a
disclosure when the viewport or text size narrows it. The sticky rail shows no
scrollbar: where its list runs past an edge, the entries fade there, and the entry being
read stays clear of the fades with the entry after it in view, brought to two fifths of
the rail's height when it reaches an edge. Each AI and legal article opens
with its logic diagram under the record strip.

AI pages present the scope disclosure, Problem and Approach, Key Contributions, and the
numbered manuscript chapters. Selected Research headers hold the title, GitHub link, and
Full Manuscript link; reading begins at Abstract, and appendices and supporting material
link to the pinned manuscript on GitHub. AI and Selected Research headings show the
manuscript's own numbers (1., 2.1, 7.3.), so "Section 5", "(5.1)" and "Appendix A.5" in
the text match what the reader sees; legal articles keep their manuscripts' Parts (I.,
A.). Anchors stay intact, and verified internal section references link to their headings. The three manuscripts link
their own references alike: an equation by its parenthesized number, a statement, table,
or figure by its number. The dependence manuscript carries these links from its TeX
source; the Asian and Rough Heston manuscripts cite in plain text, and each reference to
an equation, statement, table, or figure the page carries links to it, while a label
cited from another paper stays plain.

Paragraphs are 1.5rem apart. A new chapter begins after 5rem of space, a fine rule, and
2rem of inset (4rem and 1.5rem on phones); subsections are 3rem apart. The manuscripts
that carry mathematics, the three papers and the four AI articles, read at a leading of
1.75 (`--manuscript-leading`, 28px): nine in ten of their lines that hold a formula
reach at most 2px past the reading face's ascenders and descenders, so at 28px such a
line keeps the white a line of prose keeps at 26.4px. Their vertical spaces are measured
in that line (`--manuscript-line`), as a printed page measures them in its leading. A
paragraph break is one line. A statement (Theorem, Lemma, Proposition, Corollary,
Definition, Assumption, Remark), a proof, and a paragraph that opens on a run-in head
start a line and a half below the paragraph before them, as does the paragraph after a
proof's end mark, as amsthm sets a theorem and a proof off and LaTeX a run-in head, so
the steps of an argument read as steps. A display stands in two and a half lines, and a
subsection opens after three lines of margin, more white than a display. Mathematics has
one measure. Every displayed equation is set at 1.15em of the reading size, and one line
of displayed mathematics is one line of the manuscript and a jot (28px and 0.3em, 1.8217em
of the math size), the pitch LaTeX gives aligned rows: aligned, gathered, cases, arrays,
and matrices, nested or not, set their rows that far apart, and a row break that asks for
more space (`\\[2pt]`) adds it, as in TeX. An array inside a formula draws its column and
row rules, which are part of its notation; a display that is one array is a table of
mathematics (see Research tables). A display stands in two and a half lines of white space
(70px), measured from its expression to the descenders of the line above and to the
x-height of the line below, and the same between two displays: its block has 0.75rem of
padding and margins of two lines less 0.5625rem above and less 1.0625rem below, since the
reading face's line box keeps more empty room above its x-height than below its descenders
(two and a half lines less 2.375rem between two displays). Inline mathematics is set at
the reading size, where the drawing's x-height and capitals fall within 2.5% of Source
Serif 4's; the room its drawing keeps for accents lies outside the line, so a line of
prose keeps its leading unless the expression itself reaches past it. An inline formula
stands at the word space, as TeX sets mathematics in a line: nothing widens the space
beside it, so a formula reads as a word of its sentence and a hyphen or a mark of
punctuation closes against it (x₁-slope). Displays carry no sentence-ending punctuation,
after an expression or after the last cell of a table of mathematics; wide equations and
tables scroll locally at their natural size with native touch, trackpad, scrollbar, and
keyboard navigation. Nothing
scrolls for a near miss: a box shows a scrollbar, or a formula its fade, only when its
content is genuinely wider or taller than its room. What overshoots by a little is
fitted, within a bound: a formula is set smaller, to no less than nine tenths of
its size; a table closes up its columns, to no less than an em between them; a figure
comparison or panorama takes its room until that is a tenth short of its scroll width;
a zoomed figure or table is set whole. The browser layout check fails any scroll box
that overflows by less than 16px, or 8% of its room. Every
displayed equation follows one pattern, whatever its length: its ink starts on the
manuscript inset (`--manuscript-inset`, 16 to 24px from the column's edge), the axis it
shares with table text, and its number stands at the column's right edge on the
equation's baseline, in the reading face of the references that cite it, set clear of
the expression. A display holds one formula to a line, at every width: where the
manuscript sets two or more formulas side by side, joined by a quad, a control space or
a run of thin spaces, the page sets them as rows, one formula to a row on the manuscript
inset, one line of mathematics apart as aligned rows are, with the number on the last
row's baseline. The comma that closes a formula ends its row. A qualifier stays on its
formula's row: a condition in parentheses, a phrase that opens on "for", "when" or "on",
a range of a symbol the row holds (s ≥ 0, 0 ≤ θ ≤ 1), or the values an index of the row
runs over (ℓ = P, Q). A connecting word set off by quads ("equivalently", "so that",
"s.t.") opens the row it introduces, and after "s.t." each constraint takes a row, hung
under the first, as an optimization problem is set. One
relation continued after a space (an equivalence, a chain, a limit) is one formula and
keeps its line; a display that an environment aligns at a relation keeps its alignment.
Each row is drawn from its own slice of the TeX, and one assistive expression carries
the whole display, so nothing is drawn or read twice. A stack of rows is fitted or
scrolls as one display. An equation that overshoots its column by a little is fitted: the gap
before its number closes from 1.5em to 1em, and the expression is set smaller, to no
less than nine tenths of its size, so a fitted display still stands above the reading
size. An equation wider than that scrolls in place at its natural size: its number keeps
its position, and the expression fades beneath that edge while more remains, as a wide
table fades at its right edge. At rest the fade always lies over ink: where the edge falls
in a blank between two parts of the expression, the fade reaches back over the last ink
before it, so a display that continues never looks finished. An inline formula that fits
its line is no keyboard stop; one that scrolls is. An inline formula a little wider than a phone's line is
set smaller by the same bound. A page can therefore be read with the paper beside it.
Plain numbers, including scientific notation and percentages, use the prose face with native
superscripts while keeping accessible MathML and the original TeX. Mathematical SVG
glyphs are artwork, not an additional prose font. An inline formula keeps the
punctuation that closes against it and the bracket that opens onto it on its own line,
set tight as the papers set them, unless the formula alone fills a phone's line; a
number range such as 4400–4500 holds one line. "Proof." is italic in all three
manuscripts, as in their PDFs.

Lists and references are set as printed ones. A list hangs its markers in one column
as wide as its widest number: each number stands whole with its period, right-aligned
in tabular figures, so the text keeps the same gap from 9. as from 10.; a bullet stands
at the column's start. A web address or DOI written out in a reference or note breaks
only after "//" or its scheme's colon and before a slash, question mark, or other
separator, never after its own hyphen, and its short ending stays with it. A long
identifier breaks before an inner capital. A contents entry hangs its number, so a
wrapped title continues under its first word.

Legal articles keep the source title, subtitle, author, date, abstract, chapter
numbering, paragraph order, citations, and acknowledgments. Chapters are H2 headings in
the heading role at weight 400 and subsections H3 headings in the item-title role;
italics inside subsection headings render upright. Citations use the reading size. The
manuscripts write a citation's small-capitals fields (authors and titles of books,
periodicals, institutional authors) in capitals; the page sets them in their proper case
in Source Serif 4's own small capitals, with acronyms, initials and Roman numerals at full
height, as a printed law review does. A note reference stands a hair after the word or
punctuation it annotates and never opens a line; on a touch screen its 24px target
reaches past the number without taking room in the line. The author credit's asterisk
is set at the byline's size. Numbered footnote references open the note in a native
dialog: centered on desktop, a bottom sheet with 44px controls on phones, over the
page frosted as it is behind the zoom stage. Escape, the backdrop, and Close return
focus to the cited passage; View in Footnotes focuses the full endnote, whose number
turns blue under a tint that fades. Full notes and two-way links work without
JavaScript. Note numbers stand right-aligned in their column on the baseline of the
note's first line, the author note and the notes run at one interval, each Return to
Text link holds one line, and a page or section range written with a hyphen (373-81,
§§ 3.6-3.7) holds one line. A table's title keeps a figure title's weight, bold runs
and all.

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
caption in supporting ink. An image opens its full-resolution file, so it reads at full
size without JavaScript and can be pinched on a phone; from 768px the whole image is
the zoom control of the stage article figures use, its magnifier shown on a square of
paper in the corner on hover and focus, and always on touch, and the stage enlarges it
as one picture with its caption as the stage's name. A panorama, at least two and a half times as wide as it is
tall, keeps a legible height on phones: it takes the column's width down to 576px and,
in a narrower column, is set 640px wide and scrolls sideways.

## Figures and diagrams

### Logic diagrams

Each AI and legal article opens with a `LogicDiagram`, its visual abstract, drawn from
`app/lib/content/architecture-diagrams.ts`. Four stages read left to right, each holding
one node or one node per lane, with an optional feedback loop to an earlier stage.
Stage labels sit on short rules with blue ticks; nodes are flat panels with a 1px
border, and the stage holding the decisive mechanism is set in ink: its title in paper,
its detail and lane name in 84% paper, above 12:1 on the ink. A lane's name above a
node title is in the label role of the diagram's one face. Lane rows share one height,
so the nodes of a stage are equal and start their titles on one line, a single node
stands on the middle of the lanes, and a line through a bus runs straight. A hyphenated
compound holds one line where its node has room for it.

Connectors are drawn in SVG on the same grid as the nodes: crisp 1px bars placed by
percentages of their grid area, in one opaque color (42% ink on the paper), so a line
keeps one width and one color at every device scale, fractional scales included, and
nothing darkens where bars overlap. The bars of one line overlap at least to each
other's centre line, so no rounding can open a seam; each line leaves and enters a node
at its middle, and its arrowhead is centred on it with the tip on the node's edge. The
loop is one path in the accent the whole way: down from the source node's lower edge,
along the foot of the stages, and up to an arrowhead at the target's lower edge, labeled
beneath.

Node details accept inline TeX, set on the text's baseline: the formula's box clips
its overflow, so its baseline is its lower margin edge, which stands the expression's
depth below the text's baseline (a box that shows or merely clips its overflow takes the
baseline of the drawing's own line and lifts the formula by its 0.375em gutter). It is
set at the site's math size, 1.15em, where the TeX x-height (0.442em) meets Inter's
(0.516em); there its stems are as heavy as Inter Regular's or heavier, so the math takes
no added weight. A formula wider than its node is set smaller to fit, never below nine
tenths of the text; one wider than seven ems may break after a relation at its outer
level, as TeX breaks a formula in a line, and reads as one expression to assistive
technology.

Below 720px of figure width the diagram becomes a vertical sequence (parallel nodes
side by side from 480px): a step down the column's centre joins each stage to the next,
gathering side-by-side nodes through a short bus, and the loop becomes a labeled return
note. A prose caption follows. The build fails if a stage holds neither one node nor as
many as the widest stage, and the browser layout check holds each rule above at every
width.

### Article figures

Figures inside the eleven full articles take their grammar from Cognition's research
posts: a faint 1px frame, a title at the interface size and weight 500, every chart
label at the label size, axis names in flat gray pills, dashed hairline grids, and a
caption in the reading face and supporting ink below the frame. Every axis name starts
on the frame's left edge, with the title and the legend. Figure text keeps the interface
face's proportional figures, so a hyphenated label reads as one word; ticks and values
take tabular figures. A manuscript caption opens with its "Figure N." in the interface
face at weight 500, the face of a table's title, and the rest of the caption follows in
the caption style. Ink and the accent carry the argument; `--chart-sky` marks a second
series, `--chart-green` an exactly known segment, `--chart-steel` and `--chart-mist`
hold context, and `--chart-tint` marks an emphasized row, column, or region.

Text is HTML at its true size, so labels stay legible at every width; only curves live
in a stretched SVG layer whose strokes keep their width, and schematics scale uniformly
so arrows and angles keep their shape. Labels sit in open space beside the marks they
name and never cover a curve: a label is placed clear of every curve, dot, bar and
bracket, never painted over one, and its text stands 4px clear of every curve beyond the
curve's half stroke. The browser layout check fails any label whose text comes nearer,
whose knockout or tag holds a point of a curve, or that overlaps a mark or another label,
at the six check widths and at every column width from 280 to 600px. A
narrow axis hides every other interior tick of an odd count of five or more, never an
end tick, and tick labels keep 6px apart. A grid line gives way to a reference rule
drawn at or within five percent of its value, keeping its tick label, so the two never
read as one doubled line; rules are centred on their values as grid lines are. A label over open paper, with no grid line behind it, takes no knockout, so nothing
cuts a gap in a curve. A label takes the tone of the mark it names: the accent and
green as they are, ink beside a sky or mist mark and muted ink beside a steel one, since
those tones are too light to read as text. A plot's labels are knocked out of the grid
lines and reference rules behind them, on the surface they sit on (the page, or the
sheet on the zoom stage) and 3px past the text, so no line runs through a word; a
stacked bar's label and value reach 4px past their outer letters, so a line at either
end of the scale stops short of them. A label on a tinted region, or one held clear of a
rule by its own padding, takes no knockout and stands clear of the lines, and a label
that names a line at the plot's right end stops short of the edge grid line. The browser
layout check fails any label a line crosses without a knockout that holds it, and any
label that ignores its tone, and any legend swatch with no mark of its form and colour.
Bar rows align on one grid, the label column taking at most 42% of the chart; a value's
note stands beneath it, so a column's values share one right edge. A reference rule's
name stands beside the top of its rule, 6px clear of it, and the rule runs up through
the header and any group rows to it; a column's head starts or ends at its position. In
a narrow figure each row sets its label and value on one line above a full-width bar,
the value wrapping beneath only when the two cannot share it, and rows part by more
than a label stands from its own bar; the grid runs through the bar's own row only, and
a reference rule runs on through the label and value lines behind their knocked-out
text. A comparison has a scroll width below which its columns cannot
reflow; it takes its column's width down to nine tenths of that, and in less room it is
set at its scroll width, scrolls sideways and fades at its right edge, as a wide table
does. Labels that hang beside its last marks keep their room inside it. A title stands
alone on its line, its hyphenated compounds held whole, with any view switch beneath it
as one segmented control across the head's width: its segments share the width evenly
while each keeps its label's width, and where the labels cannot share one row they
stack, four in two columns and three in one. Views whose heights differ by no more than
15% or 60px share the tallest one's height, so the page beneath never moves for a near
match; views further apart keep their own heights rather than show blank paper, and the
frame eases to the shown view's height in 150ms (at once under reduced motion) below the
switch, which stays where it was pressed. The browser layout check fails any view that
leaves more than 60px and 15% of its height blank beneath its content.

The legal articles' diagrams draw their connectors and arrowheads in the logic
diagram's one tone, and their plots hold every label's text at least 4px clear of every
curve at every width. A two-by-two matrix reflows rather than scrolls: beside its row
heads where the figure is wide, with each row head as a band over its row below 34rem,
and with its cells stacked below 21rem, each naming its column. Its cells share their
edges, drawn once at the frame's weight, and the cells of a row share their title,
definition and example lines. A numbered step hangs its number, so a wrapped title
continues under its first word, and a bracket beside a run of steps opens toward them.
A decision procedure runs each answer's arrow into the hatched result lane until it
meets its result, and a bracket gathers a group of results; in a narrow figure the
questions stand on one spine, and each answer that ends the procedure leaves it on an
elbow to its result. A chain of links sets each observation beside its link, and
beneath it, set in to the title, in a phone's figure.

A segmented switch swaps views, a readout follows the pointer on line charts (at the
plot's top, or at its foot where it would cover a label), marks
show exact values, the proof-obligation graph accepts a chosen failure, and each figure
draws in once as it scrolls into view, except under reduced motion. Every plotted value
restates the manuscript, and conceptual figures carry no numeric scale. Titles,
captions, legends, and axis names use sentence case; view switches use title case.
Captions state what the figure shows in the article's own terms. The four manuscript
figures of each of the three papers are drawn the same way, from the manuscript's
formulas and its pinned results, with the manuscript's captions below them. A scatter is
a field of gray points with the paths that matter as toned markers; a leading term is a
dotted line beside its solid curve; circles, squares and triangles keep the roles a
caption gives them. Two bounds on one quantity are two solid curves in distinct tones
with the gap between them tinted, and a comparison across candidates stacks one panel
for each on a shared axis.

A key result stated as an interval or a bound is drawn on its own scale, after the
sentence that states it, beside what it is measured against: an earlier bound, a quoted
band, a tolerance, or a value it rules out. Figure and number read as one: a proved
interval is a line with end caps in the accent, and its endpoints stand over its caps,
the lower starting at its cap and the upper ending at its own, so the row reads as the
bracket it draws; the key interval's endpoints take the accent at weight 500. A row that
restates a numbered display carries the display's number in the reading face of the
equation numbers, so (1.3) in the figure is the (1.3) of the text. An interval known by
one end has a cap there, with its bound written over it, and runs to an arrowhead at the
end of the axis. Every mark and line is named beside it, so a key-result figure carries
no legend, and secondary numbers (allowances, standard errors, ratios) live in its
readouts. One figure holds one idea: a comparison the text makes elsewhere is drawn there,
as Table 1's first-order comparison follows the paragraph that states it. Where an
interval is too narrow for its axis, a strip beneath magnifies a window: the window is
tinted on the rows above, its edges run down through the axis row, clear of its labels,
and open onto the full width of the strip, whose marks carry their own notes, a note to
the left of its mark standing as far from it as one to the right. The caption
says in one or two sentences what the drawing shows and what the reader cannot see in it;
the argument stays in the text. A test holds each figure to the text it restates and to
these rules, and the browser layout check fails any two of its numbers or notes that
touch.

### Research tables

Research and legal tables share the figures' frame. Every manuscript table carries a
caption ("Table N." and one sentence), which becomes the title inside the frame, and a
table of mathematics takes its title from its sentence (below); the header is a faintly tinted band in label type over a firm
rule; rows part on hairlines; numeric columns align right in tabular figures, while
their headings keep proportional figures. Under a mouse, the hovered row and column take
a quiet tint and the hovered column's header turns blue, while a tap lights nothing; a row or column the table emphasizes carries
the accent tint. Rows enter once, top to bottom, as a table scrolls into view.

A row of values holds one line. A column whose widest cell is a sentence wraps, at a
16rem minimum; a column of phrases (cells of two words or more, as a contract's name or
"75.0% (accepts 1,800 flawed solutions)") holds one line while its table fits, and wraps,
to about half its widest phrase, in a table with a column of sentences or one that would
otherwise scroll. A heading takes at most two lines, or three over a column of values, as
a printed table stacks a long head over a narrow column of figures. In a table with a
column of sentences, the columns of values keep their content's width and leave the rest
of the row to the text. A column of row labels that holds numbers aligns right in tabular
figures, as every column of values does, and an inline formula in a cell stands on the
cell's baseline, as in prose. A table set as two halves side by side under one repeated
heading parts them by a second em.

A table wider than the reading column closes up its columns, by as much as it needs and
to no less than an em between them, if that makes it fit; a table of two halves then
sets its second half under its first, the same rows in the same order under the one
heading; then its phrases and row labels wrap and two or more sentence columns share the
room, to no less than 10rem each, closed up again if need be. A table wider than that
scrolls at its natural spacing: its row labels, wrapped to no more than 45% of its room
and 16rem, stay in view whenever they take no more than half of it, or whenever the room
they leave beside them, short of the fading edge, holds a column of values whole, and the
values pass beneath them; several sentence columns keep their shared width where the room holds the
labels and two of them, and otherwise each fills the room beside the labels, at most
16rem, so one whole column reads at a time; the right edge fades while more remains.

A display that is one array, and nothing else but its equation number, is a table of
mathematics, and it is set as a research table: frame, header band, hairline rows,
hover, magnifier and stage, and row labels kept in view as it scrolls. It still ends its
sentence: the prose around it is the manuscript's, and the sentence's closing
punctuation after its last cell is not drawn. The manuscript gives it no caption, so it
takes as its title the words of its sentence that name what it holds, the subject the
sentence sets equal to it ("the four regime slopes are"), in sentence case; a table whose
sentence names nothing ("Then") stands untitled. The row the manuscript rules off, or
the first row of a table whose first column it rules off, is the header band, its first
cell heading the row labels; a table the manuscript does not rule has no header band,
and its first row parts from its title on a hairline. The first column holds the row
labels, aligned left; a column of numbers (figures, fractions, intervals and bounds)
aligns right, as in every research table, and any other column keeps the manuscript's
alignment, its head aligned with it. Each cell's TeX is drawn by the math pipeline in
text style, as TeX sets an array's cells, at the table's size, the reading size, the
header band included: there its x-height (TeX's 0.442em of 16px, 7.07px) stands at the
label type's (Inter's 0.516em of 13px, 6.70px), and its smallest script is half the
reading size, as in a line of prose. A cell that is text alone (`\text{…}`) is set as text in
the table's faces, label type in the header band and the reading face for a row label,
in sentence case and without a closing colon, which in the sentence introduced the
values its columns now hold. In a fractional part of five digits or more, the digits are
grouped in threes from the point by a thin space, in the drawing alone, as the SI and
ISO 80000 group them. Every cell of a row stands on the
row's baseline. A numbered table stands its number beneath its frame at the column's
right edge, where every equation number stands, in the reading face of the references
that cite it; the number stays in the article when the table is zoomed, as a caption
does. The drawing is decorative: one assistive expression carries the whole display and
its TeX, so a table of mathematics counts as one formula.

Every table and figure carries a magnifier where the stage shows more than the page:
where it enlarges the table or figure by at least 1.15 times, or sets whole what the
page scrolls. On a phone, where the stage is barely wider than the column, a figure that
fits its column, and a table the stage would not set whole, carry none; the magnifier
never promises what the stage does not do. A table's magnifier stands in the top-right
corner of its frame, on the title's first line or on the header band; a table without a
title that scrolls would carry its headings beneath it, so there the control takes a row
of its own above the header. Where the control stands on the header band of a table of
mathematics, the last column keeps clear of it in every row, as its head does, so a head
over values aligned right stays over them. Zoom lifts the table from its place to the center of
the window, on a square sheet with the page blurred behind it. The stage sets the
largest type that keeps every row on one line: 20px, then 18px, then 16px, then closer
columns, then headings on two lines, a table of two halves folding only when no step
holds it side by side; then it wraps the columns of sentences and phrases across the
full width, at 18px and 16px and, before the table scrolls, at as little as nine tenths
of the reading size. A table too wide even then scrolls at the reading size with its row
labels in view, as in the article. The magnifier, the blurred page, and Escape close the
stage and return focus to the table's own control.

A figure's magnifier stands in the top-right corner of its frame, level with the first
line of its title or axis name; where a label holds that corner at the current width,
the control takes a row of its own above the figure. Zoom enlarges the figure on the
same stage as one picture, laid out at its width in the article so every label keeps its
place, or, where a comparison scrolls in the article, at that comparison's scroll width,
so the stage shows it whole: whole within the window up to 1.75 times its size, or, when
that would enlarge it by less than 1.15 times, at up to 1.5 times its size with the stage
scrolling from its top, unless the whole figure fits at nine tenths of that size, where
it is set whole. A zoomed table a little taller than the window is set smaller, to no
less than nine tenths of the reading size, and one a little wider closes up its columns,
before either scrolls. Readouts and view switches work on the stage; the caption stays
in the article. One stage serves every table and figure of a page.

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
outline; in the rail's navigation, whose rows stand 27px apart, it is drawn inside the
row. A heading that an in-page link moves focus to is a target, not a control, and shows
no ring. Anchor links use native scrolling. The mobile menu opens with a short
transition, traps keyboard focus, closes on Escape or navigation, and releases the page
when the viewport reaches desktop width. Editorial surfaces are flat. Two temporary
surfaces lift off the page with a shadow: the note-preview dialog, whose rounded corners
mark its state, and the square sheet of a zoomed table or figure. Reduced motion removes
every decorative transition, entrance, and scroll effect.

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
[architecture viewer](../architecture/) is a technical reference drawn in the site's
palette: paper, ink and hairlines, square corners, one theme, no bullets before titles,
and the site's Return Home link above its title. Its drawing is read at its own size:
node titles at the label role and every other label at 11px or more, so a drawing
wider than its stage scrolls sideways, its right edge fading while more remains, as a
wide table's does, and the semantic radar shows the whole system. It opens with the
region that holds its first node at the stage's top-left; on a phone the stage is a
window that scrolls both ways, so its first screen is never blank paper. Present and Export stand on the title's row, the three notes share
one frame divided by dashed hairlines, and the site footer closes the page.

## Print

A printed page is the reading column alone on white paper, with book margins
(`app/print.css`, imported once by the root layout). The skip link, rail or phone
header, column guides, contents, zoom controls and the footers' return links stay on
screen. Every mark a figure, table or diagram draws prints whatever the browser's
background setting (`print-color-adjust: exact`), and figures, tables, diagrams,
displays and images never split across pages; a heading stays with what follows it.
Figures print as they stand once drawn in. Nothing scrolls on paper: a display or a
table formula wider than the page is set smaller to the page's width and keeps its
number, and comparisons, panoramas and wide tables show whole.
