import type { Metadata } from "next";

export const SITE_URL = "https://www.theodoreoy.com";
export const SITE_NAME = "Theodore Ouyang";
export const HOME_TITLE =
  "Strategy at a World Model Unicorn | Duke B.S. & M.Eng. | Sequoia Scholar, Cohort 8";
export const DEFAULT_DESCRIPTION =
  "Theodore Ouyang works at the intersection of artificial intelligence, strategy, and finance, translating frontier AI capabilities into products, operating models, and long-term business advantage.";

export type ActivePage =
  | "home"
  | "now"
  | "education"
  | "experience"
  | "posts";

export const navigation: ReadonlyArray<{
  key: ActivePage;
  label: string;
  href: string;
}> = [
  { key: "home", label: "Home", href: "/" },
  { key: "education", label: "Education", href: "/education/" },
  { key: "experience", label: "Past Experience", href: "/past-experience/" },
  { key: "now", label: "Current Chapter", href: "/now/" },
  { key: "posts", label: "Personal Posts", href: "/personal-posts/" },
];

export const coreRoutes = navigation.map(({ href }) => href);

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
};

const defaultImage = {
  url: "/assets/brand/og-1774.jpg",
  width: 1774,
  height: 887,
  alt: "Theodore Ouyang",
};

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  type = "website",
  publishedTime,
  image = defaultImage,
}: PageMetadataOptions): Metadata {
  const openGraph = {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    images: [image],
    ...(type === "article"
      ? { type: "article" as const, publishedTime }
      : { type: "website" as const }),
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
