import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShowcaseDomain, showcaseDomains } from "../../lib/content/experience-showcase";
import { createPageMetadata } from "../../lib/content/site";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const dynamicParams = false;
export function generateStaticParams() { return showcaseDomains.map(({ slug }) => ({ slug })); }
type Params = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const domain = getShowcaseDomain(slug);
  if (!domain) notFound();
  return createPageMetadata({ title: `${domain.name} | Experience`, description: domain.entries[0].summary, path: "/experience/" });
}
export default async function ExperienceDomain({ params }: Params) {
  const { slug } = await params;
  const domain = getShowcaseDomain(slug);
  if (!domain) notFound();
  return <ExperienceDomainPage domain={domain} />;
}
