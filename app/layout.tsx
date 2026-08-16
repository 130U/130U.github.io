import type { Metadata, Viewport } from "next";
import {
  DEFAULT_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "./lib/content/site";
import { ParticleBackground } from "./components/particle-background/ParticleBackground";
import "./globals.css";

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

export const viewport: Viewport = {
  themeColor: "#012169",
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
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CONTENT_SECURITY_POLICY} />
        <link
          rel="preload"
          href="/assets/fonts/newsreader-variable-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/fonts/newsreader-variable-italic-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/assets/fonts/shantell-sans-variable-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ParticleBackground />
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
