import type { SampledWord, SampledWords } from "./particle-types";

const SAMPLE_CANVAS_WIDTH = 1_800;
const SAMPLE_CANVAS_HEIGHT = 520;
const SAMPLE_FONT_SIZE = 240;
const SAMPLE_STEP = 3;
const FONT_FAMILY =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function sampleWord(
  context: CanvasRenderingContext2D,
  word: "THEODORE" | "OUYANG",
): SampledWord {
  context.clearRect(0, 0, SAMPLE_CANVAS_WIDTH, SAMPLE_CANVAS_HEIGHT);
  context.fillStyle = "#000";
  context.font = `700 ${SAMPLE_FONT_SIZE}px ${FONT_FAMILY}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(word, SAMPLE_CANVAS_WIDTH / 2, SAMPLE_CANVAS_HEIGHT / 2);

  const pixels = context.getImageData(
    0,
    0,
    SAMPLE_CANVAS_WIDTH,
    SAMPLE_CANVAS_HEIGHT,
  ).data;
  const points: number[] = [];
  let minimumX = Number.POSITIVE_INFINITY;
  let maximumX = Number.NEGATIVE_INFINITY;
  let minimumY = Number.POSITIVE_INFINITY;
  let maximumY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < SAMPLE_CANVAS_HEIGHT; y += SAMPLE_STEP) {
    for (let x = 0; x < SAMPLE_CANVAS_WIDTH; x += SAMPLE_STEP) {
      const alpha = pixels[(y * SAMPLE_CANVAS_WIDTH + x) * 4 + 3];
      if (alpha <= 128) continue;

      const normalizedX = (x - SAMPLE_CANVAS_WIDTH / 2) / SAMPLE_FONT_SIZE;
      const normalizedY = (SAMPLE_CANVAS_HEIGHT / 2 - y) / SAMPLE_FONT_SIZE;
      points.push(normalizedX, normalizedY, 0);
      minimumX = Math.min(minimumX, normalizedX);
      maximumX = Math.max(maximumX, normalizedX);
      minimumY = Math.min(minimumY, normalizedY);
      maximumY = Math.max(maximumY, normalizedY);
    }
  }

  if (points.length < 300) {
    throw new Error(`Unable to sample enough particles for ${word}.`);
  }

  const centerX = (minimumX + maximumX) / 2;
  const centerY = (minimumY + maximumY) / 2;
  for (let index = 0; index < points.length; index += 3) {
    points[index] -= centerX;
    points[index + 1] -= centerY;
  }

  return {
    points: new Float32Array(points),
    width: maximumX - minimumX,
    height: maximumY - minimumY,
  };
}

export function sampleParticleWords(): SampledWords {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_CANVAS_WIDTH;
  canvas.height = SAMPLE_CANVAS_HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("The browser cannot create a text-sampling canvas.");

  const theodore = sampleWord(context, "THEODORE");
  const ouyang = sampleWord(context, "OUYANG");
  return {
    theodore,
    ouyang,
    maxWidth: Math.max(theodore.width, ouyang.width),
    maxHeight: Math.max(theodore.height, ouyang.height),
  };
}
