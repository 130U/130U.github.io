import { createHash } from "node:crypto";

// A page that another origin frames hides itself; framing by the site's own pages is kept.
export const FRAME_GUARD = 'try{if(top.location.origin!==location.origin)throw 0}catch{document.documentElement.style.display="none"}';
const FRAME_GUARD_TAG = `<script>${FRAME_GUARD}</script>`;

function sourceHash(source) {
  return `'sha256-${createHash("sha256").update(source).digest("base64")}'`;
}

export function secureStaticHtml(source) {
  const html = source.replace(/\r\n?/gu, "\n").replaceAll(FRAME_GUARD_TAG, "");
  const scripts = [FRAME_GUARD, ...[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)]
    .filter(([, attributes]) => !/\bsrc\s*=/iu.test(attributes))
    .map(([, , script]) => script)].map(sourceHash);
  const isArchitecture = /<script id="archify-i18n-data"/u.test(html);
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(scripts)].join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self'",
    // Only the architecture viewer draws images from data and blob URLs, for its exports.
    `img-src 'self'${isArchitecture ? " data: blob:" : ""}`,
    "connect-src 'self'",
    "media-src 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "upgrade-insecure-requests",
  ];
  const policy = `<meta http-equiv="Content-Security-Policy" content="${directives.join("; ")}">`;
  const withoutPolicy = html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/giu, "");
  if (!/<head\b[^>]*>/iu.test(withoutPolicy)) {
    throw new Error("Static HTML must have a head for its content security policy.");
  }
  return withoutPolicy.replace(/<head\b[^>]*>/iu, (head) => `${head}${policy}${FRAME_GUARD_TAG}`);
}
