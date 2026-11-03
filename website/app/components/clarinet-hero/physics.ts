/** All positions and velocities use CSS px, independently of the canvas DPR. */
export interface Particle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  /** Previous fixed-step position, used only to interpolate RAF rendering. */
  previousX?: number;
  previousY?: number;
  vx: number;
  vy: number;
  mobility: number;
  /** Already scaled to the current stage's CSS px. */
  maxOffset: number;
  /** Entry delay in active animation seconds, never wall-clock time. */
  delay: number;
}

export type MotionState = "entering" | "ready" | "static";
export type Pointer = { x: number; y: number } | null;

export const STEP_SECONDS = 1 / 60;
const MAX_STEPS_PER_FRAME = 5;

/** Reproducible entry positions and sampling; never call this during drawing. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Preserve the displayed position before clearing the clock's interpolation.
 * The simulation position and velocity stay untouched, so suspension neither
 * injects a force nor loses the spring's momentum.
 */
export function freezeInterpolation(particles: Particle[], interpolation: number): void {
  const alpha = Math.max(0, Math.min(1, interpolation));
  for (const particle of particles) {
    const previousX = particle.previousX ?? particle.x;
    const previousY = particle.previousY ?? particle.y;
    particle.previousX = previousX + (particle.x - previousX) * alpha;
    particle.previousY = previousY + (particle.y - previousY) * alpha;
  }
}

/** One fixed-60-Hz spring update. Do not multiply its constants by dt. */
export function stepParticles(
  particles: Particle[],
  pointer: Pointer,
  scale: number,
  state: MotionState,
  animationTime: number,
): void {
  const radius = 42 * scale;

  for (const particle of particles) {
    particle.previousX = particle.x;
    particle.previousY = particle.y;
    if (state === "static") {
      particle.x = particle.homeX;
      particle.y = particle.homeY;
      particle.previousX = particle.homeX;
      particle.previousY = particle.homeY;
      particle.vx = 0;
      particle.vy = 0;
      continue;
    }
    if (state === "entering" && animationTime < particle.delay) continue;

    particle.vx += (particle.homeX - particle.x) * 0.05;
    particle.vy += (particle.homeY - particle.y) * 0.05;

    if (state === "ready" && pointer) {
      const dx = particle.x - pointer.x;
      const dy = particle.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0.001 && distance < radius) {
        const push = (1 - distance / radius) * 2.2 * scale * particle.mobility;
        particle.vx += (dx / distance) * push;
        particle.vy += (dy / distance) * push;
      }
    }

    particle.vx *= 0.8;
    particle.vy *= 0.8;
    particle.x += particle.vx;
    particle.y += particle.vy;

    // An entering particle must be free to travel in from the stage's perimeter.
    if (state === "ready") {
      const dx = particle.x - particle.homeX;
      const dy = particle.y - particle.homeY;
      const distance = Math.hypot(dx, dy);
      if (distance > particle.maxOffset && distance > 0) {
        const nx = dx / distance;
        const ny = dy / distance;
        particle.x = particle.homeX + nx * particle.maxOffset;
        particle.y = particle.homeY + ny * particle.maxOffset;
        // Remove only outward velocity; preserve tangent motion and recovery.
        const outwardVelocity = particle.vx * nx + particle.vy * ny;
        if (outwardVelocity > 0) {
          particle.vx -= nx * outwardVelocity;
          particle.vy -= ny * outwardVelocity;
        }
      }
    }
  }
}

/** The caller owns RAF, visibility and disposal; this clock only advances while called. */
export function createClock() {
  let previousTime: number | null = null;
  let accumulator = 0;
  let totalSteps = 0;
  // Continuous active time includes fractional steps discarded by suspension.
  // Keeping it independently prevents reset from rewinding ambient motion.
  let displayTime = 0;

  return {
    get animationTime() {
      return totalSteps * STEP_SECONDS;
    },
    get interpolation() {
      return Math.min(1, accumulator / STEP_SECONDS);
    },
    get displayTime() {
      return displayTime;
    },
    /** Freeze particle interpolation first if suspending a visible moving field. */
    reset() {
      previousTime = null;
      accumulator = 0;
    },
    advance(nowMs: number, simulate: (animationTime: number) => void) {
      if (previousTime === null) previousTime = nowMs;
      const elapsed = Math.max(0, (nowMs - previousTime) / 1000);
      previousTime = nowMs;
      const activeElapsed = Math.min(elapsed, STEP_SECONDS * MAX_STEPS_PER_FRAME);
      accumulator += activeElapsed;
      displayTime += activeElapsed;

      let steps = 0;
      // Tolerance prevents equivalent 60/120/144 Hz timestamp sequences losing a step.
      while (accumulator + 1e-10 >= STEP_SECONDS && steps < MAX_STEPS_PER_FRAME) {
        totalSteps += 1;
        simulate(totalSteps * STEP_SECONDS);
        accumulator = Math.max(0, accumulator - STEP_SECONDS);
        steps += 1;
      }
      return {
        steps,
        animationTime: totalSteps * STEP_SECONDS,
        interpolation: Math.min(1, accumulator / STEP_SECONDS),
        displayTime,
      };
    },
  };
}
