import styles from "./SectionDirectory.module.css";

type DirectoryItem = {
  number: string;
  title: string;
  href: string;
};

export function SectionDirectory({ label, items }: {
  label: string;
  items: readonly DirectoryItem[];
}) {
  return (
    <nav className={styles.directory} aria-label={label}>
      {items.map((item) => (
        <a href={item.href} key={item.href}>
          <span className={styles.index} aria-hidden="true">{item.number}</span>
          <span className={styles.title}>{item.title}</span>
          <span className={styles.action} aria-hidden="true">View</span>
        </a>
      ))}
    </nav>
  );
}
