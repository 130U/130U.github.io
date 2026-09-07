export const DITHER_MOTION = {
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
} as const;

export function cubicFalloff(distance: number, radius: number) {
  if (distance >= radius) return 0;
  const proximity = 1 - distance / radius;
  return proximity * proximity * proximity;
}

export function integrateSpringAxis(
  value: number,
  velocity: number,
  target: number,
) {
  const nextVelocity =
    (velocity + (target - value) * DITHER_MOTION.recovery) *
    DITHER_MOTION.velocityRetention;
  return [value + nextVelocity, nextVelocity] as const;
}
