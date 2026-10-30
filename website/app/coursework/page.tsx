import type { Metadata } from "next";
import { SiteShell } from "../components/SiteShell";
import { SectionDirectory } from "../components/SectionDirectory";
import { courseworkGroups } from "../lib/content/about";
import { createPageMetadata } from "../lib/content/site";
import styles from "./coursework.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Selected Coursework",
  description: "Selected coursework in mathematics, AI and data science, finance and economics, and law, ethics, and global affairs.",
  path: "/coursework/",
});

const sectionIds = [
  "mathematics",
  "ai-and-data-science",
  "finance-and-economics",
  "law-ethics-and-global-affairs",
];

export default function CourseworkPage() {
  return (
    <SiteShell active="about" parent={{ href: "/#education", label: "Education" }} frameClassName={styles.frame}>
      <header className={styles.intro}>
        <h1>Selected Coursework</h1>
        <SectionDirectory label="Coursework sections" items={courseworkGroups.map((group, index) => ({
          number: String(index + 1).padStart(2, "0"),
          title: group.title,
          href: `#${sectionIds[index]}`,
        }))} />
      </header>

      {courseworkGroups.map((group, index) => (
        <section className={styles.section} key={group.title} id={sectionIds[index]} aria-labelledby={`${sectionIds[index]}-heading`}>
          <span className={styles.sectionIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <div className={styles.sectionBody}>
            <h2 id={`${sectionIds[index]}-heading`} tabIndex={-1}>{group.title}</h2>
            <ul className={`course-list ${styles.courseList}`}>
              {group.courses.map((course) => <li key={course}>{course}</li>)}
            </ul>
          </div>
        </section>
      ))}
    </SiteShell>
  );
}
