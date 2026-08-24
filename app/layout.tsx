import type { Metadata, Viewport } from "next";
import {
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./lib/content/site";
import "./globals.css";

const SCRIPT_SOURCE =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  SCRIPT_SOURCE,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self'",
  "frame-src 'none'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const viewport: Viewport = {
  themeColor: "#f7f6f5",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "portfolio",
  referrer: "strict-origin-when-cross-origin",
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
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
      </head>
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
