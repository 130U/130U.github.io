import type { Metadata } from "next";

export const SITE_URL = "https://www.theodoreoy.com";
export const SITE_NAME = "Theodore Ouyang";
export const HOME_TITLE = SITE_NAME;
export const FELLOWSHIP = "Sequoia Fellow";
export const DEFAULT_DESCRIPTION =
  `Theodore Ouyang makes high-stakes conclusions verifiable across derivative pricing, frontier AI evaluation, and law. Duke Alumnus and ${FELLOWSHIP}.`;

export type ActivePage =
  | "about"
  | "experience"
  | "blog";

export type ParentPage = Readonly<{ href: string; label: string }>;

export const navigation: ReadonlyArray<{
  key: ActivePage;
  label: string;
  href: string;
}> = [
  { key: "about", label: "About", href: "/" },
  { key: "experience", label: "Experience", href: "/experience/" },
  { key: "blog", label: "Blog", href: "/blog/" },
];

export const coreRoutes = [...navigation.map(({ href }) => href), "/coursework/"];

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
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
  image = defaultImage,
}: PageMetadataOptions): Metadata {
  const openGraph = {
    title,
    description,
    url: path,
    siteName: SITE_NAME,
    images: [image],
    type: "website" as const,
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
