import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";
import { ExperienceContent } from "../components/experience/ExperienceContent";
import { createPageMetadata } from "../lib/content/site";
import styles from "../components/experience/Experience.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Experience",
  description: "AI research and engineering, data science, legal research, finance and consulting, and STEM competitions and training.",
  path: "/experience/",
});
export default function ExperiencePage() {
  return <SiteShell active="experience" frameClassName={styles.frame}><ExperienceContent /></SiteShell>;
}
