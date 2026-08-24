import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicRoot = join(root, "public", "assets");
const sourceRoot = join(root, "source-assets");

const jobs = [
  {
    source: join(sourceRoot, "brand", "og.png"),
    destination: join(publicRoot, "brand", "og-1774.jpg"),
    transform: (image) =>
      image.jpeg({
        quality: 90,
        chromaSubsampling: "4:4:4",
        progressive: true,
        mozjpeg: true,
      }),
  },
];

for (const job of jobs) {
  await job.transform(sharp(job.source).rotate()).toFile(job.destination);
  const { size } = await stat(job.destination);
  console.log(`${job.destination.slice(root.length + 1)}: ${Math.round(size / 1024)} KB`);
}
