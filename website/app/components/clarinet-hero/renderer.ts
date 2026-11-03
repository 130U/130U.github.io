import { createClock, freezeInterpolation, seededRandom, stepParticles } from "./physics";
import type { MotionState, Particle, Pointer } from "./physics";
import { BEAMED_NOTE, NODE, NOTE, TRAILS, VIEW_WIDTH, cubicPoint } from "./shape";
import { sampleClarinet } from "./sampling";
import type { SampleDot } from "./sampling";
import { blit, drawPixel } from "./pixels";
import { alignCanvas } from "./alignment";

type DotParticle = Particle & SampleDot & { exit: number; driftX: number; driftY: number };
const BLUE = "#2200ff";
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export function mountClarinet(canvas: HTMLCanvasElement, hero?: HTMLElement) {
  const context = canvas.getContext("2d");
  if (!context) return { destroy() {} };
  const ctx = context;
  const stableCanvas = document.createElement("canvas");
  const stable = stableCanvas.getContext("2d")!;
  const clock = createClock();
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const hoverQuery = matchMedia("(hover: hover) and (pointer: fine)");
  const copy = hero?.querySelector<HTMLElement>("[data-hero-copy]");
  const markers = hero?.querySelector<HTMLElement>("[data-hero-markers]");
  let particles: DotParticle[] = [];
  let activeParticles: DotParticle[] = [];
  const activeSet = new Set<DotParticle>();
  const cells = new Map<string, DotParticle[]>();
  const notes = [new Path2D(NOTE), new Path2D(BEAMED_NOTE)];
  const node = new Path2D();
  node.ellipse(0, 0, NODE.rx, NODE.ry, NODE.rotation, 0, Math.PI * 2);
  let width = 0;
  let height = 0;
  let dpr = 1;
  let cellSize = 64;
  let palette = ["#101114", "#686b68", BLUE];
  let frame = 0;
  let destroyed = false;
  let fontsReady = false;
  let inView = true;
  let dirty = true;
  let built = false;
  let bounds = canvas.getBoundingClientRect();
  let pendingWidth = bounds.width;
  let pointer: Pointer = null;
  let pointerDirty = false;
  let state: MotionState = motionQuery.matches ? "static" : "entering";
  let heroTop = 0;
  let heroHeight = 1;
  let scrollProgress = -1;
  // Next replaces NODE_ENV at build time, removing diagnostics from production.
  const diagnostics = process.env.NODE_ENV === "development" ? {
    renderTotal: 0,
    renderCount: 0,
    frameSamples: 0,
    previousFrame: null as number | null,
    frameIntervals: [] as number[],
    renderCosts: [] as number[],
  } : null;
  let paintedColor = -1;

  function paint(target: CanvasRenderingContext2D, p: SampleDot, x: number, y: number, snap = true) {
    if (target !== ctx || paintedColor !== p.color) {
      target.fillStyle = palette[p.color];
      if (target === ctx) paintedColor = p.color;
    }
    drawPixel(target, x, y, p.size, dpr, snap);
  }
  function readLayout() {
    alignCanvas(canvas);
    bounds = canvas.getBoundingClientRect();
    if (hero) {
      const rect = hero.getBoundingClientRect();
      heroTop = rect.top + window.scrollY; heroHeight = rect.height;
    }
  }
  function updateScroll() {
    const next = hero && !motionQuery.matches ? clamp((window.scrollY - heroTop) / (heroHeight * .85)) : 0;
    if (next === scrollProgress) return;
    scrollProgress = next;
    if (copy) {
      copy.style.opacity = String(1 - smooth(next / .85));
      copy.style.transform = `translate3d(0, ${-24 * next}px, 0)`;
    }
    if (markers) markers.style.opacity = String(1 - smooth(next));
    canvas.dataset.scrollProgress = next.toFixed(3);
  }
  function build() {
    if (!fontsReady || pendingWidth <= 0) return;
    ({ width, height, dpr } = alignCanvas(canvas));
    cellSize = Math.round(Math.max(32, 56 * width / 600) * dpr) / dpr;
    palette = [getComputedStyle(canvas).color, "#686b68", BLUE];
    for (const layer of [canvas, stableCanvas]) {
      layer.width = Math.round(width * dpr); layer.height = Math.round(height * dpr);
    }
    for (const target of [ctx, stable]) {
      target.setTransform(dpr, 0, 0, dpr, 0, 0); target.imageSmoothingEnabled = false;
    }
    const entering = !built && !motionQuery.matches;
    state = motionQuery.matches ? "static" : entering ? "entering" : "ready";
    const random = seededRandom(130);
    particles = sampleClarinet(width, dpr).map(dot => {
      const dotPixels = Math.max(1, Math.round(dot.size * dpr));
      // Canonical centers include half pixels for odd footprints: switching from
      // the static cache to continuous motion cannot shift an untouched dot.
      const homeX = (Math.round(dot.x * dpr - dotPixels / 2) + dotPixels / 2) / dpr;
      const homeY = (Math.round(dot.y * dpr - dotPixels / 2) + dotPixels / 2) / dpr;
      const angle = random() * Math.PI * 2;
      const radius = width * (.28 + random() * .22);
      const x = entering ? width * .6 + Math.cos(angle) * radius : homeX;
      const y = entering ? height * .5 + Math.sin(angle) * radius : homeY;
      return { ...dot, homeX, homeY, x, y, previousX: x, previousY: y,
        vx: 0, vy: 0, delay: clock.animationTime + random() * .36,
        exit: random() * .3, driftX: 16 + random() * 52, driftY: -25 - random() * 90 };
    });
    cells.clear(); activeSet.clear(); activeParticles = [];
    for (const p of particles) {
      const key = `${Math.floor(p.homeX / cellSize)},${Math.floor(p.homeY / cellSize)}`;
      const cell = cells.get(key);
      if (cell) cell.push(p); else cells.set(key, [p]);
      paint(stable, p, p.homeX, p.homeY);
    }
    canvas.dataset.particleCount = String(particles.length);
    canvas.dataset.renderMode = "particles";
    canvas.dataset.pixelRatio = String(dpr);
    canvas.dataset.maxBodyOffset = String(5 * width / 600);
    canvas.dataset.maxBellOffset = String(2.25 * width / 600);
    canvas.dataset.noteCount = "4";
    built = true; dirty = false;
    readLayout(); updateScroll(); clock.reset();
  }
  function activateNearPointer() {
    if (!pointer || !pointerDirty || state !== "ready") return;
    pointerDirty = false;
    const radius = 54 * width / 600;
    const x0 = Math.floor((pointer.x - radius) / cellSize); const x1 = Math.floor((pointer.x + radius) / cellSize);
    const y0 = Math.floor((pointer.y - radius) / cellSize); const y1 = Math.floor((pointer.y + radius) / cellSize);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const cell = cells.get(`${x},${y}`);
      if (!cell) continue;
      for (const p of cell) {
        if (activeSet.has(p) || Math.hypot(p.homeX - pointer.x, p.homeY - pointer.y) > radius) continue;
        activeSet.add(p); activeParticles.push(p);
      }
    }
  }
  function interpolated(p: DotParticle, axis: "X" | "Y") {
    const current = axis === "X" ? p.x : p.y;
    const previous = (axis === "X" ? p.previousX : p.previousY) ?? current;
    return previous + (current - previous) * clock.interpolation;
  }
  function settleActive() {
    let keep = 0;
    const radius = 54 * width / 600;
    for (const p of activeParticles) {
      const nearPointer = pointer && Math.hypot(p.homeX - pointer.x, p.homeY - pointer.y) <= radius;
      const movement = Math.abs(p.x - p.homeX) + Math.abs(p.y - p.homeY) + Math.abs(p.vx) + Math.abs(p.vy);
      if (nearPointer || movement > .015) activeParticles[keep++] = p;
      else {
        p.x = p.previousX = p.homeX; p.y = p.previousY = p.homeY; p.vx = p.vy = 0;
        activeSet.delete(p);
      }
    }
    activeParticles.length = keep;
  }
  function drawBody(breath: number) {
    if (scrollProgress > 0 || state === "entering") {
      for (const p of particles) {
        const dissolve = smooth((scrollProgress - p.exit) / (1 - p.exit));
        ctx.globalAlpha = breath * (1 - dissolve);
        paint(ctx, p, interpolated(p, "X") + p.driftX * dissolve, interpolated(p, "Y") + p.driftY * dissolve, false);
      }
      return;
    }
    ctx.globalAlpha = breath;
    blit(ctx, stableCanvas);
    if (!activeParticles.length) return;
    // Repaint only cells touched by the pointer or still springing home.
    let left = width; let top = height; let right = 0; let bottom = 0;
    for (const p of activeParticles) {
      const pad = p.maxOffset + p.size + 2;
      left = Math.min(left, p.homeX - pad); top = Math.min(top, p.homeY - pad);
      right = Math.max(right, p.homeX + pad); bottom = Math.max(bottom, p.homeY + pad);
    }
    const x0 = Math.floor(left / cellSize); const y0 = Math.floor(top / cellSize);
    const x1 = Math.floor(right / cellSize); const y1 = Math.floor(bottom / cellSize);
    left = x0 * cellSize; top = y0 * cellSize;
    right = (x1 + 1) * cellSize; bottom = (y1 + 1) * cellSize;
    ctx.clearRect(left, top, right - left, bottom - top);
    ctx.save(); ctx.beginPath(); ctx.rect(left, top, right - left, bottom - top); ctx.clip();
    for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) {
      const cell = cells.get(`${x},${y}`);
      if (!cell) continue;
      for (const p of cell) {
        const moving = activeSet.has(p);
        paint(ctx, p, moving ? interpolated(p, "X") : p.homeX, moving ? interpolated(p, "Y") : p.homeY, !moving);
      }
    }
    ctx.restore();
  }
  function drawSymbol(path: Path2D, x: number, y: number, angle: number, scale: number, color: string) {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.restore();
  }
  function draw() {
    const s = width / VIEW_WIDTH;
    const fade = 1 - smooth(scrollProgress);
    const time = state === "static" ? 0 : clock.displayTime;
    const breath = state === "static" ? 1 : .97 + .03 * Math.sin(time * Math.PI * 2 / 7.8);
    paintedColor = -1;
    ctx.clearRect(0, 0, width, height); drawBody(breath);
    ctx.globalAlpha = fade;
    drawSymbol(node, NODE.x * s, NODE.y * s, 0, s * (state === "static" ? 1 : 1 + .08 * Math.sin(time * Math.PI * 2 / 6.4)), BLUE);
    for (let i = 0; i < 4; i++) {
      const point = cubicPoint(TRAILS[0], .12 + i * .235);
      const phase = time * Math.PI * 2 / (6.4 + i * 1.15) + i * 1.7;
      const horizontal = state === "static" ? 0 : Math.sin(phase) * (7 + i * 1.6);
      const vertical = state === "static" ? 0 : Math.cos(phase) * (13 + i * 2) + Math.sin(phase * 2) * 3;
      ctx.globalAlpha = fade * (state === "static" ? 1 : .86 + .14 * Math.sin(phase - .8));
      drawSymbol(notes[i === 1 ? 1 : 0], point.x * s + 15 + horizontal, point.y * s + vertical,
        state === "static" ? 0 : Math.sin(phase + .6) * .12,
        Math.max(.9, s * 1.85) * (state === "static" ? 1 : .98 + .065 * Math.sin(phase + 1.1)), i % 2 ? palette[0] : BLUE);
    }
    ctx.globalAlpha = 1;
    if (canvas.dataset.rendered !== "true") canvas.dataset.rendered = "true";
    if (canvas.dataset.state !== state) canvas.dataset.state = state;
  }
  function active() { return !destroyed && fontsReady && inView && !document.hidden; }
  function schedule() { if (active() && !frame) frame = requestAnimationFrame(onFrame); }
  function stop() {
    freezeInterpolation(particles, clock.interpolation);
    cancelAnimationFrame(frame); frame = 0; clock.reset();
    if (process.env.NODE_ENV === "development" && diagnostics) diagnostics.previousFrame = null;
  }
  function onFrame(now: number) {
    frame = 0;
    if (!active()) return;
    if (dirty) build();
    if (!built) return;
    const start = process.env.NODE_ENV === "development" ? performance.now() : 0;
    updateScroll(); activateNearPointer();
    if (state !== "static") {
      clock.advance(now, animationTime => {
        if (state === "entering") stepParticles(particles, null, width / 600, state, animationTime);
        else if (activeParticles.length) stepParticles(activeParticles, pointer, width / 600, "ready", animationTime);
      });
      if (state === "entering" && clock.animationTime > .4 && !particles.some(p =>
        Math.abs(p.x - p.homeX) + Math.abs(p.y - p.homeY) + Math.abs(p.vx) + Math.abs(p.vy) > .02)) {
        stepParticles(particles, null, width / 600, "static", clock.animationTime); state = "ready";
      }
      if (state === "ready") settleActive();
    }
    draw();
    if (process.env.NODE_ENV === "development" && diagnostics) {
      const renderCost = performance.now() - start;
      diagnostics.renderTotal += renderCost;
      diagnostics.renderCosts[diagnostics.renderCount++ % 120] = renderCost;
      if (diagnostics.previousFrame !== null && now > diagnostics.previousFrame) {
        diagnostics.frameIntervals[diagnostics.frameSamples++ % 120] = now - diagnostics.previousFrame;
      }
      diagnostics.previousFrame = now;
      if (diagnostics.renderCount % 30 === 0) {
        canvas.dataset.renderMs = (diagnostics.renderTotal / diagnostics.renderCount).toFixed(2);
        canvas.dataset.motionTime = clock.displayTime.toFixed(2);
        canvas.dataset.activeParticles = String(activeParticles.length);
        const intervals = [...diagnostics.frameIntervals].sort((a, b) => a - b);
        if (intervals.length) canvas.dataset.frameP95 = intervals[Math.min(intervals.length - 1, Math.floor(intervals.length * .95))].toFixed(2);
        const costs = [...diagnostics.renderCosts].sort((a, b) => a - b);
        canvas.dataset.renderP95 = costs[Math.min(costs.length - 1, Math.floor(costs.length * .95))].toFixed(2);
      }
    }
    if (state !== "static") schedule(); else clock.reset();
  }
  function updateMode() {
    pointer = null; activeSet.clear(); activeParticles = [];
    state = motionQuery.matches ? "static" : "ready";
    stepParticles(particles, null, width / 600, "static", clock.animationTime); stop(); schedule();
  }
  function onPointer(event: PointerEvent) {
    if (event.pointerType === "touch" || !hoverQuery.matches || state === "static") return;
    if (state === "entering") {
      stepParticles(particles, null, width / 600, "static", clock.animationTime); state = "ready";
    }
    pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top }; pointerDirty = true; schedule();
  }
  function clearPointer() { pointer = null; pointerDirty = false; schedule(); }
  function onScroll() { alignCanvas(canvas); bounds = canvas.getBoundingClientRect(); clearPointer(); }
  function onVisibility() { stop(); pointer = null; if (!document.hidden) schedule(); }
  const resizeObserver = new ResizeObserver(entries => {
    pendingWidth = canvas.parentElement ? alignCanvas(canvas).width : entries[0].contentRect.width;
    if (built && Math.abs(pendingWidth - width) < .1) return;
    dirty = true; schedule();
  });
  const intersectionObserver = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting; stop(); pointer = null; schedule();
  });
  function onWindowResize() {
    readLayout(); pendingWidth = bounds.width;
    if (built && Math.abs(pendingWidth - width) < .1 && dpr === Math.min(devicePixelRatio || 1, 3)) { schedule(); return; }
    dirty = true; schedule();
  }
  resizeObserver.observe(canvas.parentElement ?? canvas); intersectionObserver.observe(hero ?? canvas);
  canvas.addEventListener("pointermove", onPointer, { passive: true });
  canvas.addEventListener("pointerleave", clearPointer, { passive: true });
  canvas.addEventListener("pointercancel", clearPointer, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onWindowResize, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  motionQuery.addEventListener("change", updateMode); hoverQuery.addEventListener("change", clearPointer);
  document.fonts.ready.then(() => { if (!destroyed) { fontsReady = true; schedule(); } });
  return {
    destroy() {
      destroyed = true; stop(); resizeObserver.disconnect(); intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", onPointer); canvas.removeEventListener("pointerleave", clearPointer);
      canvas.removeEventListener("pointercancel", clearPointer); document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onWindowResize); window.removeEventListener("scroll", onScroll);
      motionQuery.removeEventListener("change", updateMode); hoverQuery.removeEventListener("change", clearPointer);
      particles = []; activeParticles = []; activeSet.clear(); cells.clear();
    },
  };
}
