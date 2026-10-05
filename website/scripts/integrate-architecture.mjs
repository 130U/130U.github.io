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
    .toolbar { max-width: calc(100% - 2rem); flex-wrap: wrap; }
    .toolbar > button, .toolbar > .preset-wrap, .toolbar > .export-wrap { min-width: 0; }
    .toolbar button { max-width: 100%; white-space: normal; }
    .diagram-container { container: diagram / inline-size; }

    @container viewer (width < 60rem) {
      html:not([data-embed="true"]):not([data-present="true"]) .toolbar {
        position: relative;
        inset: auto;
        width: 100%;
        max-width: 100%;
        justify-content: flex-end;
        gap: 8px;
        margin: 0 0 20px;
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

function applyReaderLayout(viewer) {
  if (viewer.includes("data-site-reader-layout")) {
    return viewer.replace(/  <style data-site-reader-layout>[\s\S]*?  <\/style>/u, readerRules);
  }
  return viewer.replace("</head>", `${readerRules}\n</head>`);
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
    "viewer.radar.compacted": "Radar compacted to avoid covering the semantic passport or MAP controls.",
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
    .replaceAll("Vector &amp; motion</span>", "Vector and motion</span>");
}

let source = original.replaceAll(".card h3", ".card h2")
  .replace(/(<div class="card-header">[\s\S]*?)<h3>([^<]+)<\/h3>/gu, "$1<h2>$2</h2>")
  .replace(/\n(?:      \/\/[^\n]*\n)+      try \{\n        if \(new URLSearchParams\(window\.location\.search\)\.get\('openExport'\) === '1'\) \{[\s\S]*?\n      \} catch \(_\) \{\}/u, "");
assert.equal((source.match(/<h2>/gu) ?? []).length, 3, "Expected three major information cards.");
source = source.replace(/(\.card h2\s*\{[^}]*font-weight:)\s*[^;]+;/gu, "$1 400;");
source = source.replace(/(\.semantic-passport-reach-actions strong\s*\{[^}]*font-size:)\s*[^;]+;/gu,
  "$1 var(--type-interface);");
source = source.replace(/(\.semantic-passport-reach-actions strong\s*\{[^}]*line-height:)\s*[^;]+;/gu,
  "$1 var(--interface-leading);");
source = applyViewerLabels(source);

if (source.includes("data-site-typography")) {
  assert.doesNotMatch(source, /fonts\.googleapis|fonts\.gstatic|JetBrains|Georgia|Times New Roman/u);
  source = source.replace(/    :root \{\n(?:      --[^\n]+\n)+    \}(?:\n\n    @media \(width < 768px\) \{\n      :root \{[\s\S]*?\n      \}\n    \})?/u, typeRules);
  assert.ok(source.includes(typeRules));
  source = applyReaderLayout(source);
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
    '  <link rel="preload" href="../assets/fonts/InterVariable.woff2" as="font" type="font/woff2" crossorigin>');

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
      if (role === "title") updated = updated.replace(/font-weight:\s*[^;}]+;/gu, "font-weight: 400;");
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
  viewer = viewer.replace(/svg \{ font-family: 'JetBrains Mono'[^}]+\}/gu,
    "svg { font-family: 'Inter', sans-serif; font-optical-sizing: auto; font-synthesis: none; }");
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

  viewer = applyReaderLayout(viewer);
  assert.doesNotMatch(viewer, /fonts\.googleapis|fonts\.gstatic|JetBrains|Georgia|Times New Roman/u);
  const svgMarkup = (source) => [...source.matchAll(/<svg\b[\s\S]*?<\/svg>/gu)].map(([svg]) => svg);
  assert.deepEqual(svgMarkup(viewer), svgMarkup(original), "Typography integration must preserve SVG markup.");
  await writeFile(viewerUrl, viewer);
  console.log("Integrated shared Inter, HTML type roles, and embedded export fonts.");
}
