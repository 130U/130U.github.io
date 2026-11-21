import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const viewerUrl = new URL("../../architecture/index.html", import.meta.url);
const original = (await readFile(viewerUrl, "utf8")).replace(/\r\n?/gu, "\n");
const globals = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
const roles = ["title", "heading", "subheading", "reading", "interface", "label"];
const tokens = roles.flatMap((role) => [`--type-${role}`, `--${role}-leading`]);
const declarations = tokens.map((token) => {
  const value = globals.match(new RegExp(`${token}:\\s*([^;]+);`, "u"))?.[1];
  assert.ok(value, `Missing shared typography token: ${token}`);
  return `      ${token}: ${value};`;
}).join("\n");
const mobileRoot = globals.match(/@media \(width < 768px\) \{\s*:root \{([^}]+)\}/u)?.[1];
assert.ok(mobileRoot, "Missing shared mobile typography.");
const mobileDeclarations = tokens.flatMap((token) => {
  const value = mobileRoot.match(new RegExp(`${token}:\\s*([^;]+);`, "u"))?.[1];
  return value ? [`        ${token}: ${value};`] : [];
}).join("\n");
const typeRules = `    :root {\n${declarations}\n    }\n\n` +
  `    @media (width < 768px) {\n      :root {\n${mobileDeclarations}\n      }\n    }`;
const readerRules = `  <style data-site-reader-layout>
    body {
      container-name: viewer;
      container-type: inline-size;
      overflow-wrap: anywhere;
    }
    .container, .header, .header-row, .header-row h1,
    .cards, .card, .card-header, .card-header h2 {
      min-width: 0;
    }
    .header-row h1, .card-header h2 { max-width: 100%; }
    .pulse-dot, .card-dot { flex: 0 0 auto; }
    .cards { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
    .toolbar { max-width: 100%; flex-wrap: wrap; }
    .toolbar > button, .toolbar > .preset-wrap, .toolbar > .export-wrap { min-width: 0; }
    .toolbar button { max-width: 100%; white-space: normal; }
    .diagram-container { container: diagram / inline-size; }
    .site-return {
      display: inline-flex;
      min-height: 44px;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
      color: var(--text);
      font-size: var(--type-interface);
      line-height: var(--interface-leading);
      text-decoration: underline;
      text-decoration-color: var(--text-dim);
      text-decoration-thickness: 1px;
      text-underline-offset: 0.18em;
    }
    .site-return svg {
      flex: 0 0 16px;
      width: 16px;
      min-width: 0;
      height: 16px;
      transform: none;
      transition: none;
    }
    html[data-embed="true"] .site-return, html[data-present="true"] .site-return { display: none; }

    @container viewer (width < 60rem) {
      html:not([data-embed="true"]):not([data-present="true"]) .toolbar {
        position: static;
        inset: auto;
        width: auto;
        max-width: 100%;
        justify-content: flex-start;
        gap: 8px;
        margin: 0;
      }
      html:not([data-embed="true"]):not([data-present="true"]) .header {
        padding-right: 0;
      }
      .toolbar #theme-label, .toolbar #preset-label, .toolbar #present-label {
        display: inline;
      }
      .toolbar button, .toolbar #btn-preset, .toolbar #btn-motion, .toolbar #btn-export {
        min-width: 44px;
        min-height: 44px;
        padding: 4px 8px;
        gap: 6px;
      }
      .toolbar-icon { width: 18px; height: 18px; }
      .preset-control-mark { width: 18px; height: 18px; }
      .header-row { flex-wrap: wrap; gap: 8px; }
      .header-row h1 { flex-basis: 100%; }
      .card { padding: 20px; }
      .card-header { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; }
      .header-row h1, .card-header h2 { hyphens: auto; }
    }

    @container diagram (width < 48rem) {
      html:not([data-embed="true"]):not([data-present="true"]) .diagram-nav {
        position: relative;
        inset: auto;
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        max-width: 100%;
        gap: 4px;
        margin-top: 12px;
        padding: 4px;
        overflow: visible;
      }
      .diagram-nav button {
        flex: 0 1 auto;
        min-width: min(44px, 100%);
        max-width: 100%;
        height: auto;
        min-height: 44px;
        padding: 2px 6px;
        white-space: normal;
      }
      .diagram-nav #btn-route-probe, .diagram-nav #btn-overview-map, .diagram-nav #btn-semantic-lens {
        min-width: min(44px, 100%);
        padding-inline: 6px;
      }
      .diagram-nav [data-view="reset"] { min-width: min(72px, 100%); }
      .diagram-nav [data-view="reset"][data-detail-visible] { min-width: min(88px, 100%); }
    }
  </style>`;

// The site has one palette: the paper, the ink and hairlines. Every viewer
// theme and preset resolves to it, so the theme and preset switches have
// nothing to switch and are hidden.
const site = Object.fromEntries(["page", "ink", "muted", "link-rule", "frame", "rule-medium", "rule-strong", "panel", "dash"].map((token) => {
  const value = globals.match(new RegExp(`--${token}:\\s*([^;]+);`, "u"))?.[1];
  assert.ok(value, `Missing shared color token: --${token}`);
  return [token, value.trim()];
}));
const categories = ["frontend", "backend", "database", "cloud", "security", "messagebus", "external"];
const palette = {
  bg: site.page, grid: "transparent", text: site.ink, "text-muted": site.muted, "text-dim": site["link-rule"], "text-faint": site.muted,
  panel: site.page, "panel-border": site.frame, "lane-fill": "transparent", "lane-stroke": site["rule-strong"],
  arrow: site["link-rule"], "arrow-emphasis": site.ink, mask: site.page,
  ...Object.fromEntries(categories.flatMap((category) => [[`${category}-fill`, site.page], [`${category}-stroke`, category === "external" ? site.muted : site.ink]])),
  "toolbar-bg": site.page, "toolbar-border": site["rule-medium"], "toolbar-text": site.ink, "toolbar-hover": site.page, "toolbar-menu-bg": site.page,
  "site-panel": site.panel, "site-dash": site.dash,
};
const themeRules = `  <style data-site-theme>
    :root, [data-theme], [data-preset] {
${Object.entries(palette).map(([name, value]) => `      --${name}: ${value} !important;`).join("\n")}
    }
    body { background: var(--bg); }
    #btn-theme, #btn-preset, .preset-wrap { display: none !important; }
    .pulse-dot, .card-dot { display: none !important; }
    *:not(.pulse-dot):not(.motion-control-dot) { border-radius: 0 !important; }
  </style>`;

// The viewer returns to the site the way every page does: the Return Home link
// with the site's return arrow, above the title.
const returnLink = '      <a class="site-return" href="/" data-site-return><svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="none"><path d="M13 8H3m0 0 4-4M3 8l4 4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>Return Home</a>\n';

function applyReturnLink(viewer) {
  const cleared = viewer.replace(/      <a class="site-return"[^\n]*<\/a>\n/u, "");
  assert.ok(/    <div class="header">\n/u.test(cleared), "Missing viewer header.");
  return cleared.replace(/    <div class="header">\n/u, (header) => header + returnLink);
}

function applySiteTheme(viewer) {
  if (viewer.includes("data-site-theme")) {
    return viewer.replace(/  <style data-site-theme>[\s\S]*?  <\/style>/u, themeRules);
  }
  return viewer.replace("</head>", `${themeRules}\n</head>`);
}

function applyReaderLayout(viewer) {
  if (viewer.includes("data-site-reader-layout")) {
    return viewer.replace(/  <style data-site-reader-layout>[\s\S]*?  <\/style>/u, readerRules);
  }
  return viewer.replace("</head>", `${readerRules}\n</head>`);
}

function applyExportTypography(viewer) {
  const rule = "svg { font-family: 'Inter', sans-serif; font-optical-sizing: none; font-variation-settings: 'opsz' 14; font-variant-numeric: lining-nums proportional-nums; font-synthesis: none; }";
  return viewer.replace(/svg \{ font-family: '(?:Inter|JetBrains Mono)'[^}]+\}/gu, rule);
}

function applyViewerLabels(viewer) {
  const labels = {
    "viewer.owner.route": "route probe",
    "viewer.owner.lens": "semantic lens",
    "viewer.owner.relationship": "relationship preview",
    "viewer.owner.intent": "intent trace",
    "viewer.guide.present": "Enter presentation stage",
    "viewer.guided.selectBeatLink": "Select a story beat to copy its exact link",
    "viewer.guide.map.hint": "Open semantic radar with a live viewport and stable nodes.",
    "viewer.radar.focus": "Focus {label} from semantic radar",
    "viewer.radar.compacted": "Radar compacted to avoid covering the semantic passport or map controls.",
    "viewer.radar.space": "Semantic radar needs more map space.",
    "viewer.radar.needsSpace": "Semantic radar needs more visible map space",
    "viewer.radar.cancelWaiting": "Cancel semantic radar waiting for more map space",
    "viewer.nav.route.short": "Path",
    "viewer.nav.radar.short": "Map",
    "viewer.nav.lens.short": "Lens",
    "viewer.nav.read": "Read",
    "viewer.nav.level.map": "Map",
    "viewer.nav.level.read": "Read",
    "viewer.nav.level.full": "Full",
    "viewer.nav.level.auto": "Auto",
    "viewer.nav.detail.read": "Zoom in to reveal tags and annotations",
    "viewer.nav.camera": "Reset diagram view. {hint}",
    "viewer.export.shareCard": "Share card",
    "viewer.export.routeShareCard": "Route share card",
    "viewer.export.reachShareCard": "Reach share card",
    "viewer.export.copyShareCard": "Copy share card",
    "viewer.export.vectorMotion.heading": "Vector and motion",
    "viewer.export.unknownVariant": "Unknown share card variant: {variant}",
    "viewer.export.routeRequired": "Trace a route before exporting a route share card",
    "viewer.export.reachRequired": "Trace authored reach before exporting a reach share card",
    "viewer.export.routeFailed": "Route share card export failed: {message}",
    "viewer.export.reachFailed": "Reach share card export failed: {message}",
    "viewer.export.copiedShare": "Copied share card",
    "viewer.export.downloadedShare": "Downloaded share card",
    "viewer.export.downloadedRoute": "Downloaded route share card",
    "viewer.export.downloadedReach": "Downloaded reach share card",
    "viewer.export.error.variantsCombined": "Share card variants cannot be combined",
    "viewer.export.error.viewerState": "Share card export could not remove temporary viewer state",
    "viewer.export.error.routeState": "Route card export could not preserve the resolved route safely",
    "viewer.export.error.reachState": "Reach card export could not preserve authored reach safely",
  };
  for (const [key, value] of Object.entries(labels)) {
    const pattern = new RegExp(`("${key.replaceAll(".", "\\.")}":)"[^"]*"`, "u");
    assert.ok(pattern.test(viewer), `Missing viewer label: ${key}`);
    viewer = viewer.replace(pattern, (_, prefix) => `${prefix}${JSON.stringify(value)}`);
  }
  return viewer
    .replaceAll("Enter Presentation Stage", "Enter presentation stage")
    .replaceAll("Select a Story Beat to copy its exact link", "Select a story beat to copy its exact link")
    .replaceAll("Open Semantic Radar with", "Open semantic radar with")
    .replaceAll("<strong>Share Card</strong>", "<strong>Share card</strong>")
    .replaceAll("<strong>Route Share Card</strong>", "<strong>Route share card</strong>")
    .replaceAll("<strong>Reach Share Card</strong>", "<strong>Reach share card</strong>")
    .replaceAll("<strong>Copy Share Card</strong>", "<strong>Copy share card</strong>")
    .replaceAll("Vector &amp; motion</span>", "Vector and motion</span>")
    .replaceAll('title="Trace route (R)">PATH</button>', 'title="Trace route (R)">Path</button>')
    .replaceAll('title="Semantic radar (M)">MAP</button>', 'title="Semantic radar (M)">Map</button>')
    .replaceAll('title="Semantic lens (L)">LENS</button>', 'title="Semantic lens (L)">Lens</button>')
    .replaceAll("data-view-detail hidden>READ</span>", "data-view-detail hidden>Read</span>")
    .replaceAll("Semantic radar needs more MAP space.</p>", "Semantic radar needs more map space.</p>");
}

// The drawing is read at its own size: node titles at the label role (13px,
// eleven SVG units at 13/11 pixels a unit) and every other label at no less
// than 11px. It keeps that size at every width and scrolls sideways from its
// first stage, as the viewer's phone layout already did; zoom enlarges it
// further, and the radar shows the whole system.
const READING_SCALE = 13 / 11;
const SMALL_LABEL_UNITS = 9.5;

function diagramRules(viewer) {
  const viewBox = viewer.match(/<svg viewBox="0 0 ([\d.]+) ([\d.]+)" role="img"/u);
  assert.ok(viewBox, "Missing the diagram's viewBox.");
  const width = Math.ceil(Number(viewBox[1]) * READING_SCALE);
  const labelScale = (from) => (SMALL_LABEL_UNITS / from).toFixed(4);
  const live = 'html:not([data-embed="true"]):not([data-present="true"])';
  const wide = `${live} .diagram-container[data-wide-diagram="true"]`;
  const drawing = ".diagram-container > svg";
  return `  <style data-site-diagram>
    :root {
      --site-dash-x: repeating-linear-gradient(to right, var(--site-dash) 0 4px, transparent 4px 8px);
      --site-dash-y: repeating-linear-gradient(to bottom, var(--site-dash) 0 4px, transparent 4px 8px);
    }
    /* The page: the site's 1440px frame and gutters, its footer, flat
       surfaces, and Present and Export on the title's row. */
    body { padding: 2rem 64px 0; }
    .container { max-width: 1312px !important; }
    .header-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 24px; }
    .header-row > .toolbar { position: static; inset: auto; z-index: auto; margin: 0; }
    html:not([data-embed="true"]) .header,
    html[data-present="true"]:not([data-embed="true"]) .header { padding-right: 0; }
    .toolbar, .toolbar button, .export-menu, .preset-menu, .diagram-container, .cards, .card, .diagram-nav,
    .diagram-nav button, .overview-map, .focus-chip, .route-probe, .semantic-lens, .diagram-guide, .node-finder {
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
    .diagram-container { border: 1px solid var(--panel-border); background: var(--bg); }
    ${wide} {
      overflow-x: auto;
      overflow-y: hidden;
      overscroll-behavior-x: contain;
      padding: 12px;
      scrollbar-width: thin;
      scrollbar-color: var(--lane-stroke) transparent;
    }
    /* From a 48rem stage the view controls float in a strip under the drawing;
       on a narrower one they follow it in flow. */
    @media (width >= 832px) { ${wide} { padding-bottom: 64px; } }
    ${wide} > svg { width: ${width}px; min-width: ${width}px; max-width: none; height: auto; }
    ${wide} :is(.diagram-nav, .overview-map, .focus-chip, .route-probe, .semantic-lens, .diagram-guide, .node-finder) {
      transform: translateX(var(--archify-scroll-x, 0px));
    }
    .diagram-nav { background: var(--bg); border: 1px solid var(--toolbar-border); }
    .diagram-nav button { font-weight: 500; letter-spacing: 0; }
    .diagram-nav-icon { width: 14px; height: 14px; }

    /* The drawing in the site's terms: square corners, flat panels on a 1px
       hairline, regions drawn by the dashed hairline without a fill, labels
       in two weights, and generic glyphs only. */
    ${drawing} rect { rx: 0; ry: 0; }
    ${drawing} .c-region { fill: none; stroke: var(--site-dash); stroke-width: 1px; stroke-dasharray: 4 4; vector-effect: non-scaling-stroke; }
    ${drawing} :is(.c-frontend, .c-backend, .c-database, .c-cloud, .c-security, .c-messagebus, .c-external) {
      fill: var(--site-panel);
      stroke: var(--lane-stroke);
      stroke-width: 1px;
      vector-effect: non-scaling-stroke;
    }
    ${drawing} .brand-mark { display: none; }
    ${drawing} text[data-node-label], ${drawing} [data-boundary-label], ${drawing} [data-legend] > text { font-weight: 500; }
    ${drawing} [data-legend] g text { font-weight: 400; }
    ${drawing} [data-node-id] text[data-detail],
    ${drawing} g[data-edge-label] > text,
    ${drawing} [data-boundary-label],
    ${drawing} [data-legend-count-badge] text { font-size: ${SMALL_LABEL_UNITS}px; }
    ${drawing} g[data-edge-label] > .c-mask {
      transform-box: fill-box;
      transform-origin: center;
      transform: scale(${labelScale(8)}, 1.1);
    }
    ${drawing} [data-graph-role="structural-frame-label-mask"] {
      transform-box: fill-box;
      transform-origin: 0 50%;
      transform: scale(${labelScale(9)}, 1.1);
    }

    /* The three notes share one frame, divided by dashed hairlines: one
       column, three from 1024px, with hanging bullets. */
    .cards { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0; margin-top: 24px; border: 1px solid var(--panel-border); }
    .card { margin: 0; padding: 28px 24px 30px; border: 0 !important; background: none !important; }
    .card + .card { background: var(--site-dash-x) left top / 100% 1px no-repeat !important; }
    .card ul { padding: 0; }
    .card li { position: relative; padding-left: 1em; }
    .card li::before { content: "\\2022"; position: absolute; left: 0; }
    @media (width >= 1024px) {
      .cards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .card + .card { background: var(--site-dash-y) left top / 1px 100% no-repeat !important; }
    }

    .site-footer {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      margin: 72px 0 0;
      padding: 25px 0 34px;
      border-top: 1px solid var(--lane-stroke);
      color: var(--text-muted);
      font-size: var(--type-label);
      line-height: var(--label-leading);
      letter-spacing: 0.015em;
    }
    .site-footer p { margin: 0; }
    html[data-embed="true"] .site-footer, html[data-present="true"] .site-footer { display: none; }

    /* Below 480px the view controls keep two aligned rows: the tools, then
       zoom with its three controls together. */
    @container diagram (width < 30rem) {
      ${live} .diagram-nav { flex-wrap: wrap; }
      ${live} .diagram-nav::after { content: ""; order: 1; flex-basis: 100%; height: 0; }
      ${live} .diagram-nav :is([data-view="out"], [data-view="reset"], [data-view="in"]) { order: 2; }
      ${live} .diagram-nav [data-view="out"] { margin-left: auto; }
      .diagram-nav #btn-node-finder::before, .diagram-nav [data-view="out"]::before { display: none; }
    }
    @media (768px <= width < 1024px) { body { padding-inline: 32px; } }
    @media (width < 768px) { body { padding: 1.5rem 20px 0; } }
  </style>`;
}

function applySiteDiagram(viewer) {
  const rules = diagramRules(viewer);
  if (viewer.includes("data-site-diagram")) {
    return viewer.replace(/  <style data-site-diagram>[\s\S]*?  <\/style>/u, () => rules);
  }
  return viewer.replace("</head>", () => `${rules}\n</head>`);
}

const siteFooter = '\n    <footer class="site-footer" data-site-footer>\n      <p>&copy; 2026 Theodore Ouyang</p>\n      <p>Beijing | Boston</p>\n    </footer>\n';

// Markup the integration owns: no generator stamp, the site's browser color
// and touch icon, square corners in the drawing, Present and Export on the
// title's row, bullets drawn by the stylesheet so they hang, and the footer.
function applyViewerMarkup(viewer) {
  viewer = viewer.replace(/  <meta name="generator" content="[^"]*">\n/u, "");
  if (!viewer.includes('<meta name="theme-color"')) {
    viewer = viewer.replace(/(  <meta name="viewport"[^\n]*\n)/u, '$1  <meta name="theme-color" content="#f7f6f5">\n');
  }
  if (!viewer.includes('rel="apple-touch-icon"')) {
    viewer = viewer.replace(/(  <link rel="icon" href="\/assets\/brand\/lo-mark\.svg"[^\n]*\n)/u, '$1  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png" sizes="180x180">\n');
  }
  const svgStart = viewer.indexOf('<svg viewBox="0 0 ');
  const svgEnd = viewer.indexOf("</svg>", svgStart);
  assert.ok(svgStart > 0 && svgEnd > svgStart, "Missing the diagram.");
  viewer = viewer.slice(0, svgStart) + viewer.slice(svgStart, svgEnd).replace(/(<rect\b[^>]*?) rx="[\d.]+"/gu, '$1 rx="0"') + viewer.slice(svgEnd);
  const toolbar = viewer.match(/  <!-- Toolbar:[\s\S]*?\n  <div class="toolbar"[\s\S]*?\n  <\/div>\n\n(?=  <div class="container">)/u);
  if (toolbar) {
    viewer = viewer.replace(toolbar[0], () => "");
    const moved = toolbar[0].replace(/^  <!--[\s\S]*?-->\n/u, "").trimEnd().replace(/^/gmu, "      ");
    viewer = viewer.replace(/(        <h1>[^<]*<\/h1>\n)/u, (heading) => `${heading}${moved}\n`);
  }
  assert.ok(/<div class="header-row"[\s\S]*?<div class="toolbar"/u.test(viewer), "Present and Export belong on the title's row.");
  const cards = /    <!-- Info Cards -->\n    <div class="cards">[\s\S]*?\n    <\/div>\n/u;
  assert.ok(cards.test(viewer), "Missing the viewer's notes.");
  viewer = viewer.replace(cards, (block) => block.replaceAll("<li>&bull; ", "<li>"));
  if (!viewer.includes("data-site-footer")) viewer = viewer.replace(cards, (block) => block + siteFooter);
  return viewer;
}

// The phone layout's sideways scrolling serves every width once the drawing
// is wider than its stage: camera moves scroll to a node instead of scaling
// the drawing below its reading size.
function applyViewerScript(viewer) {
  const wide = "(container.hasAttribute('data-wide-diagram') && container.scrollWidth > container.clientWidth + 1)";
  return viewer
    .replaceAll("window.innerWidth <= 720 && container.hasAttribute('data-wide-diagram')", wide)
    .replace("if (window.innerWidth > 720) return frameDesktop(ids, options);", `if (!${wide}) return frameDesktop(ids, options);`);
}

let source = original.replaceAll(".card h3", ".card h2")
  .replace(/(<div class="card-header">[\s\S]*?)<h3>([^<]+)<\/h3>/gu, "$1<h2>$2</h2>")
  .replace(/\n(?:      \/\/[^\n]*\n)+      try \{\n        if \(new URLSearchParams\(window\.location\.search\)\.get\('openExport'\) === '1'\) \{[\s\S]*?\n      \} catch \(_\) \{\}/u, "");
assert.equal((source.match(/<h2>/gu) ?? []).length, 3, "Expected three major information cards.");
source = source.replace(/(\.card h2\s*\{[^}]*font-weight:)\s*[^;]+;/gu, "$1 400;");
source = source.replace(/(line-height: var\(--(?:title|heading)-leading\);\s+font-weight:)\s*\d+;/gu, "$1 400;");
source = source.replace(/(\.semantic-passport-reach-actions strong\s*\{[^}]*font-size:)\s*[^;]+;/gu,
  "$1 var(--type-interface);");
source = source.replace(/(\.semantic-passport-reach-actions strong\s*\{[^}]*line-height:)\s*[^;]+;/gu,
  "$1 var(--interface-leading);");
source = applyViewerLabels(source);
source = applyExportTypography(source);

if (source.includes("data-site-typography")) {
  assert.doesNotMatch(source, /fonts\.googleapis|fonts\.gstatic|JetBrains|Georgia|Times New Roman/u);
  source = source.replace(/    :root \{\n(?:      --[^\n]+\n)+    \}(?:\n\n    @media \(width < 768px\) \{\n      :root \{[\s\S]*?\n      \}\n    \})?/u, typeRules);
  assert.ok(source.includes(typeRules));
  source = applyReturnLink(applySiteTheme(applyReaderLayout(source)));
  source = applyViewerScript(applyViewerMarkup(applySiteDiagram(source)));
  if (source !== original) await writeFile(viewerUrl, source);
  console.log("Architecture typography matches the website.");
} else {
  function replaceOnce(source, pattern, replacement) {
    assert.ok(pattern.test(source), `Generated viewer integration point missing: ${pattern}`);
    return source.replace(pattern, replacement);
  }

  function textRole(selector) {
    if (/data-present/u.test(selector) && /\bh1\b/u.test(selector)) return "interface";
    if (/\bh1\b/u.test(selector)) return "title";
    if (/\.card h2/u.test(selector)) return "heading";
    if (/\.subtitle\b|(?:semantic-lens|route-probe|relationship-lens|diagram-guide)-title|node-finder-head strong|overview-map-copy strong|export-menu-header strong/u.test(selector)) return "subheading";
    if (/\.card ul|semantic-lens-instruction|semantic-passport-detail|relationship-lens-summary|relationship-lens-empty/u.test(selector)) return "reading";
    if (/\b(?:button|input)\b|(?:-close|-expand|-play|-all|-stop|-node|-beat-link)\b|(?:preset-option-copy|export-item-copy|guided-view-copy|node-finder-result|share-chapter-copy|semantic-lens-kind|relationship-lens-row|diagram-guide-action|semantic-passport-reach-actions) strong|guided-view-chapter-title/u.test(selector)) return "interface";
    return "label";
  }

  let viewer = replaceOnce(source, /  <!-- Async font load:[\s\S]*?<\/noscript>/u,
    '  <link data-site-typography rel="stylesheet" href="../assets/fonts/inter.css">\n' +
    '  <link rel="preload" href="../assets/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '  <link rel="icon" href="/assets/brand/favicon.ico" sizes="16x16 32x32 48x48">\n' +
    '  <link rel="icon" href="/assets/brand/lo-mark.svg" type="image/svg+xml" sizes="any">');

  viewer = replaceOnce(viewer, /  <style>\n([\s\S]*?)  <\/style>/u, (_, stylesheet) => {
    let css = stylesheet.replace(/font-family:\s*[^;}]+;/gu, "font-family: var(--font-text, 'Inter', sans-serif);");
    css = css.replace(/([^{}]+)\{([^{}]*)\}/gu, (rule, selector, body) => {
      if (!/font-size\s*:/u.test(body) || /\b(?:svg|text)\b|\.t-|\.c-/u.test(selector)) return rule;
      const role = textRole(selector);
      let updated = body.replace(/font-size:\s*[^;}]+;/gu, `font-size: var(--type-${role});`);
      if (/line-height\s*:/u.test(updated)) {
        updated = updated.replace(/line-height:\s*[^;}]+;/gu, `line-height: var(--${role}-leading);`);
      } else {
        updated = updated.replace(/font-size:[^;]+;/u, (size) => `${size}\n      line-height: var(--${role}-leading);`);
      }
      if (role === "title" || role === "heading") updated = updated.replace(/font-weight:\s*[^;}]+;/gu, "font-weight: 400;");
      return `${selector}{${updated}}`;
    });
    css = replaceOnce(css, /    body \{\n/u,
      "    body {\n      font-size: var(--type-reading);\n      line-height: var(--reading-leading);\n");
    return `  <style>\n${typeRules}\n\n${css}  </style>`;
  });

  const fontLoader = `
      var exportFontCss = '';
      var exportFontsPromise;

      function embedFont(filename, fontStyle) {
        return fetch(new URL('../assets/fonts/' + filename, document.baseURI))
          .then(function (response) {
            if (!response.ok) throw new Error('Font asset unavailable');
            return response.blob();
          })
          .then(function (blob) {
            return new Promise(function (resolve, reject) {
              var reader = new FileReader();
              reader.onload = function () { resolve(reader.result); };
              reader.onerror = function () { reject(reader.error); };
              reader.readAsDataURL(blob);
            });
          })
          .then(function (dataUrl) {
            return '@font-face { font-family: "Inter"; font-style: ' + fontStyle +
              '; font-weight: 100 900; src: url("' + dataUrl + '") format("woff2"); }';
          });
      }

      function prepareExportFonts() {
        if (!exportFontsPromise) {
          exportFontsPromise = Promise.all([
            embedFont('InterVariable.woff2', 'normal'),
            embedFont('InterVariable-Italic.woff2', 'italic')
          ]).then(function (faces) {
            exportFontCss = faces.join('\\n');
          }).catch(function () {
            exportFontCss = '';
          });
        }
        return Promise.all([
          exportFontsPromise,
          document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()
        ]);
      }

      prepareExportFonts();
`;
  viewer = replaceOnce(viewer, /      var SHARE_CARD_HEADER = 112;\n/u, (declaration) => declaration + fontLoader);
  viewer = replaceOnce(viewer, /        \/\/ Derive the variable list[\s\S]*?        var varNames/u,
    "        // Include every declared theme variable in standalone exports.\n        var varNames");
  viewer = replaceOnce(viewer, /        \/\/ Prepend a local\(\)-only[\s\S]*?        var style =/u,
    "        var fontFaces = exportFontCss;\n\n        var style =");
  viewer = viewer.replaceAll("fontFallback +", "fontFaces +");
  viewer = viewer.replace(/'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace/gu,
    "'Inter', sans-serif");
  for (const [name, argument] of [["rasterize", "format"], ["renderShareCard", "options"], ["recordWebm", "options"]]) {
    viewer = replaceOnce(viewer, new RegExp(`      function ${name}\\(${argument}\\) \\{`, "u"),
      `      function ${name}(${argument}) {\n` +
      `        return prepareExportFonts().then(function () { return ${name}WithFonts(${argument}); });\n` +
      `      }\n\n      function ${name}WithFonts(${argument}) {`);
  }
  viewer = replaceOnce(viewer, /Promise\.resolve\(serializeSvg\(1, \{ autoTheme: true \}\)\)/u,
    "prepareExportFonts().then(function () { return serializeSvg(1, { autoTheme: true }); })");

  viewer = applySiteTheme(applyReaderLayout(viewer));
  assert.doesNotMatch(viewer, /fonts\.googleapis|fonts\.gstatic|JetBrains|Georgia|Times New Roman/u);
  const svgMarkup = (source) => [...source.matchAll(/<svg\b[\s\S]*?<\/svg>/gu)].map(([svg]) => svg);
  assert.deepEqual(svgMarkup(viewer), svgMarkup(original), "Typography integration must preserve SVG markup.");
  viewer = applyViewerScript(applyViewerMarkup(applySiteDiagram(applyReturnLink(viewer))));
  await writeFile(viewerUrl, viewer);
  console.log("Integrated shared Inter, HTML type roles, and embedded export fonts.");
}
