import assert from "node:assert/strict";
import test from "node:test";
import {
  createClock,
  freezeInterpolation,
  seededRandom,
  stepParticles,
} from "../app/components/clarinet-hero/physics.ts";

function particle(overrides = {}) {
  const p = {
    homeX: 100, homeY: 200, x: 100, y: 200, vx: 0, vy: 0,
    mobility: 1, maxOffset: 14, delay: 0,
    ...overrides,
  };
  return { ...p, previousX: p.previousX ?? p.x, previousY: p.previousY ?? p.y };
}

function displayedPosition(p, alpha) {
  const previousX = p.previousX ?? p.x;
  const previousY = p.previousY ?? p.y;
  return {
    x: previousX + (p.x - previousX) * alpha,
    y: previousY + (p.y - previousY) * alpha,
  };
}

function runAtRate(hz) {
  const clock = createClock();
  const particles = [particle(), particle({ homeX: 400, x: 400 })];
  let steps = 0;
  const simulate = (time) => {
    stepParticles(particles, time <= 0.5 ? { x: 102, y: 202 } : null, 1, "ready", time);
  };
  for (let frame = 0; frame <= hz * 3; frame += 1) {
    steps += clock.advance((frame / hz) * 1000, simulate).steps;
  }
  return { steps, particles, time: clock.animationTime };
}

test("normal 60, 120 and 144 Hz RAF sequences produce identical simulation and recovery", () => {
  const baseline = runAtRate(60);
  assert.equal(baseline.steps, 180);
  assert.equal(baseline.time, 3);
  assert.deepEqual(runAtRate(120), baseline);
  assert.deepEqual(runAtRate(144), baseline);
  assert.ok(Math.hypot(baseline.particles[0].x - 100, baseline.particles[0].y - 200) < 0.00001);
});

test("120 and 144 Hz displays move between fixed steps instead of repeating 60 Hz positions", () => {
  for (const hz of [120, 144]) {
    const clock = createClock();
    const p = particle({ x: 114 });
    let previousDisplay = displayedPosition(p, 0);
    let intermediateFrames = 0;
    for (let frame = 0; frame <= 12; frame += 1) {
      const result = clock.advance(frame * 1000 / hz, time => {
        stepParticles([p], null, 1, "ready", time);
      });
      const displayed = displayedPosition(p, result.interpolation);
      assert.equal(result.interpolation, clock.interpolation);
      assert.equal(result.displayTime, clock.displayTime);
      assert.ok(Math.abs(result.displayTime - frame / hz) < 1e-10);
      assert.ok(displayed.x >= Math.min(p.previousX, p.x) - 1e-10);
      assert.ok(displayed.x <= Math.max(p.previousX, p.x) + 1e-10);
      if (frame >= 3 && result.steps === 0) {
        assert.ok(Math.abs(displayed.x - previousDisplay.x) > 0.001, `${hz} Hz repeated a moving position`);
        assert.ok(result.interpolation > 0 && result.interpolation < 1);
        intermediateFrames += 1;
      }
      previousDisplay = displayed;
    }
    assert.ok(intermediateFrames >= 4);
  }
});

test("hiding between steps preserves the displayed frame and physics momentum on return", () => {
  const clock = createClock();
  const p = particle({ x: 114, y: 205 });
  const simulate = time => stepParticles([p], null, 1, "ready", time);
  clock.advance(0, simulate);
  clock.advance(25, simulate);
  const beforeHide = displayedPosition(p, clock.interpolation);
  const simulationBeforeHide = { x: p.x, y: p.y, vx: p.vx, vy: p.vy };
  const activeTime = clock.animationTime;
  const displayTime = clock.displayTime;
  freezeInterpolation([p], clock.interpolation);
  clock.reset();
  assert.equal(clock.interpolation, 0);
  assert.equal(clock.animationTime, activeTime);
  assert.equal(clock.displayTime, displayTime);
  assert.deepEqual({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }, simulationBeforeHide);
  assert.equal(clock.advance(900000, simulate).steps, 0);
  assert.equal(clock.displayTime, displayTime);
  assert.deepEqual(displayedPosition(p, clock.interpolation), beforeHide);
  clock.advance(900000 + 1000 / 120, simulate);
  const afterResume = displayedPosition(p, clock.interpolation);
  assert.ok(afterResume.x < beforeHide.x && afterResume.x > p.x);
  assert.ok(afterResume.y < beforeHide.y && afterResume.y > p.y);
  assert.deepEqual({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }, simulationBeforeHide);
});

test("fractional 120 and 144 Hz suspension preserves ambient phase without reset drift", () => {
  for (const hz of [120, 144]) {
    const clock = createClock();
    const simulate = () => {};
    let expectedDisplayTime = 0;
    let epoch = 0;
    for (let pause = 0; pause < 20; pause += 1) {
      clock.advance(epoch, simulate);
      // Three frames are fractional at both 120 and 144 Hz.
      const activeMs = 3 * 1000 / hz;
      clock.advance(epoch + activeMs, simulate);
      expectedDisplayTime += activeMs / 1000;
      const phase = Math.sin(clock.displayTime * 2.6);
      assert.ok(clock.interpolation > 0);
      for (let repeat = 0; repeat < 4; repeat += 1) clock.reset();
      assert.equal(clock.interpolation, 0);
      assert.equal(Math.sin(clock.displayTime * 2.6), phase);
      assert.ok(Math.abs(clock.displayTime - expectedDisplayTime) < 1e-10);
      epoch += activeMs + 60000;
      assert.equal(clock.advance(epoch, simulate).steps, 0);
      assert.equal(Math.sin(clock.displayTime * 2.6), phase);
    }
  }
});

test("long frames are capped and visibility reset excludes hidden time", () => {
  const clock = createClock();
  const visitedTimes = [];
  const visit = (time) => visitedTimes.push(time);
  clock.advance(0, visit);
  assert.equal(clock.advance(10000, visit).steps, 5);
  assert.equal(visitedTimes.length, 5);
  const beforePause = clock.animationTime;
  clock.reset();
  assert.equal(clock.advance(400000, visit).steps, 0);
  assert.equal(clock.animationTime, beforePause);
  assert.equal(clock.advance(400000 + 1000 / 60, visit).steps, 1);
  assert.equal(visitedTimes.length, 6);
});

test("entry delays and large initial displacements survive until the spring brings them home", () => {
  const p = particle({ x: -200, y: 400, delay: 0.3 });
  const initial = { ...p };
  stepParticles([p], null, 1, "entering", 0.2);
  assert.deepEqual(p, initial);
  stepParticles([p], { x: p.x + 1, y: p.y }, 1, "entering", 0.3);
  assert.ok(Math.hypot(p.x - p.homeX, p.y - p.homeY) > p.maxOffset * 10);
  for (let i = 1; i <= 240; i += 1) stepParticles([p], null, 1, "entering", 0.3 + i / 60);
  assert.ok(Math.hypot(p.x - p.homeX, p.y - p.homeY) < 0.000001);
});

test("delayed entry refreshes stale interpolation without starting the spring early", () => {
  const p = particle({ x: -200, y: 400, previousX: -500, previousY: 900, delay: .3 });
  stepParticles([p], null, 1, "entering", .2);
  assert.deepEqual(displayedPosition(p, .6), { x: -200, y: 400 });
  assert.deepEqual([p.x, p.y, p.vx, p.vy], [-200, 400, 0, 0]);
  stepParticles([p], null, 1, "entering", .3);
  assert.deepEqual(displayedPosition(p, 0), { x: -200, y: 400 });
  assert.ok(displayedPosition(p, .5).x > -200);
});

test("repulsion is local, bounded, finite at pointer coincidence, and fully returns", () => {
  const near = particle();
  const distant = particle({ homeX: 400, x: 400 });
  const originalDistant = { ...distant };
  for (let i = 1; i <= 120; i += 1) {
    stepParticles([near, distant], { x: 101, y: 202 }, 1, "ready", i / 60);
    assert.ok(Math.hypot(near.x - near.homeX, near.y - near.homeY) <= near.maxOffset + 1e-10);
  }
  assert.ok(Math.hypot(near.x - near.homeX, near.y - near.homeY) > 3);
  assert.deepEqual(distant, originalDistant);
  stepParticles([near], { x: near.x, y: near.y }, 1, "ready", 3);
  assert.ok([near.x, near.y, near.vx, near.vy].every(Number.isFinite));
  for (let i = 0; i < 240; i += 1) stepParticles([near], null, 1, "ready", 3 + i / 60);
  assert.ok(Math.hypot(near.x - near.homeX, near.y - near.homeY) < 0.000001);
  assert.ok(Math.hypot(near.vx, near.vy) < 0.000001);
});

test("the ready displacement boundary removes outward velocity without reversing it", () => {
  const p = particle({ x: 113, vx: 10, vy: 2 });
  stepParticles([p], null, 1, "ready", 1);
  const dx = p.x - p.homeX;
  const dy = p.y - p.homeY;
  assert.ok(Math.abs(Math.hypot(dx, dy) - 14) < 1e-10);
  assert.ok(Math.abs(p.vx * dx + p.vy * dy) < 1e-10);
  assert.ok(Math.hypot(p.vx, p.vy) > 0);
});

test("static mode immediately restores an entering or scattered field", () => {
  const p = particle({ x: -90, y: 5, vx: 2, vy: -4, delay: 10 });
  stepParticles([p], { x: 100, y: 200 }, 1, "static", 0);
  assert.deepEqual([p.x, p.y, p.vx, p.vy], [p.homeX, p.homeY, 0, 0]);
  assert.deepEqual(displayedPosition(p, 0), { x: p.homeX, y: p.homeY });
  assert.deepEqual(displayedPosition(p, .5), { x: p.homeX, y: p.homeY });
});

test("fixed seeds reproduce entry samples without producing out-of-range values", () => {
  const a = seededRandom(13);
  const b = seededRandom(13);
  const c = seededRandom(14);
  const sequence = Array.from({ length: 128 }, a);
  assert.deepEqual(Array.from({ length: 128 }, b), sequence);
  assert.notDeepEqual(Array.from({ length: 128 }, c), sequence);
  assert.ok(sequence.every((value) => value >= 0 && value < 1));
});
