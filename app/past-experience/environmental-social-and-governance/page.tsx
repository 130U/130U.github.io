import type { Metadata } from "next";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const metadata: Metadata = {
  title: "Environmental, Social, and Governance | Past Experience",
};

export default function EnvironmentalSocialGovernancePage() {
  return (
    <ExperienceDomainPage
      domainName="Environmental, Social, and Governance"
      domainNumber="03"
    />
  );
}
