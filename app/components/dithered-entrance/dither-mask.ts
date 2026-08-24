import type { DitherPointField } from "./dither-types";

const BAYER_4X4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5,
] as const;

function seededNoise(x: number, y: number) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function setFittedFont(
  context: CanvasRenderingContext2D,
  text: string,
  requestedSize: number,
  maximumWidth: number,
) {
  const stack = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
  context.font = `800 ${requestedSize}px ${stack}`;
  const measured = context.measureText(text).width;
  const size = measured > maximumWidth
    ? requestedSize * (maximumWidth / measured)
    : requestedSize;
  context.font = `800 ${size}px ${stack}`;
}

function drawBalancedWordmark(context: CanvasRenderingContext2D, size: number) {
  context.clearRect(0, 0, size, size);
  context.fillStyle = "#000";
  context.textAlign = "center";
  context.textBaseline = "middle";

  setFittedFont(context, "THEODORE", size * 0.17, size * 0.9);
  context.fillText("THEODORE", size / 2, size * 0.405);
  setFittedFont(context, "OUYANG", size * 0.235, size * 0.9);
  context.fillText("OUYANG", size / 2, size * 0.61);
}

export function createBalancedDitherField(size: number): DitherPointField {
  const mask = document.createElement("canvas");
  mask.width = size;
  mask.height = size;
  const context = mask.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return {
      count: 0,
      homeX: new Float32Array(),
      homeY: new Float32Array(),
      x: new Float32Array(),
      y: new Float32Array(),
      velocityX: new Float32Array(),
      velocityY: new Float32Array(),
      radius: new Float32Array(),
    };
  }

  drawBalancedWordmark(context, size);
  const pixels = context.getImageData(0, 0, size, size).data;
  const homeX: number[] = [];
  const homeY: number[] = [];
  const radii: number[] = [];
  const keepRate = size >= 440 ? 0.56 : 0.6;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const alpha = pixels[(y * size + x) * 4 + 3] / 255;
      if (alpha <= 0) continue;

      const threshold = (BAYER_4X4[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
      const noise = seededNoise(x, y);
      if (alpha < threshold || noise > keepRate) continue;

      homeX.push(x);
      homeY.push(y);
      radii.push(0.42 + seededNoise(y, x) * 0.42);
    }
  }

  const x = Float32Array.from(homeX);
  const y = Float32Array.from(homeY);
  return {
    count: x.length,
    homeX: Float32Array.from(homeX),
    homeY: Float32Array.from(homeY),
    x,
    y,
    velocityX: new Float32Array(x.length),
    velocityY: new Float32Array(x.length),
    radius: Float32Array.from(radii),
  };
}
