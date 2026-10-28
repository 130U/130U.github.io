import type { Metadata } from "next";

export const SITE_URL = "https://www.theodoreoy.com";
export const SITE_NAME = "Theodore Ouyang";
export const HOME_TITLE = "About | Theodore Ouyang";
export const FELLOWSHIP = { title: "Sequoia Fellow", cohort: 8 } as const;
export const DEFAULT_DESCRIPTION =
  `Theodore Ouyang is a Duke University graduate and ${FELLOWSHIP.title} in Cohort ${FELLOWSHIP.cohort}, exploring how artificial intelligence can become useful in everyday life.`;
export const ABOUT_DESCRIPTION =
  "Theodore Ouyang's research, education, and interests in mathematics and AI.";

export type ActivePage =
  | "about"
  | "experience";

export const navigation: ReadonlyArray<{
  key: ActivePage;
  label: string;
  href: string;
}> = [
  { key: "about", label: "About", href: "/" },
  { key: "experience", label: "Experience", href: "/experience/" },
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
