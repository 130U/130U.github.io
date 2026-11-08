/** Whole-device-pixel footprints; moving dots use subpixel coverage. */
export function drawPixel(target: CanvasRenderingContext2D, x: number, y: number, size: number, dpr: number, snap = true) {
  const pixels = Math.max(1, Math.round(size * dpr));
  const left = x * dpr - pixels / 2;
  const top = y * dpr - pixels / 2;
  target.fillRect((snap ? Math.round(left) : left) / dpr, (snap ? Math.round(top) : top) / dpr, pixels / dpr, pixels / dpr);
}

/** Copy equal-sized backing stores without a second CSS-size resampling pass. */
export function blit(target: CanvasRenderingContext2D, source: HTMLCanvasElement) {
  target.save();
  target.setTransform(1, 0, 0, 1, 0, 0);
  target.drawImage(source, 0, 0);
  target.restore();
}
