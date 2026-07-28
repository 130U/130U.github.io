import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "github-pages");
const routes = [
  { requestPath: "/", outputPath: "index.html" },
  { requestPath: "/education", outputPath: "education/index.html" },
  { requestPath: "/past-experience", outputPath: "past-experience/index.html" },
  { requestPath: "/personal-posts", outputPath: "personal-posts/index.html" },
];
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("export", `${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

const clientRoot = join(root, "dist", "client");

for (const route of routes) {
  const response = await worker.fetch(
    new Request(`https://130u.github.io${route.requestPath}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          try {
            const file = url.pathname.replace(/^\/+/, "");
            return new Response(await readFile(join(clientRoot, file)));
          } catch {
            return new Response("Not found", { status: 404 });
          }
        },
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (!response.ok) {
    throw new Error(`Failed to export ${route.requestPath}: ${response.status}`);
  }

  const destination = join(output, route.outputPath);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, await response.text(), "utf8");
}

await cp(clientRoot, output, { recursive: true, force: true });
await writeFile(join(output, ".nojekyll"), "", "utf8");

console.log(`Exported ${routes.length} routes to ${output}`);
