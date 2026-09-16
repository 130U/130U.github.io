import { createHash } from "node:crypto";

function sourceHash(source) {
  return `'sha256-${createHash("sha256").update(source).digest("base64")}'`;
}

export function secureStaticHtml(source) {
  const html = source.replace(/\r\n?/gu, "\n");
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/giu)]
    .filter(([, attributes]) => !/\bsrc\s*=/iu.test(attributes))
    .map(([, , script]) => sourceHash(script));
  const isArchitecture = /<meta name="generator" content="archify /u.test(html);
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${[...new Set(scripts)].join(" ")}`.trim(),
    isArchitecture
      ? `script-src-attr 'unsafe-hashes' ${sourceHash("this.media='all'")}`
      : "script-src-attr 'none'",
    `style-src 'self' 'unsafe-inline'${isArchitecture ? " https://fonts.googleapis.com" : ""}`,
    `font-src 'self'${isArchitecture ? " https://fonts.gstatic.com" : ""}`,
    `img-src 'self' data:${isArchitecture ? " blob:" : ""}`,
    "connect-src 'self'",
    "media-src 'self' blob:",
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
  return withoutPolicy.replace(/<head\b[^>]*>/iu, (head) => `${head}${policy}`);
}
