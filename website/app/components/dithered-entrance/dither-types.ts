export type DitherPointField = {
  count: number;
  homeX: Float32Array;
  homeY: Float32Array;
  x: Float32Array;
  y: Float32Array;
  velocityX: Float32Array;
  velocityY: Float32Array;
  radius: Float32Array;
};

export type DitherRipple = {
  x: number;
  y: number;
  startedAt: number;
};
