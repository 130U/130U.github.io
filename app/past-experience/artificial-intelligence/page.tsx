import type { Metadata } from "next";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const metadata: Metadata = {
  title: "Artificial Intelligence | Past Experience",
};

export default function ArtificialIntelligencePage() {
  return <ExperienceDomainPage domainName="Artificial Intelligence" domainNumber="01" />;
}
