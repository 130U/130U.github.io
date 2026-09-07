import { copyFile, lstat, mkdir, readdir, rename, rmdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function normalizeSegmentPayloads(directory) {
  const root = path.resolve(directory);
  const moves = [];
  const emptyDirectories = [];
  const destinations = new Set();

  function contained(candidate) {
    const relative = path.relative(root, candidate);
    if (!relative || relative.startsWith(`..${path.sep}`) || relative === ".." || path.isAbsolute(relative)) {
      throw new Error("Segment payload paths must remain inside the static export.");
    }
    return candidate;
  }

  async function visit(current, segmentRoot) {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const source = contained(path.join(current, entry.name));
      if (entry.isSymbolicLink()) throw new Error("Static export entries must not be symbolic links.");
      if (entry.isDirectory()) {
        const nestedRoot = segmentRoot ?? (entry.name.startsWith("__next.") ? source : undefined);
        await visit(source, nestedRoot);
        if (nestedRoot) emptyDirectories.push(source);
      } else if (segmentRoot) {
        if (!entry.isFile() || !entry.name.endsWith(".txt")) {
          throw new Error("Segment directories may contain only text payload files.");
        }
        // RSC payload names use dot-delimited segment paths.
        const filename = [path.basename(segmentRoot), ...path.relative(segmentRoot, source).split(path.sep)].join(".");
        const destination = contained(path.join(path.dirname(segmentRoot), filename));
        if (destinations.has(destination)) throw new Error(`Duplicate segment payload: ${destination}`);
        destinations.add(destination);
        try {
          await lstat(destination);
          throw new Error(`Segment payload destination already exists: ${destination}`);
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        moves.push({ source, destination });
      }
    }
  }

  await visit(root);
  for (const { source, destination } of moves) await rename(source, destination);
  for (const directory of emptyDirectories) await rmdir(contained(directory));
  return moves.length;
}

async function assembleStaticExport() {
  const destination = new URL("../out/architecture/", import.meta.url);
  const normalized = await normalizeSegmentPayloads(fileURLToPath(new URL("../out/", import.meta.url)));
  await mkdir(destination, { recursive: true });
  for (const filename of ["index.html", "LICENSE"]) {
    await copyFile(new URL(`../../architecture/${filename}`, import.meta.url), new URL(filename, destination));
  }
  console.log(`Assembled /architecture/ and ${normalized} segment payload filenames.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await assembleStaticExport();
}
