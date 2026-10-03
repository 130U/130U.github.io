import { globSync as discover, isDynamicPattern } from "tinyglobby";
import { resolve } from "node:path";

function directoryPath(value) {
  return value === "/" || /^[A-Za-z]:\/$/u.test(value) ? value : value.replace(/\/$/u, "");
}

export function globSync(patterns, options = {}) {
  const input = Array.isArray(patterns) ? patterns : [patterns];
  const cwd = options.cwd || process.cwd();
  const directories = input.flatMap((pattern) => {
    const prefix = pattern.endsWith("/**") ? pattern.slice(0, -2) : undefined;
    const dynamic = prefix !== undefined && isDynamicPattern(prefix);
    // A recursive wildcard includes its matching directory at zero depth.
    const roots = dynamic ? [pattern, prefix] : pattern;
    const matches = discover(roots, { ...options, expandDirectories: false }).map(directoryPath);
    if (prefix === undefined || dynamic) return matches;
    const parent = resolve(cwd, prefix);
    return matches.filter((directory) => resolve(cwd, directory) !== parent);
  });
  return [...new Set(directories)];
}
