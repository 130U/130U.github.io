import { seededRandom } from "./physics";
import { ARC, TRAILS, VIEW_HEIGHT, VIEW_WIDTH, cubicPoint, makeGeometry } from "./shape";

export interface SampleDot {
  x: number;
  y: number;
  size: number;
  /** 0: ink, 1: silver gray, 2: blue. Every sample is an opaque point. */
  color: number;
  kind: "body" | "detail" | "arc" | "trail";
  mobility: number;
  maxOffset: number;
}

type Footprint = { left: number; top: number; right: number; bottom: number };

/** Keep fittings first; nearby body dots must leave one untouched device pixel. */
function separateMaterials(dots: SampleDot[], dpr: number): SampleDot[] {
  const bucketSize = Math.max(4, Math.ceil(2 * dpr));
  const details = new Map<string, Footprint[]>();
  function footprint(dot: SampleDot): Footprint {
    const size = Math.max(1, Math.round(dot.size * dpr));
    const left = Math.round(dot.x * dpr - size / 2);
    const top = Math.round(dot.y * dpr - size / 2);
    return { left, top, right: left + size, bottom: top + size };
  }
  for (const dot of dots) {
    if (dot.kind !== "detail") continue;
    const box = footprint(dot);
    const x0 = Math.floor(box.left / bucketSize);
    const x1 = Math.floor((box.right - 1) / bucketSize);
    const y0 = Math.floor(box.top / bucketSize);
    const y1 = Math.floor((box.bottom - 1) / bucketSize);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const key = `${x},${y}`;
      const bucket = details.get(key);
      if (bucket) bucket.push(box); else details.set(key, [box]);
    }
  }
  return dots.filter(dot => {
    if (dot.kind !== "body") return true;
    const box = footprint(dot);
    const x0 = Math.floor((box.left - 1) / bucketSize);
    const x1 = Math.floor(box.right / bucketSize);
    const y0 = Math.floor((box.top - 1) / bucketSize);
    const y1 = Math.floor(box.bottom / bucketSize);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const bucket = details.get(`${x},${y}`);
      if (!bucket) continue;
      for (const detail of bucket) {
        if (box.left < detail.right + 1 && box.right > detail.left - 1
          && box.top < detail.bottom + 1 && box.bottom > detail.top - 1) return false;
      }
    }
    return true;
  });
}

/** Build-only masks describe material regions; none is used as a visible surface. */
export function sampleClarinet(width: number, dpr: number): SampleDot[] {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(dpr) || dpr <= 0) return [];
  const height = width * VIEW_HEIGHT / VIEW_WIDTH;
  const scale = width / VIEW_WIDTH;
  const physicsScale = width / 600;
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  const canvases = Array.from({ length: 3 }, () => document.createElement("canvas"));
  const result: SampleDot[] = [];
  const random = seededRandom(130);

  try {
    const contexts = canvases.map(canvas => {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      return canvas.getContext("2d", { willReadFrequently: true });
    });
    const [body, metal, outline] = contexts;
    if (!body || !metal || !outline) return result;
    const geometry = makeGeometry();
    for (const context of [body, metal, outline]) {
      context.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
      context.fillStyle = "#fff";
      context.strokeStyle = "#fff";
      context.lineCap = "round";
      context.lineJoin = "round";
    }

    // Alpha is a retention probability at the fringe.
    for (const [offset, alpha] of [[25, .035], [16, .055], [8, .08]]) {
      body.save();
      body.translate(-offset, 0);
      body.globalAlpha = alpha;
      body.fill(geometry.body);
      body.restore();
    }
    body.fill(geometry.body);
    // Red labels the bell cavity for denser black stippling.
    body.fillStyle = "#ff0000";
    body.fill(geometry.bellOpening);
    body.globalCompositeOperation = "destination-out";
    body.fill(geometry.negative);
    body.globalCompositeOperation = "source-over";

    const filledParts = [geometry.bands, geometry.pads, geometry.details, geometry.tip];
    const annuli = [geometry.rings, geometry.bellRim];
    for (const part of filledParts) metal.fill(part);
    for (const part of annuli) metal.fill(part, "evenodd");
    metal.lineWidth = 3.5;
    metal.stroke(geometry.rods);

    // Fine outlines and the restrained crescent beneath each side key.
    outline.fill(geometry.padShadows);
    outline.globalCompositeOperation = "destination-out";
    outline.fill(geometry.pads);
    outline.globalCompositeOperation = "source-over";
    outline.lineWidth = .9 / scale;
    for (const part of [...filledParts, ...annuli]) outline.stroke(part);
    outline.lineWidth = Math.max(3.5, .9 / scale);
    outline.stroke(geometry.rods);

    // Clear the same fittings from the body; the even-odd annuli leave all six cores in it.
    body.save();
    body.setTransform(1, 0, 0, 1, 0, 0);
    body.globalCompositeOperation = "destination-out";
    body.drawImage(canvases[1], 0, 0);
    body.drawImage(canvases[2], 0, 0);
    body.restore();

    const bodyPixels = body.getImageData(0, 0, pixelWidth, pixelHeight).data;
    const metalPixels = metal.getImageData(0, 0, pixelWidth, pixelHeight).data;
    const outlinePixels = outline.getImageData(0, 0, pixelWidth, pixelHeight).data;
    function alphaAt(pixels: Uint8ClampedArray, x: number, y: number) {
      if (x < 0 || y < 0 || x >= pixelWidth || y >= pixelHeight) return 0;
      return pixels[(Math.floor(y) * pixelWidth + Math.floor(x)) * 4 + 3] / 255;
    }
    function coverage(pixels: Uint8ClampedArray, x: number, y: number, radius: number) {
      return (alphaAt(pixels, x, y)
        + alphaAt(pixels, x - radius, y) + alphaAt(pixels, x + radius, y)
        + alphaAt(pixels, x, y - radius) + alphaAt(pixels, x, y + radius)) / 5;
    }
    function add(x: number, y: number, sizePixels: number, color: number, kind: SampleDot["kind"], edge = false) {
      const bell = y / dpr > height * .72;
      result.push({
        x: Math.round(x) / dpr,
        y: Math.round(y) / dpr,
        size: sizePixels / dpr,
        color,
        kind,
        mobility: edge ? .65 : bell ? .16 : .38,
        maxOffset: (edge ? 10 : bell ? 2.25 : 5) * physicsScale,
      });
    }

    const bodyPitch = Math.max(2, Math.round(2.2 * dpr));
    const bodyGap = Math.max(1, Math.round(.7 * dpr));
    const minX = Math.floor(pixelWidth * .43 / bodyPitch) * bodyPitch;
    for (let y = bodyPitch / 2; y < pixelHeight * .9; y += bodyPitch) {
      for (let x = minX + bodyPitch / 2; x < pixelWidth * .75; x += bodyPitch) {
        const alpha = coverage(bodyPixels, x, y, bodyPitch * .22);
        if (alpha < .015) continue;
        const fringe = alpha < .55;
        const refY = y / (dpr * scale);
        const refX = x / (dpr * scale);
        const axis = 879 - (refY - 295) * .2654;
        const tone = Math.max(0, Math.min(1, (refX - axis + 42) / 84));
        const index = (Math.floor(y) * pixelWidth + Math.floor(x)) * 4;
        const cavity = bodyPixels[index + 3] > 128 && bodyPixels[index + 1] < 80;
        const bell = refY > 945;
        const retention = fringe ? alpha * 1.8 : cavity ? 1 : bell ? .96 : .58 + tone * .4;
        if (random() > retention) continue;
        const desired = cavity ? 1.7 : bell ? 1.5 + tone * .2 : 1 + tone * .7;
        const size = Math.max(1, Math.min(bodyPitch - bodyGap, Math.round(desired * dpr)));
        // Silver fittings and outlines keep a clear boundary free of ink dots.
        if (alphaAt(metalPixels, x, y) > .2 || alphaAt(outlinePixels, x, y) > .3) continue;
        add(x, y, size, 0, "body", fringe);
      }
    }

    const detailPitch = Math.max(2, Math.round(1.65 * dpr));
    const detailStart = Math.floor(pixelWidth * .45 / detailPitch) * detailPitch;
    for (let y = detailPitch / 2; y < pixelHeight * .9; y += detailPitch) {
      for (let x = detailStart + detailPitch / 2; x < pixelWidth * .75; x += detailPitch) {
        const edge = coverage(outlinePixels, x, y, detailPitch * .3);
        const fill = alphaAt(metalPixels, x, y);
        if (edge < .16 && (fill < .55 || random() > .32)) continue;
        const color = edge >= .16 ? 0 : 1;
        const size = Math.max(1, Math.min(detailPitch - 1, Math.round((color === 0 ? 1.1 : .95) * dpr)));
        add(x, y, size, color, "detail");
      }
    }

    // The dotted arc has a full central crest and lighter ends.
    // Spacing follows curve length in CSS pixels.
    let previous = cubicPoint(ARC, 0);
    let distance = 0;
    for (let step = 1; step <= 600; step++) {
      const t = step / 600;
      const point = cubicPoint(ARC, t);
      distance += Math.hypot(point.x - previous.x, point.y - previous.y) * scale;
      previous = point;
      const emphasis = Math.sin(Math.PI * t) ** .65;
      const arcScale = Math.min(1, width / 600);
      const spacing = (3.4 + 4.6 * (1 - emphasis)) * Math.max(.85, arcScale);
      if (distance < spacing) continue;
      distance = 0;
      const x = point.x * scale * dpr;
      const y = point.y * scale * dpr;
      if (alphaAt(bodyPixels, x, y) + alphaAt(metalPixels, x, y) > .5) continue;
      add(x, y, Math.max(1, Math.round((1.15 + 1.05 * emphasis) * arcScale * dpr)), 2, "arc", true);
    }
    for (const curve of TRAILS) {
      for (let t = .02; t < 1; t += .035 + t * .022) {
        if (t > .6 && random() > 1 - (t - .6) * 1.6) continue;
        const point = cubicPoint(curve, t);
        add(point.x * scale * dpr, point.y * scale * dpr,
          Math.max(1, Math.round(dpr)), 0, "trail", true);
      }
    }
    return separateMaterials(result, dpr);
  } finally {
    for (const canvas of canvases) {
      canvas.width = 1;
      canvas.height = 1;
    }
  }
}
