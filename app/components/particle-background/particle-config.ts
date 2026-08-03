import type { TimelinePhase } from "./particle-types";

export const PARTICLE_CONFIG = {
  desktopParticles: 4_000,
  mobileParticles: 2_200,
  reducedMotionParticles: 900,
  mobileBreakpoint: 720,
  maxPixelRatio: 2,
  camera: {
    fov: 55,
    near: 0.1,
    far: 1_000,
    z: 130,
    parallaxX: 5,
    parallaxY: 3,
  },
  points: {
    size: 1.9,
    scatterOpacity: 0.34,
    wordOpacity: 0.86,
    minimumGray: 0.3,
    maximumGray: 0.52,
  },
  morph: {
    maximumDelay: 0.38,
    targetWidthRatio: 0.68,
    targetHeightRatio: 0.22,
    targetJitterRatio: 0.008,
  },
  pointer: {
    radius: 48,
    force: 80,
    spring: 12,
    damping: 9,
    maximumOffset: 12,
  },
} as const;

export const PARTICLE_TIMELINE: readonly TimelinePhase[] = [
  { kind: "hold", shape: "scatter", duration: 1.8 },
  { kind: "morph", to: "theodore", duration: 3 },
  { kind: "hold", shape: "theodore", duration: 4 },
  { kind: "morph", to: "scatter", duration: 3 },
  { kind: "hold", shape: "scatter", duration: 1.6 },
  { kind: "morph", to: "ouyang", duration: 3 },
  { kind: "hold", shape: "ouyang", duration: 4 },
  { kind: "morph", to: "scatter", duration: 3 },
  { kind: "hold", shape: "scatter", duration: 1.6 },
];
