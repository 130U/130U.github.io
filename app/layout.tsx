import type { Metadata } from "next";
import "./globals.css";

const title =
  "Strategy at a World Model Unicorn | Duke B.S. & M.Eng. | Sequoia Scholar, Cohort 8";
const description =
  "Theodore Ouyang works at the intersection of artificial intelligence, strategy, and finance, translating frontier AI capabilities into products, operating models, and long-term business advantage.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.theodoreoy.com"),
  title: {
    default: title,
    template: "%s | Theodore Ouyang",
  },
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/og.png", width: 1774, height: 887 }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
