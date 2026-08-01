import { readFileSync } from "node:fs";
import { join } from "node:path";

const metadataKeys = ["Location", "Position", "Dates", "Project"] as const;
type ExperienceMetadataKey = (typeof metadataKeys)[number];

export type ExperienceEntry = {
  organization: string;
  metadata: Record<ExperienceMetadataKey, string>;
  summaries: string[];
  bullets: string[];
};

export type ExperienceDomain = {
  number: string;
  name: string;
  slug: string;
  path: string;
  entries: ExperienceEntry[];
};

export const experienceDomainDefinitions = [
  { number: "01", name: "Artificial Intelligence", slug: "artificial-intelligence" },
  { number: "02", name: "Data Science", slug: "data-science" },
  {
    number: "03",
    name: "Environmental, Social, and Governance",
    slug: "environmental-social-and-governance",
  },
  { number: "04", name: "Finance", slug: "finance" },
  {
    number: "05",
    name: "STEM Academic Competitions and Training",
    slug: "stem-academic-competitions-and-training",
  },
] as const;

type DraftEntry = Omit<ExperienceEntry, "metadata"> & {
  metadata: Partial<Record<ExperienceMetadataKey, string>>;
};

type ParsedDomain = Omit<ExperienceDomain, "number" | "slug" | "path">;

export function parsePastExperience(markdown: string): ParsedDomain[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## Domain Experience");

  if (start === -1) {
    throw new Error("The Domain Experience section is missing from the archive.");
  }

  const domains: ParsedDomain[] = [];
  let domain: ParsedDomain | undefined;
  let entry: DraftEntry | undefined;

  const finishEntry = () => {
    if (!entry) return;
    if (!domain) throw new Error(`Experience entry has no domain: ${entry.organization}`);

    for (const key of metadataKeys) {
      if (!entry.metadata[key]) {
        throw new Error(`${entry.organization} is missing required metadata: ${key}`);
      }
    }
    if (entry.bullets.length === 0) {
      throw new Error(`${entry.organization} must include at least one experience bullet.`);
    }

    domain.entries.push({
      ...entry,
      metadata: entry.metadata as Record<ExperienceMetadataKey, string>,
    });
    entry = undefined;
  };

  const finishDomain = () => {
    finishEntry();
    if (!domain) return;
    if (domain.entries.length === 0) {
      throw new Error(`Experience domain has no entries: ${domain.name}`);
    }
    domains.push(domain);
    domain = undefined;
  };

  for (const sourceLine of lines.slice(start + 1)) {
    const line = sourceLine.trim();

    if (line.startsWith("## ")) break;
    if (!line || line === "---") continue;

    if (line.startsWith("### ")) {
      finishDomain();
      const name = line.slice(4).trim();
      if (!name) throw new Error("Experience domain name cannot be empty.");
      domain = { name, entries: [] };
      continue;
    }

    if (line.startsWith("#### ")) {
      if (!domain) throw new Error(`Experience entry appears before a domain: ${line}`);
      finishEntry();
      const organization = line.slice(5).trim();
      if (!organization) throw new Error("Experience organization cannot be empty.");
      entry = { organization, metadata: {}, summaries: [], bullets: [] };
      continue;
    }

    if (!entry) {
      throw new Error(`Unexpected content in Domain Experience: ${line}`);
    }

    const metadata = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (metadata) {
      const key = metadata[1] as ExperienceMetadataKey;
      const value = metadata[2].trim();
      if (!metadataKeys.includes(key)) {
        throw new Error(`Unknown experience metadata field: ${metadata[1]}`);
      }
      if (entry.metadata[key]) {
        throw new Error(`Duplicate ${key} metadata for ${entry.organization}`);
      }
      if (!value) throw new Error(`${key} metadata cannot be empty for ${entry.organization}`);
      entry.metadata[key] = value;
      continue;
    }

    if (line.startsWith("- ")) {
      const bullet = line.slice(2).trim();
      if (!bullet) throw new Error(`Empty experience bullet for ${entry.organization}`);
      entry.bullets.push(bullet);
      continue;
    }

    entry.summaries.push(line);
  }

  finishDomain();

  const expectedNames = experienceDomainDefinitions.map(({ name }) => name);
  const parsedNames = domains.map(({ name }) => name);
  if (JSON.stringify(parsedNames) !== JSON.stringify(expectedNames)) {
    throw new Error(
      `Experience domains do not match the route registry. Expected ${expectedNames.join(
        ", ",
      )}; received ${parsedNames.join(", ")}.`,
    );
  }

  return domains;
}

const archivePath = join(
  process.cwd(),
  "content",
  "past-experience",
  "archive-through-2026-06-30.md",
);
const parsedDomains = parsePastExperience(readFileSync(archivePath, "utf8"));

export const pastExperience: readonly ExperienceDomain[] = parsedDomains.map(
  (domain, index) => {
    const definition = experienceDomainDefinitions[index];
    return {
      ...definition,
      path: `/past-experience/${definition.slug}/`,
      entries: domain.entries,
    };
  },
);

export function getExperienceDomain(slug: string) {
  return pastExperience.find((domain) => domain.slug === slug);
}
