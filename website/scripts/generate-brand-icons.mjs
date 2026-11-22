import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE_MARK = path.join(ROOT, "source-assets", "brand", "lo-mark.svg");
const PUBLIC_BRAND = path.join(ROOT, "public", "assets", "brand");
const PUBLIC_MARK = path.join(PUBLIC_BRAND, "lo-mark.svg");

const INK = "#0b0b0b";
const WHITE = "#ffffff";

// The mark on its 20-unit grid: the L draws the left and bottom axes two units
// thick, and the O is a ring of outer radius 8 and inner radius 6 centered at (12, 8),
// two units clear of each axis. Each raster places it at a whole-pixel offset and a
// scale that keeps every straight edge on the pixel grid.
function markPaths(offset, scale, fill) {
  const unit = (value) => value * scale;
  const cx = offset + unit(12);
  const cy = offset + unit(8);
  const outer = unit(8);
  const inner = unit(6);
  return [
    `<path fill="${fill}" d="M${offset} ${offset}h${unit(2)}v${unit(18)}h${unit(18)}v${unit(2)}H${offset}Z"/>`,
    `<path fill="${fill}" fill-rule="evenodd" d="M${cx} ${cy - outer}a${outer} ${outer} 0 1 0 0 ${2 * outer} ${outer} ${outer} 0 1 0 0 ${-2 * outer}Zm0 ${outer - inner}a${inner} ${inner} 0 1 1 0 ${2 * inner} ${inner} ${inner} 0 1 1 0 ${-2 * inner}Z"/>`,
  ].join("");
}

function tileSvg({ size, offset, scale, radius }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${INK}"/>${markPaths(offset, scale, WHITE)}</svg>`;
}

function renderTile(tile) {
  return sharp(Buffer.from(tileSvg(tile))).png({ compressionLevel: 9 }).toBuffer();
}

function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(images.length * 16);
  let offset = header.length + directory.length;

  images.forEach(({ size, buffer }, index) => {
    const entryOffset = index * 16;
    directory.writeUInt8(size === 256 ? 0 : size, entryOffset);
    directory.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    directory.writeUInt16LE(1, entryOffset + 4);
    directory.writeUInt16LE(32, entryOffset + 6);
    directory.writeUInt32LE(buffer.length, entryOffset + 8);
    directory.writeUInt32LE(offset, entryOffset + 12);
    offset += buffer.length;
  });

  return Buffer.concat([header, directory, ...images.map(({ buffer }) => buffer)]);
}

// Browser icons: white on a rounded ink tile, so the mark holds on light and dark tab strips.
const ICO_TILES = [
  { size: 16, offset: 3, scale: 0.5, radius: 3 },
  { size: 32, offset: 6, scale: 1, radius: 6 },
  { size: 48, offset: 9, scale: 1.5, radius: 9 },
];
// Touch icon: full bleed, since the platform applies its own mask.
const TOUCH_TILE = { size: 180, offset: 40, scale: 5, radius: 0 };

await mkdir(PUBLIC_BRAND, { recursive: true });
const [icoImages, touchIcon] = await Promise.all([
  Promise.all(ICO_TILES.map(async (tile) => ({ size: tile.size, buffer: await renderTile(tile) }))),
  renderTile(TOUCH_TILE),
]);

await Promise.all([
  copyFile(SOURCE_MARK, PUBLIC_MARK),
  writeFile(path.join(PUBLIC_BRAND, "favicon.ico"), createIco(icoImages)),
  writeFile(path.join(PUBLIC_BRAND, "apple-touch-icon.png"), touchIcon),
]);

console.log("Generated the LO browser icon, ICO and touch icon.");
