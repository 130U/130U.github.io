import type { Metadata } from "next";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const metadata: Metadata = {
  title: "Data Science | Past Experience",
};

export default function DataSciencePage() {
  return <ExperienceDomainPage domainName="Data Science" domainNumber="02" />;
}
