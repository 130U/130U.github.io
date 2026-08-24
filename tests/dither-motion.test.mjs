import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");

async function loadMotion() {
  const source = await readFile(
    path.join(ROOT, "app", "components", "dithered-entrance", "dither-motion.ts"),
    "utf8",
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}

test("the chosen Balanced interaction uses the approved restrained motion values", async () => {
  const { DITHER_MOTION } = await loadMotion();
  assert.deepEqual(DITHER_MOTION, {
    repelRadius: 100,
    maximumDisplacement: 40,
    recovery: 0.12,
    velocityRetention: 0.72,
    rippleSpeed: 225,
    rippleWidth: 37,
    rippleStrength: 20,
    rippleDuration: 675,
    maximumRipples: 4,
    readyDuration: 800,
  });
});

test("repulsion uses a bounded cubic falloff", async () => {
  const { cubicFalloff } = await loadMotion();
  assert.equal(cubicFalloff(0, 100), 1);
  assert.equal(cubicFalloff(100, 100), 0);
  assert.equal(cubicFalloff(200, 100), 0);
  assert.ok(Math.abs(cubicFalloff(50, 100) - 0.125) < 1e-12);
  assert.ok(cubicFalloff(25, 100) > cubicFalloff(50, 100));
});

test("the return spring converges without leaving residual movement", async () => {
  const { integrateSpringAxis } = await loadMotion();
  let value = 40;
  let velocity = 0;
  for (let frame = 0; frame < 180; frame += 1) {
    [value, velocity] = integrateSpringAxis(value, velocity, 0);
  }
  assert.ok(Math.abs(value) < 0.001);
  assert.ok(Math.abs(velocity) < 0.001);
});

test("Canvas2D lifecycle stops at idle and honors reduced motion", async () => {
  const component = await readFile(
    path.join(ROOT, "app", "components", "dithered-entrance", "DitheredEntrance.tsx"),
    "utf8",
  );
  const mask = await readFile(
    path.join(ROOT, "app", "components", "dithered-entrance", "dither-mask.ts"),
    "utf8",
  );
  for (const contract of [
    'getContext("2d")',
    "Float32Array",
    "ResizeObserver",
    "requestAnimationFrame",
    'matchMedia("(prefers-reduced-motion: reduce)")',
    "Math.min(2, window.devicePixelRatio",
    "pointermove",
    "pointerenter",
    "pointerleave",
    "pointerup",
    "pointercancel",
    "ripples.length > 0 || stillMoving",
  ]) assert.ok(`${component}\n${mask}`.includes(contract), `Missing dither lifecycle contract: ${contract}`);
  assert.doesNotMatch(component, /pointerActive \|\| ripples\.length/u);
  assert.match(component, /useRef<HTMLButtonElement>/u);
  assert.match(component, /setPointerCapture/u);
  assert.match(component, /motionQuery\.addListener/u);
  assert.match(component, /stage\.addEventListener\("click", onKeyboardActivate\)/u);
  assert.match(mask, /"THEODORE"[\s\S]*?"OUYANG"/u);
  assert.match(mask, /size \* 0\.17/u);
  assert.match(mask, /size \* 0\.235/u);
});
