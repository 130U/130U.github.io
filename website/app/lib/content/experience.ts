import { readFileSync } from "node:fs";
import { join } from "node:path";

const employmentMetadataKeys = ["Position", "Dates"] as const;
const researchMetadataKeys = ["Research areas", "Author credit", "Manuscript dates"] as const;
const metadataKeys = [
  ...employmentMetadataKeys,
  "Location",
  "Website",
  ...researchMetadataKeys,
] as const;
type ExperienceMetadataKey = (typeof metadataKeys)[number];

type ExperienceMetadata = Partial<Record<ExperienceMetadataKey, string>>;

const legalPaperSlugs = {
  "Autonomous Authority in Space: Risk Tradeoffs and the Law of Delegation":
    "autonomous-authority-in-space",
  "Small States and the Governance of Strategic Space Dependence":
    "small-states-and-strategic-space-dependence",
  "Who May Choose the Lesser Risk: Solar Geoengineering and the Legal Duties of Comparison and Continuity":
    "solar-geoengineering-comparison-and-continuity",
  "Mangrove Restoration and the Limits of Compensatory Mitigation: Lessons from Florida for the Greater Bay Area":
    "mangrove-restoration-and-compensatory-mitigation",
} as const;

export type ExperienceSection = {
  heading?: string;
  bullets: string[];
};

export type ExperienceProject = {
  title: string;
  paperSlug?: string;
  readMoreSlug?: string;
  introduction: string[];
  sections: ExperienceSection[];
};

export type ExperienceEntry = {
  organization: string;
  metadata: ExperienceMetadata;
  projects: ExperienceProject[];
};

export type ExperienceDomain = {
  number: string;
  name: string;
  slug: string;
  path: string;
  introduction: string[];
  entries: ExperienceEntry[];
};

export const experienceDomainDefinitions = [
  { number: "01", name: "AI Research and Engineering", slug: "artificial-intelligence" },
  { number: "02", name: "Data Science", slug: "data-science" },
  {
    number: "03",
    name: "Legal Research and Policy Analysis",
    slug: "legal-research-and-policy-analysis",
  },
  { number: "04", name: "Finance and Consulting", slug: "finance" },
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
    throw new Error("The Domain Experience section is missing from the experience source.");
  }

  const domains: ParsedDomain[] = [];
  let domain: ParsedDomain | undefined;
  let entry: DraftEntry | undefined;
  let project: ExperienceProject | undefined;
  let section: ExperienceSection | undefined;

  const finishEntry = () => {
    if (!entry) return;
    if (!domain) throw new Error(`Experience entry has no domain: ${entry.organization}`);

    const requiredMetadataKeys = domain.name === "Legal Research and Policy Analysis"
      ? researchMetadataKeys
      : employmentMetadataKeys;
    for (const key of requiredMetadataKeys) {
      if (!entry.metadata[key]) {
        throw new Error(`${entry.organization} is missing required metadata: ${key}`);
      }
    }
    if (entry.projects.length === 0) {
      throw new Error(`${entry.organization} must include at least one project.`);
    }
    for (const project of entry.projects) {
      if (project.sections.length === 0 || project.sections.some(({ bullets }) => bullets.length === 0)) {
        throw new Error(`${entry.organization}: every section of ${project.title} must include experience bullets.`);
      }
      if (domain.name === "AI Research and Engineering" && !project.readMoreSlug) {
        throw new Error(`${entry.organization}: ${project.title} must link to its research detail page.`);
      }
    }

    domain.entries.push({
      ...entry,
      metadata: entry.metadata as ExperienceMetadata,
    });
    entry = undefined;
    project = undefined;
    section = undefined;
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
      domain = { name, introduction: [], entries: [] };
      continue;
    }

    if (line.startsWith("#### ")) {
      if (!domain) throw new Error(`Experience entry appears before a domain: ${line}`);
      finishEntry();
      const organization = line.slice(5).trim();
      if (!organization) throw new Error("Experience organization cannot be empty.");
      entry = { organization, metadata: {}, projects: [] };
      continue;
    }

    if (!entry) {
      if (domain && domain.entries.length === 0 && !line.startsWith("#")) {
        domain.introduction.push(line);
        continue;
      }
      throw new Error(`Unexpected content in Domain Experience: ${line}`);
    }

    if (line.startsWith("##### ")) {
      const title = line.slice(6).trim();
      if (!title) throw new Error("Experience project title cannot be empty.");
      project = { title, introduction: [], sections: [] };
      if (domain?.name === "Legal Research and Policy Analysis") {
        const paperTitle = title.replace(/^Project(?: \d+)?:\s*/u, "");
        const paperSlug = legalPaperSlugs[paperTitle as keyof typeof legalPaperSlugs];
        if (!paperSlug) throw new Error(`Legal research project has no article route: ${paperTitle}`);
        project.paperSlug = paperSlug;
      }
      entry.projects.push(project);
      section = undefined;
      continue;
    }

    if (line.startsWith("###### ")) {
      if (!project) throw new Error(`Experience section appears before a project: ${line}`);
      const heading = line.slice(7).trim();
      if (!heading) throw new Error("Experience section heading cannot be empty.");
      section = { heading, bullets: [] };
      project.sections.push(section);
      continue;
    }

    const readMore = line.match(/^Read more: ([a-z0-9]+(?:-[a-z0-9]+)*)$/u);
    if (readMore) {
      if (domain?.name !== "AI Research and Engineering" || !project || project.readMoreSlug) {
        throw new Error(`Unexpected research detail link: ${line}`);
      }
      project.readMoreSlug = readMore[1];
      continue;
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
      if (!project) throw new Error(`Experience bullet appears before a project: ${line}`);
      const bullet = line.slice(2).trim();
      if (!bullet) throw new Error(`Empty experience bullet for ${entry.organization}`);
      if (!section) {
        section = { bullets: [] };
        project.sections.push(section);
      }
      section.bullets.push(bullet);
      continue;
    }

    if (project && project.sections.length === 0 && !line.startsWith("#")) {
      project.introduction.push(line);
      continue;
    }

    throw new Error(`Unexpected experience content: ${line}`);
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

const contentPath = join(
  process.cwd(),
  "content",
  "past-experience",
  "experience.md",
);
const parsedDomains = parsePastExperience(readFileSync(contentPath, "utf8"));

export const pastExperience: readonly ExperienceDomain[] = parsedDomains.map(
  (domain, index) => {
    const definition = experienceDomainDefinitions[index];
    return {
      ...definition,
      path: `/past-experience/${definition.slug}/`,
      introduction: domain.introduction,
      entries: domain.entries,
    };
  },
);

export function getExperienceDomain(slug: string) {
  return pastExperience.find((domain) => domain.slug === slug);
}
