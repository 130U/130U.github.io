export type SpatialAxis = {
  value: number;
  velocity: number;
};

export type SpatialPose = {
  yaw: SpatialAxis;
  pitch: SpatialAxis;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function createSpatialPose(): SpatialPose {
  return {
    yaw: { value: 0, velocity: 0 },
    pitch: { value: 0, velocity: 0 },
  };
}

export function resetSpatialPose(pose: SpatialPose) {
  pose.yaw.value = 0;
  pose.yaw.velocity = 0;
  pose.pitch.value = 0;
  pose.pitch.velocity = 0;
}

function rubberBandAngle(value: number, softLimit: number, hardLimit: number) {
  const magnitude = Math.abs(value);
  if (magnitude <= softLimit) return value;

  const range = hardLimit - softLimit;
  if (range <= 0) return Math.sign(value) * softLimit;
  const excess = magnitude - softLimit;
  const resisted = softLimit + range * (1 - Math.exp(-excess / range));
  return Math.sign(value) * Math.min(resisted, hardLimit);
}

export function mapDragAngle(
  startAngle: number,
  displacement: number,
  travel: number,
  softLimit: number,
  hardLimit: number,
) {
  if (travel <= 0) return clamp(startAngle, -hardLimit, hardLimit);
  const proposed = startAngle + (displacement / travel) * softLimit;
  return rubberBandAngle(proposed, softLimit, hardLimit);
}

export function advanceCriticalSpring(axis: SpatialAxis, delta: number, response: number) {
  advanceCriticalSpringTo(axis, 0, delta, response);
}

export function advanceCriticalSpringTo(
  axis: SpatialAxis,
  target: number,
  delta: number,
  response: number,
) {
  if (delta <= 0 || response <= 0) return;

  // Exact critically damped integration. `response` is the approximate time
  // required to settle to one percent, not a fixed animation duration.
  const angularFrequency = 4.6 / response;
  const displacement = axis.value - target;
  const coupling = axis.velocity + angularFrequency * displacement;
  const decay = Math.exp(-angularFrequency * delta);
  const nextDisplacement = (displacement + coupling * delta) * decay;
  const nextValue = target + nextDisplacement;
  const nextVelocity = (axis.velocity - angularFrequency * coupling * delta) * decay;

  // A critically damped value must never cross its target. This also makes an
  // interrupted return safe to retarget from the current presentation value.
  if (
    displacement !== 0 &&
    Math.sign(nextDisplacement) !== Math.sign(displacement)
  ) {
    axis.value = target;
    axis.velocity = 0;
    return;
  }

  axis.value = Math.abs(nextValue - target) < 0.000_01 ? target : nextValue;
  axis.velocity = Math.abs(nextVelocity) < 0.000_01 ? 0 : nextVelocity;
}

export function phaseInteractionGain(wordAmount: number, scatterGain: number) {
  const amount = clamp(wordAmount, 0, 1);
  const smoothAmount = amount * amount * (3 - 2 * amount);
  return scatterGain + (1 - scatterGain) * smoothAmount;
}
