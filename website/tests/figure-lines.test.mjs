import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { architectureDiagrams } from "../app/lib/content/architecture-diagrams.ts";
import { HORIZONTAL_FROM, SIDE_BY_SIDE_FROM, horizontalWidth, interfaceWidth, sideBySide } from "../app/lib/content/diagram-layout.ts";

// A figure's short texts hold one line (docs/design.md, Article figures and
// Logic diagrams). The browser layout check measures every one at every width;
// these tests hold the sources that give them their room.

const read = (relative) => readFile(new URL(`../${relative}`, import.meta.url), "utf8");

test("every logic diagram holds its titles side by side from its left-to-right width", () => {
  const diagrams = Object.values(architectureDiagrams);
  assert.equal(diagrams.length, 8);
  for (const diagram of diagrams) {
    const needs = horizontalWidth(diagram);
    assert.ok(needs <= HORIZONTAL_FROM, `${diagram.stages.map((stage) => stage.label).join(" / ")}: its stages need ${needs.toFixed(1)}px side by side; the diagram reads left to right from ${HORIZONTAL_FROM}px.`);
  }
});

test("the diagram's breakpoints are the layout's widths in rem", async () => {
  const css = await read("app/components/experience/LogicDiagram.module.css");
  const rem = (px) => `${px / 16}rem`;
  assert.ok(css.includes(`@container diagram (width < ${rem(HORIZONTAL_FROM)})`), "The vertical sequence starts below the left-to-right width.");
  assert.ok(css.includes(`@container diagram (${rem(SIDE_BY_SIDE_FROM)} <= width < ${rem(HORIZONTAL_FROM)})`), "Parallel nodes stand side by side from the width the layout measures them at.");
  assert.match(css, /\.nodeTitle \{[^}]*white-space: nowrap;/u);
  assert.match(css, /\.tag \{[^}]*white-space: nowrap;/u);
  assert.match(css, /\.stageLabel \{[^}]*white-space: nowrap;/u);
});

test("a stage sets its nodes side by side only where each title holds one line there", () => {
  const stages = Object.values(architectureDiagrams).flatMap((diagram) => diagram.stages).filter((stage) => stage.nodes.length > 1);
  assert.ok(stages.some(sideBySide) && stages.some((stage) => !sideBySide(stage)), "Some stages stand side by side and some stack.");
  // A three-node stage whose longest title is wider than a third of the width less the insets stacks.
  for (const stage of stages.filter((item) => item.nodes.length === 3)) {
    const widest = Math.max(...stage.nodes.map((node) => interfaceWidth(node.title, 15, 500, -0.003)));
    assert.equal(sideBySide(stage), 3 * (Math.ceil(widest) + 31) + 16 <= SIDE_BY_SIDE_FROM, stage.label);
  }
});

test("figure labels and switch segments never wrap", async () => {
  const kit = await read("app/components/figures/kit.tsx");
  const css = await read("app/components/figures/Figure.module.css");
  assert.doesNotMatch(kit, /\bwrap\?: boolean/u, "A label takes no wrapping option.");
  assert.doesNotMatch(css, /\[data-wrap\]/u);
  assert.match(css, /\.mark \{[^}]*white-space: nowrap;/u);
  assert.doesNotMatch(css, /\.switch[^{]*button \{[^}]*white-space: normal/u, "A switch segment's label holds one line.");
  assert.match(css, /\.legend li \{[^}]*white-space: nowrap;/u);
  assert.match(css, /\.barLabel \{[^}]*white-space: nowrap;/u);
  const directory = new URL("../app/components/figures/", import.meta.url);
  for (const name of (await readdir(directory)).filter((file) => file.endsWith(".tsx"))) {
    const source = await readFile(new URL(name, directory), "utf8");
    for (const mark of source.matchAll(/<Mark\b[^>]*>/gu)) assert.doesNotMatch(mark[0], /\swrap(?:[\s=>])/u, `${name}: ${mark[0].slice(0, 80)}`);
    assert.doesNotMatch(source, /<br\s*\/>/u, `${name}: a label of two lines sets each on a line of its own (labelLine), not a line break.`);
  }
});
