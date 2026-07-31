import archiveMarkdown from "../../content/past-experience/archive-through-2026-06-30.md?raw";

export type ExperienceEntry = {
  organization: string;
  metadata: Record<string, string>;
  bullets: string[];
};

export type ExperienceDomain = {
  name: string;
  entries: ExperienceEntry[];
};

function parsePastExperience(markdown: string): ExperienceDomain[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Domain Experience");

  if (start === -1) {
    throw new Error("The Domain Experience section is missing from the archive.");
  }

  const domains: ExperienceDomain[] = [];
  let domain: ExperienceDomain | undefined;
  let entry: ExperienceEntry | undefined;

  for (const sourceLine of lines.slice(start + 1)) {
    const line = sourceLine.trim();

    if (line.startsWith("## ")) break;

    if (line.startsWith("### ")) {
      domain = { name: line.slice(4).trim(), entries: [] };
      domains.push(domain);
      entry = undefined;
      continue;
    }

    if (line.startsWith("#### ")) {
      if (!domain) continue;
      entry = {
        organization: line.slice(5).trim(),
        metadata: {},
        bullets: [],
      };
      domain.entries.push(entry);
      continue;
    }

    if (!entry) continue;

    const metadata = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (metadata) {
      entry.metadata[metadata[1]] = metadata[2].replace(/\s{2,}$/, "");
      continue;
    }

    if (line.startsWith("- ")) {
      entry.bullets.push(line.slice(2));
    }
  }

  return domains;
}

export const pastExperience = parsePastExperience(archiveMarkdown);
