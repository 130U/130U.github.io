import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import minimatch, * as named from "minimatch";

const require = createRequire(import.meta.url);
const ROOT = fileURLToPath(new URL("../", import.meta.url));
const providerRequire = createRequire(require.resolve("minimatch"));

test("CommonJS and ESM consumers share the v11 engine without installation scripts", () => {
  const provider = require("minimatch/package.json");
  assert.equal(provider.name, "@theodoreoy/minimatch-compat");
  assert.equal(provider.dependencies["minimatch-engine"], "npm:minimatch@11.0.1");
  assert.equal(provider.scripts, undefined);
  const engine = providerRequire("minimatch-engine/package.json");
  assert.equal(engine.name, "minimatch");
  assert.equal(engine.version, "11.0.1");

  for (const dependency of [
    "eslint", "@eslint/config-array", "@eslint/eslintrc",
    "eslint-plugin-import", "eslint-plugin-react", "eslint-plugin-jsx-a11y",
    "@typescript-eslint/typescript-estree", "glob",
  ]) {
    const consumerRequire = createRequire(require.resolve(dependency));
    assert.equal(consumerRequire("minimatch/package.json").name, provider.name, dependency);
  }
});

test("CommonJS callable, ESM default, and modern named exports agree", () => {
  assert.equal(require("minimatch"), minimatch);
  assert.equal(named.minimatch, minimatch);
  assert.equal(named.Minimatch, minimatch.Minimatch);
  assert.equal(named.GLOBSTAR, providerRequire("minimatch-engine").GLOBSTAR);
  assert.equal(minimatch.Minimatch.GLOBSTAR, named.GLOBSTAR);
  for (const helper of ["defaults", "filter", "makeRe", "match", "braceExpand", "escape", "unescape"]) {
    assert.equal(named[helper], minimatch[helper], helper);
  }
  assert.equal(named.unescape(named.escape("a*b[1]")), "a*b[1]");
});

test("lint path patterns, component patterns, and partial directory matching retain their behavior", () => {
  const fixtures = [
    ["app/example/page.tsx", "**/*.{js,jsx,ts,tsx}", {}, true],
    ["app/example/page.txt", "**/*.{js,jsx,ts,tsx}", {}, false],
    ["app/.private/page.tsx", "**/*.tsx", {}, false],
    ["app/.private/page.tsx", "**/*.tsx", { dot: true }, true],
    ["app/page.tsx", "*.tsx", { matchBase: true }, true],
    ["UI/Button", "ui/*", { nocase: true }, true],
    ["InputField", "@(Input|Select)*", {}, true],
    ["SelectField", "Input*", {}, false],
    ["#literal", "#*", {}, false],
    ["#literal", "#*", { nocomment: true }, true],
    ["app/page.tsx", "!**/*.js", {}, true],
    ["app/page.js", "!**/*.js", { flipNegate: true }, true],
    ["app/page.tsx", "!**/*.js", { flipNegate: true }, false],
    ["app/deep/page.tsx", "**/*.tsx", { noglobstar: true }, false],
    ["C:/site/app/page.tsx", "C:/site/**/*.tsx", { platform: "win32" }, true],
  ];
  for (const [path, pattern, options, expected] of fixtures) {
    assert.equal(minimatch(path, pattern, options), expected, `${path}: ${pattern}`);
    assert.equal(new minimatch.Minimatch(pattern, options).match(path), expected);
  }

  const directoryMatcher = new minimatch.Minimatch("app/**/page.tsx");
  assert.equal(directoryMatcher.pattern, "app/**/page.tsx");
  assert.equal(directoryMatcher.match("app/example", true), true);
  assert.equal(directoryMatcher.match("other/example", true), false);
  assert.equal(directoryMatcher.match("app/example"), false);
  assert.equal(minimatch.Minimatch("*.js").match("file.js"), true);
  assert.ok(new minimatch.Minimatch("*") instanceof minimatch.Minimatch);
});

test("helpers and chained defaults preserve option precedence", () => {
  assert.deepEqual(minimatch.braceExpand("app/{a,b}.tsx"), ["app/a.tsx", "app/b.tsx"]);
  assert.deepEqual(["a.js", "b.ts"].filter(minimatch.filter("*.js")), ["a.js"]);
  assert.deepEqual(minimatch.match(["a.js"], "*.ts", { nonull: true }), ["*.ts"]);
  assert.equal(minimatch.defaults({}), minimatch);
  assert.equal(minimatch.Minimatch.defaults({}), minimatch.Minimatch);

  const insensitive = minimatch.defaults({ nocase: true, dot: true });
  assert.equal(insensitive(".FILE.TS", "*.ts"), true);
  assert.equal(insensitive(".FILE.TS", "*.ts", { nocase: false }), false);
  assert.equal(insensitive.defaults({ dot: false })(".FILE.TS", "*.ts"), false);
  assert.equal(insensitive.defaults({ dot: false })("FILE.TS", "*.ts"), true);
  assert.deepEqual(insensitive.match([".FILE.TS", "file.js"], "*.ts"), [".FILE.TS"]);
  assert.equal(insensitive.filter("*.ts")(".FILE.TS"), true);
  assert.equal(insensitive.makeRe("*.ts").test(".FILE.TS"), true);

  const DefaultMatcher = minimatch.Minimatch.defaults({ dot: true });
  assert.equal(new DefaultMatcher("*").match(".file"), true);
  assert.equal(new DefaultMatcher("*", { dot: false }).match(".file"), false);
  const NestedMatcher = DefaultMatcher.defaults({ nocase: true });
  assert.equal(new NestedMatcher("*.ts").match(".FILE.TS"), true);
});

test("the makeRe().test() interface delegates to nonrecursive matching", () => {
  const matcher = minimatch.makeRe("@scope/*");
  assert.equal(matcher instanceof RegExp, false);
  assert.equal(matcher.test("@scope/package"), true);
  assert.equal(matcher.test("@other/package"), false);
  assert.equal(new minimatch.Minimatch("*.tsx").makeRe().test("page.tsx"), true);
});

test("the existing import lint rule still enforces forbidden submodules", () => {
  const { Linter } = require("eslint");
  const importPlugin = require("eslint-plugin-import");
  const config = [{
    plugins: { import: importPlugin },
    rules: { "import/no-internal-modules": ["error", { forbid: ["example/**"] }] },
  }];
  const linter = new Linter();
  const forbidden = linter.verify('import value from "example/private";', config);
  assert.equal(forbidden.length, 1);
  assert.equal(forbidden[0].ruleId, "import/no-internal-modules");
  assert.equal(forbidden[0].severity, 2);
  assert.deepEqual(linter.verify('import value from "example";', config), []);
});

test("ESLint still distinguishes source files and generated directories using absolute paths", async () => {
  const { ESLint } = require("eslint");
  const eslint = new ESLint({
    cwd: ROOT,
    overrideConfigFile: true,
    overrideConfig: [
      { ignores: [".next/**", "out/**"] },
      { files: ["**/*.{js,ts,tsx}"], rules: { "no-undef": "error" } },
    ],
  });
  assert.equal(await eslint.isPathIgnored(join(ROOT, ".next/server/page.js")), true);
  assert.equal(await eslint.isPathIgnored(join(ROOT, "out/page.js")), true);
  assert.equal(await eslint.isPathIgnored(join(ROOT, "app/example/page.tsx")), false);
  const [result] = await eslint.lintText("undeclaredValue();", { filePath: join(ROOT, "app/example.js") });
  assert.equal(result.messages[0].ruleId, "no-undef");
  assert.equal(result.errorCount, 1);
});

test("globparts amplification is bounded by the upstream security patch", () => {
  // Based on the official fix's preprocess-limits.ts cases. A separate process
  // with a hard timeout also bounds failure if a vulnerable engine returns.
  const result = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import assert from "node:assert/strict";
    import { Minimatch } from "minimatch";
    const pattern = Array(30).fill("**/../a/b").join("/");
    const bounded = new Minimatch(pattern, { optimizationLevel: 2, braceExpandMax: 64 });
    assert.equal(bounded.set.length, 64);
    const small = new Minimatch("**/../a/b/**/../c/d", { optimizationLevel: 2 });
    assert.equal(small.set.length, 4);
    assert.equal(small.match("x/a/b/y/c/d"), true);
    const large = new Minimatch("{x,*}/{0..999}", { optimizationLevel: 2 });
    assert.equal(large.set.length, 2000);
    assert.equal(large.match("y/999"), true);
    assert.equal(large.match(".y/5"), false);
    process.stdout.write("bounded");
  `], { cwd: ROOT, encoding: "utf8", timeout: 10000 });
  assert.equal(result, "bounded");
});
