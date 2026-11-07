// The scene is a fixed 1286 × 1223 model; its stage owns the layout.
const HEIGHT_PER_WIDTH = 1223 / 1286;

/**
 * Match the CSS box to its integer backing store and align its viewport origin.
 * Observe the stage, not this canvas: inline rounding must never become the
 * source of the next responsive measurement. Backing-store allocation stays
 * with the renderer, so calling this on scroll cannot clear the bitmap.
 */
export function alignCanvas(canvas: HTMLCanvasElement) {
  const actualDpr = typeof devicePixelRatio === "number" && Number.isFinite(devicePixelRatio) && devicePixelRatio > 0
    ? devicePixelRatio : 1;
  const dpr = Math.min(actualDpr, 3);
  const stage = canvas.parentElement;
  const rect = (stage ?? canvas).getBoundingClientRect();
  const stageStyle = stage ? getComputedStyle(stage) : null;
  const parsedScale = Number.parseFloat(stageStyle?.getPropertyValue("--canvas-scale") ?? "");
  const parsedLeft = Number.parseFloat(stageStyle?.getPropertyValue("--canvas-left") ?? "");
  const scale = Number.isFinite(parsedScale) && parsedScale > 0 ? parsedScale : 1;
  const leftFraction = Number.isFinite(parsedLeft) ? parsedLeft : 0;
  const rawWidth = Math.max(0, rect.width * scale);
  const width = Math.round(rawWidth * dpr) / dpr;
  const height = Math.round(rawWidth * HEIGHT_PER_WIDTH * dpr) / dpr;

  function write(property: "width" | "height" | "left" | "top", value: number) {
    if (!canvas.style) return;
    // CSSOM may round its serialized decimals. Avoid repeating equivalent
    // writes, while keeping the tolerance well below one device pixel.
    const current = Number.parseFloat(canvas.style[property]);
    if (Number.isFinite(current) && Math.abs(current - value) < .001) return;
    canvas.style[property] = `${value}px`;
  }

  write("width", width);
  write("height", height);
  if (stage) {
    const rawLeft = rect.width * leftFraction;
    const viewportLeft = rect.left + rawLeft;
    const snappedLeft = Math.round(viewportLeft * actualDpr) / actualDpr;
    const snappedTop = Math.round(rect.top * actualDpr) / actualDpr;
    write("left", rawLeft + snappedLeft - viewportLeft);
    write("top", snappedTop - rect.top);
  }
  return { width, height, dpr };
}
