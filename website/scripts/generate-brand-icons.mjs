import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const SOURCE_MARK = path.join(ROOT, "source-assets", "brand", "lo-mark.svg");
const PUBLIC_BRAND = path.join(ROOT, "public", "assets", "brand");
const PUBLIC_MARK = path.join(PUBLIC_BRAND, "lo-mark.svg");

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

async function renderSquare(mark, size, markRatio) {
  const markWidth = Math.round(size * markRatio);
  const renderedMark = await sharp(mark).resize({ width: markWidth }).png().toBuffer();
  const metadata = await sharp(renderedMark).metadata();
  const markHeight = metadata.height ?? markWidth;

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([
      {
        input: renderedMark,
        left: Math.round((size - markWidth) / 2),
        top: Math.round((size - markHeight) / 2),
      },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

await mkdir(PUBLIC_BRAND, { recursive: true });
const mark = await readFile(SOURCE_MARK);
const [favicon16, favicon32, appleTouchIcon] = await Promise.all([
  renderSquare(mark, 16, 0.84),
  renderSquare(mark, 32, 0.84),
  renderSquare(mark, 180, 0.74),
]);

await Promise.all([
  copyFile(SOURCE_MARK, PUBLIC_MARK),
  writeFile(path.join(PUBLIC_BRAND, "favicon-16.png"), favicon16),
  writeFile(path.join(PUBLIC_BRAND, "favicon-32.png"), favicon32),
  writeFile(path.join(PUBLIC_BRAND, "apple-touch-icon.png"), appleTouchIcon),
  writeFile(path.join(PUBLIC_BRAND, "favicon.ico"), createIco([
    { size: 16, buffer: favicon16 },
    { size: 32, buffer: favicon32 },
  ])),
]);

console.log("Generated the monochrome LO favicon and touch-icon family.");
