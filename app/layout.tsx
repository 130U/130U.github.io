import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://130u.github.io"),
  title: {
    default: "Theodore Ouyang",
    template: "%s | Theodore Ouyang",
  },
  description:
    "Theodore Ouyang is an AI entrepreneur, Sequoia Scholar, and Duke University alumnus based in Beijing.",
  openGraph: {
    title: "Theodore Ouyang",
    description: "AI Entrepreneur · Sequoia Scholar · Duke University ’25",
    type: "website",
    images: [{ url: "/og.png", width: 1734, height: 907 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Theodore Ouyang",
    description: "AI Entrepreneur · Sequoia Scholar · Duke University ’25",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
