import type { Metadata } from "next";
import "./globals.css";

const title =
  "Strategy at a World Model Unicorn | Duke B.S. & M.Eng. | Sequoia Scholar, Cohort 8";
const description =
  "Theodore Ouyang works at the intersection of artificial intelligence, strategy, and finance, translating frontier AI capabilities into products, operating models, and long-term business advantage.";

export const metadata: Metadata = {
  metadataBase: new URL("https://130u.github.io"),
  title: {
    default: title,
    template: "%s | Theodore Ouyang",
  },
  description,
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
