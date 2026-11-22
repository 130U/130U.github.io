import type { MetadataRoute } from "next";
import { publicRoutes } from "./lib/content/routes";
import { absoluteUrl } from "./lib/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((path) => ({ url: absoluteUrl(path) }));
}
