import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

// Exercise the actual renderer, sampler and physics with controlled browser
// services. Synthetic masks test composition and scheduling, not visual fidelity.
const base = new URL("../app/components/clarinet-hero/", import.meta.url);
const moduleUrl = source => "data:text/javascript;base64," + Buffer.from(source).toString("base64");
async function compile(name) {
  return ts.transpileModule(await readFile(new URL(name, base), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
}
const physicsUrl = moduleUrl(await compile("physics.ts"));
const shapeUrl = moduleUrl(await compile("shape.ts"));
const { NOTE, BEAMED_NOTE, NODE } = await import(shapeUrl);
const notePaths = [NOTE, BEAMED_NOTE].map(path => JSON.stringify([["svg", path]]));
const nodePath = JSON.stringify([["ellipse", 0, 0, NODE.rx, NODE.ry, NODE.rotation, 0, Math.PI * 2]]);
const samplingUrl = moduleUrl((await compile("sampling.ts"))
  .replace('"./physics"', JSON.stringify(physicsUrl)).replace('"./shape"', JSON.stringify(shapeUrl)));
const rendererSource = (await compile("renderer.ts"))
  .replace('"./physics"', JSON.stringify(physicsUrl))
  .replace('"./shape"', JSON.stringify(shapeUrl))
  .replace('"./sampling"', JSON.stringify(samplingUrl))
  .replace('"./pixels"', JSON.stringify(moduleUrl(await compile("pixels.ts"))))
  .replace('"./alignment"', JSON.stringify(moduleUrl(await compile("alignment.ts"))));
const { mountClarinet } = await import(moduleUrl(rendererSource));

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener, options) {
      if (!listeners.has(type)) listeners.set(type, new Map());
      listeners.get(type).set(listener, options);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); },
    emit(type, event = {}) { for (const listener of listeners.get(type)?.keys() ?? []) listener(event); },
    options(type) { return [...(listeners.get(type)?.values() ?? [])]; },
    listenerCount() { return [...listeners.values()].reduce((sum, set) => sum + set.size, 0); },
  };
}
const rounded = value => JSON.parse(JSON.stringify(value, (_, item) =>
  typeof item === "number" ? Number(item.toFixed(9)) : item));

function harness({ reduced = false, width = 240, pixelRatio = 1 } = {}) {
  const originals = new Map(), frames = new Map(), observers = [], controllers = [], canvases = [];
  const sampledCanvases = new Set();
  let nextFrame = 1, sampleReads = 0, resolveFonts;
  const fontsReady = new Promise(resolve => { resolveFonts = resolve; });
  const motion = Object.assign(eventTarget(), { matches: reduced });
  const hover = Object.assign(eventTarget(), { matches: true });
  const windowMock = Object.assign(eventTarget(), { scrollY: 0 });
  const copy = { style: {} }, markers = { style: {} };
  const hero = {
    getBoundingClientRect() { return { top: -windowMock.scrollY, height: 900 }; },
    querySelector(selector) { return selector === "[data-hero-copy]" ? copy : markers; },
  };
  function makeCanvas() {
    const canvas = Object.assign(eventTarget(), {
      cssWidth: width, dataset: {},
      getBoundingClientRect() { return { width: this.cssWidth, left: 0, top: -windowMock.scrollY }; },
    });
    let backingWidth = 0, backingHeight = 0;
    const saved = [];
    const context = {
      globalAlpha: 1, globalCompositeOperation: "source-over", fillStyle: "#000",
      strokeStyle: "#000", lineWidth: 1, drawing: [], matrix: [1, 0, 0, 1, 0, 0], clipping: null, path: [],
      stats: { pixels: 0, vectors: 0, strokes: 0, gradients: 0, filledPaths: new Set() },
      clearRect(x, y, w, h) {
        if (x === 0 && y === 0 && w * this.matrix[0] >= backingWidth - 1
          && h * this.matrix[3] >= backingHeight - 1) this.drawing = [];
        else this.drawing.push({ op: "clear", rectangle: [x, y, w, h] });
      },
      fillRect(x, y, w, h) {
        this.stats.pixels++;
        this.drawing.push({ op: "pixel", rectangle: [x, y, w, h], alpha: this.globalAlpha,
          color: this.fillStyle, matrix: [...this.matrix], clipping: this.clipping });
      },
      createLinearGradient() { this.stats.gradients++; return { addColorStop() {} }; },
      getImageData() {
        sampleReads++; sampledCanvases.add(canvas);
        const data = new Uint8ClampedArray(canvas.width * canvas.height * 4);
        const body = this.drawing.some(command => command.op === "fill" && command.color === "#ff0000");
        const metal = this.drawing.some(command => command.op === "fill" && command.rule === "evenodd");
        const boxes = body ? [[.58, .4, .62, .45], [.58, .65, .62, .7]]
          : metal ? [[.65, .48, .68, .52]] : [[.67, .49, .675, .53]];
        for (const [x0, y0, x1, y1] of boxes) {
          for (let y = Math.floor(canvas.height * y0); y < canvas.height * y1; y++) {
            for (let x = Math.floor(canvas.width * x0); x < canvas.width * x1; x++) {
              const i = (y * canvas.width + x) * 4;
              data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 255;
            }
          }
        }
        return { width: canvas.width, height: canvas.height, data };
      },
      drawImage(source, ...args) {
        this.drawing.push({ op: "image", source, args, alpha: this.globalAlpha, matrix: [...this.matrix] });
      },
      save() {
        saved.push({ matrix: [...this.matrix], globalAlpha: this.globalAlpha, clipping: this.clipping,
          globalCompositeOperation: this.globalCompositeOperation, fillStyle: this.fillStyle,
          strokeStyle: this.strokeStyle, lineWidth: this.lineWidth });
      },
      restore() { Object.assign(this, saved.pop()); },
      setTransform(...matrix) { this.matrix = matrix; },
      scale(x, y) {
        this.matrix[0] *= x; this.matrix[1] *= x; this.matrix[2] *= y; this.matrix[3] *= y;
      },
      rotate(angle) {
        const [a, b, c, d, e, f] = this.matrix;
        const cos = Math.cos(angle), sin = Math.sin(angle);
        this.matrix = [a * cos + c * sin, b * cos + d * sin, c * cos - a * sin, d * cos - b * sin, e, f];
      },
      translate(x, y) {
        this.matrix[4] += x * this.matrix[0] + y * this.matrix[2];
        this.matrix[5] += x * this.matrix[1] + y * this.matrix[3];
      },
      beginPath() { this.path = []; },
      rect(...rectangle) { this.path.push(["rect", ...rectangle]); },
      ellipse(...args) { this.path.push(["ellipse", ...args]); },
      arc(...args) { this.path.push(["arc", ...args]); },
      clip() { this.clipping = structuredClone(this.path); },
      fill(path, rule = "nonzero") {
        this.stats.vectors++;
        const commands = structuredClone(path?.commands ?? this.path);
        this.stats.filledPaths.add(JSON.stringify(commands));
        this.drawing.push({ op: "fill", path: commands, rule, color: this.fillStyle,
          alpha: this.globalAlpha, matrix: [...this.matrix] });
      },
      stroke(path) {
        this.stats.vectors++; this.stats.strokes++;
        this.drawing.push({ op: "stroke", path: path?.commands ?? this.path, color: this.strokeStyle });
      },
    };
    function reset() {
      context.drawing = []; context.path = []; context.clipping = null;
      context.globalAlpha = 1; context.globalCompositeOperation = "source-over";
      context.matrix = [1, 0, 0, 1, 0, 0]; saved.length = 0;
    }
    Object.defineProperties(canvas, {
      width: { get: () => backingWidth, set(value) { backingWidth = value; reset(); } },
      height: { get: () => backingHeight, set(value) { backingHeight = value; reset(); } },
    });
    canvas.context = context; canvas.getContext = () => context; canvases.push(canvas);
    return canvas;
  }
  const documentMock = Object.assign(eventTarget(), { hidden: false, fonts: { ready: fontsReady }, createElement: makeCanvas });
  function observerClass(kind) {
    return class {
      constructor(callback) { this.callback = callback; this.kind = kind; observers.push(this); }
      observe(target) { this.connected = true; this.target = target; }
      disconnect() { this.connected = false; }
    };
  }
  const replacements = {
    document: documentMock, window: windowMock, devicePixelRatio: pixelRatio,
    Path2D: class {
      constructor(source) { this.commands = source ? [["svg", source]] : []; }
      addPath(path) { this.commands.push(...path.commands); }
      ellipse(...args) { this.commands.push(["ellipse", ...args]); }
    },
    getComputedStyle: () => ({ color: "#101114" }),
    matchMedia: query => query.includes("prefers-reduced-motion") ? motion : hover,
    ResizeObserver: observerClass("resize"), IntersectionObserver: observerClass("intersection"),
    requestAnimationFrame(callback) { const id = nextFrame++; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); },
  };
  for (const [name, value] of Object.entries(replacements)) {
    originals.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
  }
  const canvas = makeCanvas();
  function mount() { const controller = mountClarinet(canvas, hero); controllers.push(controller); return controller; }
  const controller = mount();
  const dots = source => source.context.drawing.filter(command => command.op === "pixel");
  const cache = () => canvas.context.drawing.find(command => command.op === "image")?.source;
  function snapshot(source = canvas) {
    return source.context.drawing.map(command => command.op === "image"
      ? { ...command, source: snapshot(command.source) } : structuredClone(command));
  }
  function presented(source = canvas, result = new Set()) {
    result.add(source);
    for (const command of source.context.drawing) if (command.op === "image") presented(command.source, result);
    return result;
  }
  function notify(kind, value) {
    for (const observer of observers.filter(item => item.kind === kind && item.connected)) observer.callback([value]);
  }
  return {
    canvas, hero, controller, mount, frames, observers, canvases, sampledCanvases, copy, markers,
    get sampleReads() { return sampleReads; },
    async fonts() { resolveFonts(); await fontsReady; await Promise.resolve(); },
    frame(now) {
      const current = [...frames.values()]; frames.clear();
      for (const callback of current) callback(now);
      assert.ok(frames.size <= 1, "Only one animation frame may remain scheduled.");
    },
    snapshot, presented, cache, dots,
    body() { return cache() ? dots(cache()) : dots(canvas).slice(0, Number(canvas.dataset.particleCount)); },
    local() { return dots(canvas).filter(point => point.clipping); },
    notes() {
      return canvas.context.drawing.filter(command => command.op === "fill"
        && notePaths.includes(JSON.stringify(command.path)));
    },
    scroll(y) { windowMock.scrollY = y; windowMock.emit("scroll"); },
    scrollOptions() { return windowMock.options("scroll"); },
    pointer(x, y) { canvas.emit("pointermove", { pointerType: "mouse", clientX: x, clientY: y }); },
    leave() { canvas.emit("pointerleave"); },
    resize(value) { canvas.cssWidth = value; notify("resize", { contentRect: { width: value } }); },
    windowResize() { windowMock.emit("resize"); },
    visible(value) { documentMock.hidden = !value; documentMock.emit("visibilitychange"); },
    inView(value) { notify("intersection", { isIntersecting: value }); },
    reduced(value) { motion.matches = value; motion.emit("change"); },
    listenerCount() { return [canvas, documentMock, windowMock, motion, hover].reduce((sum, item) => sum + item.listenerCount(), 0); },
    dispose() {
      controllers.forEach(item => item.destroy());
      for (const [name, descriptor] of originals) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name];
      }
    },
  };
}
function advance(h, start = 0, count = 360, hz = 60) {
  h.frame(start);
  for (let i = 1; i <= count; i++) h.frame(start + i * 1000 / hz);
  assert.equal(h.frames.size, 1, "Visible normal-motion particles keep their ambient animation.");
}
function assertParticleBodyAndAccents(h) {
  assert.equal(h.canvas.dataset.renderMode, "particles");
  const accents = h.canvas.context.drawing.filter(command => command.op === "fill");
  assert.equal(accents.length, 5, "Only four notes and the single blue node may use solid vector fills.");
  assert.equal(h.notes().length, 4);
  assert.equal(h.notes().filter(command => JSON.stringify(command.path) === notePaths[1]).length, 1);
  const nodes = accents.filter(command => JSON.stringify(command.path) === nodePath);
  assert.equal(nodes.length, 1); assert.equal(nodes[0].color, "#2200ff");
  for (const command of h.notes()) assert.ok(["#101114", "#2200ff"].includes(command.color));
  for (const canvas of h.presented()) {
    assert.ok(!h.sampledCanvases.has(canvas), "A construction mask must never be copied to the visible scene.");
    if (canvas === h.canvas) {
      for (const path of canvas.context.stats.filledPaths) assert.ok([...notePaths, nodePath].includes(path),
        "The visible canvas never fills an instrument, key, bell, arc or trail path.");
      assert.equal(canvas.context.stats.strokes, 0, "No visible vector outlines are permitted.");
    } else assert.equal(canvas.context.stats.vectors, 0, "The instrument cache contains particles only.");
    assert.equal(canvas.context.stats.gradients, 0, "Presented layers contain no gradients.");
    for (const point of h.dots(canvas)) {
      assert.equal(typeof point.color, "string");
      const maxSize = point.color === "#2200ff" ? Math.round(2.2 * Number(h.canvas.dataset.pixelRatio))
        / Number(h.canvas.dataset.pixelRatio) : 2.1;
      assert.ok(point.rectangle[2] > 0 && point.rectangle[2] <= maxSize
        && point.rectangle[3] > 0 && point.rectangle[3] <= maxSize, "The instrument and dotted arc retain small, separate points.");
    }
  }
}

test("same-size notifications preserve entry without resampling", async t => {
  const h = harness(); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  const reads = h.sampleReads;
  assert.equal(h.canvas.dataset.state, "entering");
  h.resize(240); h.windowResize(); h.resize(240); h.frame(1000 / 60);
  assert.equal(h.canvas.dataset.state, "entering"); assert.equal(h.sampleReads, reads); assert.equal(h.frames.size, 1);
});

test("real resize coalesces notifications and restores ready without replaying entry", async t => {
  const h = harness(); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  const reads = h.sampleReads;
  h.resize(300); h.windowResize(); h.resize(320); h.frame(1000 / 60);
  assert.equal(h.canvas.width, 320); assert.equal(h.canvas.dataset.state, "ready");
  assert.equal(h.sampleReads, reads * 2); assert.ok(h.cache()); advance(h, 1000 / 60);
});

test("natural entry reaches its complete cache while four notes keep breathing", async t => {
  const h = harness({ width: 600 }); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  assert.equal(h.canvas.dataset.state, "entering");
  let frame = 0;
  while (h.canvas.dataset.state === "entering" && frame < 300) h.frame(++frame * 1000 / 60);
  assert.equal(h.canvas.dataset.state, "ready"); assert.equal(h.frames.size, 1);
  assert.equal(h.body().length, Number(h.canvas.dataset.particleCount));
  assert.equal(h.notes().length, 4); assert.ok(h.notes().every(note => note.alpha > 0));
  assertParticleBodyAndAccents(h); t.diagnostic("Natural entry settled after " + frame + " active 60 Hz frames.");
});

test("reduced motion starts complete and toggling it does not replay entry", async t => {
  const h = harness({ reduced: true }); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  assert.equal(h.canvas.dataset.state, "static"); assert.equal(h.frames.size, 0); assert.ok(h.cache());
  h.reduced(false); h.frame(1000);
  assert.equal(h.canvas.dataset.state, "ready"); assert.equal(h.frames.size, 1);
  h.reduced(true); h.frame(2000);
  assert.equal(h.canvas.dataset.state, "static"); assert.equal(h.frames.size, 0); assertParticleBodyAndAccents(h);
});

test("reduced motion during entry immediately settles every point", async t => {
  const h = harness(); t.after(() => h.dispose()); await h.fonts(); h.frame(0); h.frame(1000 / 60);
  h.reduced(true); h.frame(2000 / 60);
  assert.equal(h.canvas.dataset.state, "static"); assert.ok(h.cache()); assert.equal(h.frames.size, 0);
});

test("scrolling disperses independent points and reverse restores the exact cache", async t => {
  const h = harness({ width: 350 }); t.after(() => h.dispose()); await h.fonts(); advance(h);
  const original = h.body(), reads = h.sampleReads;
  assert.ok(h.scrollOptions().every(options => options.passive === true));
  h.scroll(430); h.frame(6000);
  const moved = h.body(); assert.equal(moved.length, original.length);
  const offsets = moved.map((point, i) => [point.rectangle[0] - original[i].rectangle[0], point.rectangle[1] - original[i].rectangle[1]]);
  assert.ok(offsets.some(([x, y]) => Math.hypot(x, y) > 3));
  assert.ok(new Set(offsets.map(([x, y]) => x.toFixed(1) + "," + y.toFixed(1))).size > 5);
  assert.ok(moved.some(point => point.alpha < 1)); assert.ok(Number(h.copy.style.opacity) < 1);
  assertParticleBodyAndAccents(h);
  h.scroll(0); h.frame(7000);
  assert.equal(h.canvas.dataset.scrollProgress, "0.000"); assert.deepEqual(h.body(), original); assert.equal(h.sampleReads, reads);
});

test("the first scroll pixel changes no material count or point footprint", async t => {
  const h = harness({ width: 350 }); t.after(() => h.dispose()); await h.fonts(); advance(h);
  const original = h.body();
  h.scroll(1); h.frame(6000);
  assert.equal(h.body().length, original.length);
  h.body().forEach((point, i) => {
    assert.equal(point.color, original[i].color);
    assert.deepEqual(point.rectangle.slice(2), original[i].rectangle.slice(2));
    assert.ok(Math.hypot(point.rectangle[0] - original[i].rectangle[0], point.rectangle[1] - original[i].rectangle[1]) < .05);
  });
  assertParticleBodyAndAccents(h);
});

test("reduced motion remains wholly static during scroll and thirty seconds of wall time", async t => {
  const h = harness({ reduced: true, width: 350 }); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  const original = h.snapshot();
  h.scroll(600); h.frame(1000); h.frame(30000);
  assert.equal(h.canvas.dataset.scrollProgress, "0.000");
  assert.equal(h.copy.style.opacity, "1"); assert.equal(h.markers.style.opacity, "1");
  assert.deepEqual(h.snapshot(), original); assert.equal(h.frames.size, 0);
});

test("local hover repaints a bounded region without rebuilding masks or the stable cache", async t => {
  const h = harness({ width: 720, pixelRatio: 3 }); t.after(() => h.dispose()); await h.fonts(); advance(h);
  const cache = h.cache(), writes = cache.context.stats.pixels, reads = h.sampleReads;
  h.pointer(720 * .59, 720 * 1223 / 1286 * .42); advance(h, 6000, 30);
  assert.ok(h.local().length > 0);
  const cleared = h.canvas.context.drawing.filter(command => command.op === "clear");
  assert.ok(cleared.some(command => command.rectangle[2] < 720 && command.rectangle[3] < 720 * 1223 / 1286));
  assert.equal(cache.context.stats.pixels, writes); assert.equal(h.sampleReads, reads); assertParticleBodyAndAccents(h);
});

test("activating nearby cells does not shift stationary neighbors by half a pixel", async t => {
  const width = 720;
  const h = harness({ width, pixelRatio: 3 }); t.after(() => h.dispose()); await h.fonts(); advance(h);
  const pointer = { x: width * .58 - 30, y: width * 1223 / 1286 * .42 };
  const neighbors = h.body().filter(point => {
    const [x, y, w, height] = point.rectangle;
    const distance = Math.hypot(x + w / 2 - pointer.x, y + height / 2 - pointer.y);
    return distance > 42 * width / 600 + 2 && distance < 54 * width / 600 - 2;
  });
  assert.ok(neighbors.length > 0, "The fixture includes activated points outside the repulsion radius.");
  h.pointer(pointer.x, pointer.y);
  for (const time of [6000 + 1000 / 120, 6000 + 1000 / 60]) {
    h.frame(time);
    for (const point of neighbors) assert.ok(h.local().some(candidate => candidate.color === point.color
      && JSON.stringify(rounded(candidate.rectangle)) === JSON.stringify(rounded(point.rectangle))),
    "Switching a stationary neighbor from cached to interpolated drawing preserves its exact footprint.");
  }
});

test("native and fractional DPR keep static dots sharp and leave transparent spaces", async () => {
  for (const pixelRatio of [1, 1.25, 2, 3]) {
    const h = harness({ reduced: true, width: 600, pixelRatio });
    try {
      await h.fonts(); h.frame(0); assert.equal(Number(h.canvas.dataset.pixelRatio), pixelRatio);
      for (const point of h.body()) assert.ok(point.rectangle.every(value => Math.abs(value * pixelRatio - Math.round(value * pixelRatio)) < 1e-8));
      const image = h.canvas.context.drawing.find(command => command.op === "image");
      assert.deepEqual(image.args, [0, 0]); assert.deepEqual(image.matrix, [1, 0, 0, 1, 0, 0]);
      const region = h.body().filter(point => point.rectangle[0] > 600 * .58 && point.rectangle[0] < 600 * .62
        && point.rectangle[1] > 600 * 1223 / 1286 * .4 && point.rectangle[1] < 600 * 1223 / 1286 * .45);
      assert.ok(region.length > 0);
      const area = region.reduce((sum, point) => sum + point.rectangle[2] * point.rectangle[3], 0);
      assert.ok(area < 600 * .04 * (600 * 1223 / 1286 * .05) * .8,
        "A sampled body patch retains visible space between point footprints.");
      assertParticleBodyAndAccents(h);
    } finally { h.dispose(); }
  }
});

test("wide-stage pointer recovery returns exactly to canonical points", async t => {
  const h = harness({ width: 720 }); t.after(() => h.dispose()); await h.fonts(); advance(h);
  const canonical = h.body();
  h.pointer(720 * .59 - 3, 720 * 1223 / 1286 * .42 + 3); advance(h, 6000, 90);
  assert.ok(h.local().length > 0);
  h.leave(); advance(h, 7500, 180);
  assert.equal(h.local().length, 0); assert.deepEqual(h.body(), canonical); assert.equal(h.canvas.dataset.state, "ready");
});

test("instrument points have no vector underlay while only four notes and one node use solid fills", async t => {
  const h = harness({ width: 600, pixelRatio: 4 }); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  assert.equal(h.canvas.dataset.pixelRatio, "3"); assertParticleBodyAndAccents(h);
  advance(h); assertParticleBodyAndAccents(h);
  assert.ok(new Set(h.body().map(point => point.color)).size >= 3, "The fixture exercises ink, gray and blue particles.");
  h.pointer(600 * .59, 600 * 1223 / 1286 * .42); advance(h, 6000, 10); assertParticleBodyAndAccents(h);
  h.scroll(430); h.frame(7000); assertParticleBodyAndAccents(h);
});

test("construction buffers release their stores and visibility tracks the full hero", async t => {
  const h = harness({ reduced: true }); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  assert.equal(h.observers.find(observer => observer.kind === "intersection").target, h.hero);
  assert.equal(h.sampledCanvases.size, 3, "Only the three private instrument masks are sampled.");
  assert.ok([...h.sampledCanvases].every(canvas => canvas.width === 1 && canvas.height === 1));
  assert.ok([...h.sampledCanvases].every(canvas => !h.presented().has(canvas)));
});

test("four solid notes still move after ten and thirty seconds while body homes remain fixed", async t => {
  const h = harness(); t.after(() => h.dispose()); await h.fonts(); advance(h, 0, 600);
  const canonical = h.body(), cache = h.cache(), writes = cache.context.stats.pixels;
  for (const [start, count] of [[10000, 30], [10500, 1170], [30000, 30]]) {
    const before = h.notes(); assert.equal(before.length, 4);
    advance(h, start, count);
    assert.ok(h.notes().every((group, i) => JSON.stringify(group) !== JSON.stringify(before[i])));
    assert.deepEqual(h.body(), canonical); assert.equal(cache.context.stats.pixels, writes);
  }
});

test("120 and 144 Hz intermediate RAF frames interpolate local motion", async () => {
  for (const hz of [120, 144]) {
    const h = harness({ width: 720, pixelRatio: 3 });
    try {
      await h.fonts(); advance(h);
      h.pointer(720 * .59 - 2, 720 * 1223 / 1286 * .42);
      advance(h, 6000, 5, 60);
      const before = h.local();
      h.frame(6000 + 5 * 1000 / 60 + 1000 / hz);
      assert.ok(before.length > 0);
      assert.notDeepEqual(h.local(), before, "A frame without another full simulation step must still update displayed positions.");
      assertParticleBodyAndAccents(h);
    } finally { h.dispose(); }
  }
});

test("hidden and offscreen suspension preserves fractional-frame entry and ambient phases", async () => {
  for (const mode of ["visible", "inView"]) for (const hz of [60, 120, 144]) {
    for (const count of [25, hz * 10 + 1]) {
      const h = harness({ width: 600 });
      try {
        await h.fonts(); advance(h, 0, count, hz);
        const before = rounded(h.snapshot());
        h[mode](false); assert.equal(h.frames.size, 0); h.frame(120000);
        assert.deepEqual(rounded(h.snapshot()), before);
        h[mode](true); h.frame(120000);
        assert.deepEqual(rounded(h.snapshot()), before, "Resume must preserve the visible fractional-step pose and musical phase.");
        assert.equal(h.frames.size, 1);
      } finally { h.dispose(); }
    }
  }
});

test("destroy cancels RAF, observers and listeners across remounts", async t => {
  const h = harness(); t.after(() => h.dispose()); await h.fonts(); h.frame(0);
  const listeners = h.listenerCount(); assert.ok(listeners > 0);
  h.controller.destroy();
  assert.equal(h.frames.size, 0); assert.equal(h.listenerCount(), 0); assert.ok(h.observers.every(observer => !observer.connected));
  const next = h.mount(); await Promise.resolve(); h.frame(1000);
  assert.equal(h.listenerCount(), listeners); assert.equal(h.frames.size, 1);
  next.destroy(); assert.equal(h.frames.size, 0); assert.equal(h.listenerCount(), 0);
});

test("late font completion after destroy cannot rebuild or schedule", async t => {
  const h = harness(); t.after(() => h.dispose()); h.controller.destroy(); await h.fonts();
  h.resize(320); h.windowResize(); h.visible(true); h.reduced(true);
  assert.equal(h.frames.size, 0); assert.equal(h.listenerCount(), 0); assert.equal(h.sampleReads, 0);
  assert.equal(h.canvas.dataset.rendered, undefined);
});

