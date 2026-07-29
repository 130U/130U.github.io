import type { Metadata } from "next";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const metadata: Metadata = {
  title: "STEM Academic Competitions and Training | Past Experience",
};

export default function StemAcademicCompetitionsPage() {
  return (
    <ExperienceDomainPage
      domainName="STEM Academic Competitions and Training"
      domainNumber="05"
    />
  );
}
