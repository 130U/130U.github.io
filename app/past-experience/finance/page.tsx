import type { Metadata } from "next";
import { ExperienceDomainPage } from "../components/ExperienceDomainPage";

export const metadata: Metadata = {
  title: "Finance | Past Experience",
};

export default function FinancePage() {
  return <ExperienceDomainPage domainName="Finance" domainNumber="04" />;
}
