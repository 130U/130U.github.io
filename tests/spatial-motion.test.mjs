import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");

async function loadSpatialMotion() {
  const source = await readFile(
    path.join(ROOT, "app", "components", "particle-background", "spatial-motion.ts"),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const moduleUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`;
  return import(moduleUrl);
}

test("spatial drag mapping is linear at first and rubber-banded at its hard boundary", async () => {
  const { mapDragAngle } = await loadSpatialMotion();
  const softLimit = (3.5 * Math.PI) / 180;
  const hardLimit = (4.2 * Math.PI) / 180;

  assert.ok(Math.abs(mapDragAngle(0, 90, 180, softLimit, hardLimit) - softLimit / 2) < 1e-12);
  assert.ok(Math.abs(mapDragAngle(0, 180, 180, softLimit, hardLimit) - softLimit) < 1e-12);
  assert.ok(mapDragAngle(0, 720, 180, softLimit, hardLimit) < hardLimit);
  assert.ok(mapDragAngle(0, -720, 180, softLimit, hardLimit) > -hardLimit);
});

test("spatial return is critically damped, interruptible, and cannot cross neutral", async () => {
  const { advanceCriticalSpring } = await loadSpatialMotion();
  const axis = { value: (4 * Math.PI) / 180, velocity: (8 * Math.PI) / 180 };
  let previousSign = Math.sign(axis.value);

  for (let frame = 0; frame < 120; frame += 1) {
    advanceCriticalSpring(axis, 1 / 60, 0.5);
    assert.ok(axis.value === 0 || Math.sign(axis.value) === previousSign);
    previousSign = axis.value === 0 ? previousSign : Math.sign(axis.value);
  }

  assert.ok(Math.abs(axis.value) < 0.000_01);
  assert.ok(Math.abs(axis.velocity) < 0.000_01);
});

test("a critical spring can be retargeted without crossing its latest target", async () => {
  const { advanceCriticalSpringTo } = await loadSpatialMotion();
  const axis = { value: 0, velocity: 0 };

  for (let frame = 0; frame < 18; frame += 1) {
    advanceCriticalSpringTo(axis, 1, 1 / 60, 0.55);
  }
  assert.ok(axis.value > 0 && axis.value < 1);

  let previousDistance = Math.abs(axis.value - 0.25);
  for (let frame = 0; frame < 120; frame += 1) {
    advanceCriticalSpringTo(axis, 0.25, 1 / 60, 0.55);
    const distance = Math.abs(axis.value - 0.25);
    assert.ok(axis.value >= 0.25 - 1e-12);
    if (frame > 12) assert.ok(distance <= previousDistance + 1e-9);
    previousDistance = distance;
  }
  assert.ok(Math.abs(axis.value - 0.25) < 0.000_01);
});

test("word coherence continuously scales spatial pose and hover repulsion", async () => {
  const { phaseInteractionGain } = await loadSpatialMotion();
  const scatterGain = 0.24;
  const samples = [0, 0.25, 0.5, 0.75, 1].map((amount) =>
    phaseInteractionGain(amount, scatterGain),
  );

  assert.equal(samples[0], scatterGain);
  assert.equal(samples.at(-1), 1);
  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(samples[index] > samples[index - 1]);
  }
});
