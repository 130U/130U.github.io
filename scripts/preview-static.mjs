import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const host = process.env.PREVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.PREVIEW_PORT ?? 8123);
const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, {
      Allow: "GET, HEAD",
      "Content-Type": "text/plain; charset=utf-8",
    });
    response.end("Method not allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(request.url ?? "/", `http://${host}:${port}`).pathname,
    );
  } catch {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad request");
    return;
  }

  const relativePath =
    pathname.endsWith("/") || !extname(pathname)
      ? join(pathname, "index.html")
      : pathname;

  try {
    const absolutePath = resolve(root, relativePath.replace(/^[/\\]+/, ""));
    if (!absolutePath.startsWith(`${root}${sep}`)) {
      throw new Error("Requested path is outside the static export.");
    }

    const file = await readFile(absolutePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(relativePath)] ?? "application/octet-stream",
    });
    response.end(request.method === "HEAD" ? undefined : file);
  } catch {
    try {
      const notFound = await readFile(join(root, "404.html"));
      response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : notFound);
    } catch {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end(request.method === "HEAD" ? undefined : "Not found");
    }
  }
}).listen(port, host, () => {
  console.log(`Static preview available at http://${host}:${port}`);
});
