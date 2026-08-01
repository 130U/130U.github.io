import { stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const publicRoot = join(root, "public", "assets");

const jobs = [
  ...[384, 768].flatMap((width) => [
    {
      source: join(publicRoot, "profile", "theodore-avatar-warm.png"),
      destination: join(
        publicRoot,
        "profile",
        `theodore-avatar-warm-${width}.avif`,
      ),
      transform: (image) =>
        image.resize({ width, withoutEnlargement: true }).avif({ quality: 78, effort: 6 }),
    },
    {
      source: join(publicRoot, "profile", "theodore-avatar-warm.png"),
      destination: join(
        publicRoot,
        "profile",
        `theodore-avatar-warm-${width}.webp`,
      ),
      transform: (image) =>
        image.resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 6 }),
    },
  ]),
  ...[720, 1440].map((width) => ({
    source: join(publicRoot, "posts", "wam-vla-two-paths-en.png"),
    destination: join(publicRoot, "posts", `wam-vla-two-paths-en-${width}.webp`),
    transform: (image) =>
      image
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 92, effort: 6, smartSubsample: true }),
  })),
  {
    source: join(publicRoot, "brand", "og.png"),
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
