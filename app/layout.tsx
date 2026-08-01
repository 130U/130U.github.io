import type { Metadata } from "next";
import {
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./lib/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: "%s | Theodore Ouyang",
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      { url: "/assets/brand/favicon.ico", sizes: "any" },
      {
        url: "/assets/brand/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/brand/favicon-16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/assets/brand/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    images: [{ url: "/assets/brand/og-1774.jpg", width: 1774, height: 887 }],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/assets/brand/og-1774.jpg"],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: SITE_NAME,
  url: absoluteUrl("/"),
  sameAs: ["https://github.com/130U"],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Duke University",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(personJsonLd).replaceAll("<", "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
