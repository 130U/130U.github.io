import assert from "node:assert/strict";
import test from "node:test";
import { alignCanvas } from "../app/components/clarinet-hero/alignment.ts";

function harness(t, { dpr = 2.28, width = 730.986, left = 638.344, top = 92.176, scale = 1, offset = 0 } = {}) {
  const originalDpr = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
  const originalStyle = Object.getOwnPropertyDescriptor(globalThis, "getComputedStyle");
  Object.defineProperty(globalThis, "devicePixelRatio", { value: dpr, configurable: true });
  Object.defineProperty(globalThis, "getComputedStyle", {
    configurable: true,
    value: element => ({ getPropertyValue: property => element.variables[property] ?? "" }),
  });
  t.after(() => {
    if (originalDpr) Object.defineProperty(globalThis, "devicePixelRatio", originalDpr);
    else delete globalThis.devicePixelRatio;
    if (originalStyle) Object.defineProperty(globalThis, "getComputedStyle", originalStyle);
    else delete globalThis.getComputedStyle;
  });
  const rect = { width, left, top };
  const stage = {
    variables: { "--canvas-scale": String(scale), "--canvas-left": String(offset) },
    getBoundingClientRect() { return { ...rect }; },
  };
  const writes = [];
  const style = new Proxy({}, {
    set(object, property, value) { writes.push({ property, value }); object[property] = value; return true; },
  });
  const canvas = {
    parentElement: stage, style,
    width: 0, height: 0,
    getBoundingClientRect() {
      return {
        width: Number.parseFloat(style.width) || rect.width * Number(stage.variables["--canvas-scale"]),
        left: rect.left + (Number.parseFloat(style.left) || 0),
        top: rect.top + (Number.parseFloat(style.top) || 0),
      };
    },
  };
  return { canvas, stage, rect, writes };
}

const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-9, message);

test("fractional desktop layout at DPR 2.28 maps the CSS box and origin to device pixels", t => {
  const h = harness(t);
  const result = alignCanvas(h.canvas);
  assert.equal(result.dpr, 2.28);
  close(result.width * result.dpr, Math.round(730.986 * 2.28));
  close(result.height * result.dpr, Math.round(730.986 * 1223 / 1286 * 2.28));
  const screenLeft = h.rect.left + Number.parseFloat(h.canvas.style.left);
  const screenTop = h.rect.top + Number.parseFloat(h.canvas.style.top);
  close(screenLeft * 2.28, Math.round(screenLeft * 2.28));
  close(screenTop * 2.28, Math.round(screenTop * 2.28));
  assert.ok(Math.abs(Number.parseFloat(h.canvas.style.left)) <= .5 / 2.28);
  assert.ok(Math.abs(Number.parseFloat(h.canvas.style.top)) <= .5 / 2.28);
  assert.equal(h.canvas.width, 0, "Alignment must not allocate or clear the backing store.");
});

test("mobile 130 percent width always comes from the stage, including a responsive resize", t => {
  const h = harness(t, { width: 350.125, left: 20, top: 440.35, scale: 1.3, offset: -.25, dpr: 3 });
  const first = alignCanvas(h.canvas);
  close(first.width, Math.round(350.125 * 1.3 * 3) / 3);
  const rawLeft = h.rect.width * -.25;
  assert.ok(Math.abs(Number.parseFloat(h.canvas.style.left) - rawLeft) <= .5 / 3);
  // A rounded inline canvas width must never feed back into scale.
  h.canvas.style.width = "12px";
  h.rect.width = 390.375;
  const resized = alignCanvas(h.canvas);
  close(resized.width, Math.round(390.375 * 1.3 * 3) / 3);
  close(Number.parseFloat(h.canvas.style.width), resized.width);
});

test("repeated alignment is idempotent and does not rewrite equivalent CSSOM values", t => {
  const h = harness(t);
  const first = alignCanvas(h.canvas);
  const firstWrites = h.writes.length;
  for (let i = 0; i < 20; i += 1) assert.deepEqual(alignCanvas(h.canvas), first);
  assert.equal(h.writes.length, firstWrites);
  // CSSOM is allowed to serialize a number with fewer significant digits.
  h.canvas.style.width = String(Number.parseFloat(h.canvas.style.width).toFixed(3)) + "px";
  const serializedWrites = h.writes.length;
  alignCanvas(h.canvas);
  assert.equal(h.writes.length, serializedWrites);
});

test("fractional scrolling adjusts the origin without changing dimensions or reallocating", t => {
  const h = harness(t);
  const first = alignCanvas(h.canvas);
  h.writes.length = 0;
  h.rect.top -= 31.125;
  const scrolled = alignCanvas(h.canvas);
  assert.deepEqual(scrolled, first);
  assert.ok(h.writes.length > 0);
  assert.ok(h.writes.every(write => write.property === "top"));
  const top = h.rect.top + Number.parseFloat(h.canvas.style.top);
  close(top * scrolled.dpr, Math.round(top * scrolled.dpr));
  assert.deepEqual([h.canvas.width, h.canvas.height], [0, 0]);
});

test("DPR stays capped at three while origin alignment follows the physical display", t => {
  const h = harness(t, { dpr: 4 });
  const result = alignCanvas(h.canvas);
  assert.equal(result.dpr, 3);
  close(result.width * 3, Math.round(h.rect.width * 3));
  const left = h.rect.left + Number.parseFloat(h.canvas.style.left);
  close(left * 4, Math.round(left * 4));
});

test("a detached canvas can fall back to its current rect without a stage or style stub", t => {
  harness(t);
  const result = alignCanvas({ parentElement: null, getBoundingClientRect: () => ({ width: 600, left: 0, top: 0 }) });
  assert.equal(result.width, 600);
  close(result.height, Math.round(600 * 1223 / 1286 * 2.28) / 2.28);
});
