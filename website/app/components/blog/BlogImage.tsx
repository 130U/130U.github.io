import { join } from "node:path";
import { cache } from "react";
import sharp from "sharp";

const dimensions = cache(async (src: string) => {
  const { width, height } = await sharp(join(process.cwd(), "public", src.slice(1))).metadata();
  if (!width || !height) throw new Error(`Blog image has no intrinsic dimensions: ${src}`);
  return { width, height };
});

/**
 * A post image at its intrinsic aspect ratio, reserved before it loads. Images at
 * least two and a half times as wide as they are tall are marked as panoramas.
 */
export async function BlogImage({ src, alt, className, priority = false }: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const size = await dimensions(src);
  const panorama = size.width / size.height >= 2.5;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      {...size}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      data-panorama={panorama ? "" : undefined}
    />
  );
}
