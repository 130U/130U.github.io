import type { TimelinePhase } from "./particle-types";

export const PARTICLE_CONFIG = {
  initialShape: "theodore",
  desktopParticles: 5_000,
  mobileParticles: 2_800,
  reducedMotionParticles: 1_600,
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
    size: 2.25,
    scatterOpacity: 0.38,
    wordOpacity: 0.96,
    minimumGray: 0.18,
    maximumGray: 0.38,
    redLift: 0.018,
    blueDrop: 0.012,
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
  { kind: "hold", shape: "theodore", duration: 5.5 },
  { kind: "morph", to: "scatter", duration: 2.8 },
  { kind: "hold", shape: "scatter", duration: 1.2 },
  { kind: "morph", to: "ouyang", duration: 2.8 },
  { kind: "hold", shape: "ouyang", duration: 4.5 },
  { kind: "morph", to: "scatter", duration: 2.8 },
  { kind: "hold", shape: "scatter", duration: 1.2 },
  { kind: "morph", to: "theodore", duration: 2.8 },
];
