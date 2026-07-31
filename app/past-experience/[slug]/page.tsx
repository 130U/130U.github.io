import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getExperienceDomain,
  pastExperience,
} from "../../lib/content/experience";
import { createPageMetadata, DEFAULT_DESCRIPTION } from "../../lib/content/site";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const dynamicParams = false;

export function generateStaticParams() {
  return pastExperience.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const domain = getExperienceDomain(slug);
  if (!domain) notFound();

  return createPageMetadata({
    title: `${domain.name} | Past Experience`,
    description: DEFAULT_DESCRIPTION,
    path: domain.path,
  });
}

export default async function ExperiencePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const domain = getExperienceDomain(slug);
  if (!domain) notFound();

  return <ExperienceDomainPage domain={domain} />;
}
