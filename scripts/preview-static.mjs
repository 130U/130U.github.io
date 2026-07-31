import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../github-pages/", import.meta.url)));
const host = process.env.PREVIEW_HOST ?? "127.0.0.1";
const port = Number(process.env.PREVIEW_PORT ?? 8123);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(
    new URL(request.url ?? "/", `http://${host}:${port}`).pathname,
  );
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
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Static preview available at http://${host}:${port}`);
});
