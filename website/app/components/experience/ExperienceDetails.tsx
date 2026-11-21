import { Fragment } from "react";
import { architectureDiagrams } from "../../lib/content/architecture-diagrams";
import type { ShowcaseEntry } from "../../lib/content/experience-showcase";
import { LogicDiagram } from "./LogicDiagram";
import { InlineMarkdown, KeepNumberJoins } from "../research/ResearchInline";
import styles from "./Experience.module.css";

// An entry whose four values together run to at most 80 characters can set
// them in one row once the strip is 53rem wide: about 8px a character in the
// reading face, plus each field's 48px of padding ("row"). A longer entry keeps
// two fields per row ("pairs"), and one with a value longer than 40 characters
// stacks them where two per row would fold that value into many lines ("long").
const ROW_CHARACTERS = 80;
const LONG_VALUE = 40;

/** A place or a date breaks only between its parts: after a comma, a semicolon
    or a range's dash, or before a parenthesis. "North Carolina" and
    "December 2024" each hold one line. */
function ValueParts({ text }: { text: string }) {
  return text.split(/(?<=[,;–])\s+|\s+(?=\()/u).map((part, index) => (
    <Fragment key={index}>{index > 0 && " "}<span className="keep-whole">{part}</span></Fragment>
  ));
}

/** A position breaks after its comma first: the role and the group or name that
    follows each hold one line where the line can hold them. */
function PositionParts({ text }: { text: string }) {
  return text.split(/(?<=,)\s+/u).map((part, index) => (
    <Fragment key={index}>{index > 0 && " "}<span className="keep-whole"><KeepNumberJoins text={part} /></span></Fragment>
  ));
}

export function ExperienceMetadata({ entry }: { entry: ShowcaseEntry }) {
  const { position, location, dates } = entry.metadata;
  const values = [entry.institution, position, location, dates];
  const layout = values.join("").length <= ROW_CHARACTERS ? "row" : values.some((value) => value.length > LONG_VALUE) ? "long" : "pairs";
  return (
    <div className={styles.record}>
      <dl className={styles.metadata} data-experience-metadata data-layout={layout}>
        <div><dt>Organization</dt><dd><KeepNumberJoins text={entry.institution} /></dd></div>
        <div><dt>Position</dt><dd><PositionParts text={position} /></dd></div>
        <div><dt>Location</dt><dd><ValueParts text={location} /></dd></div>
        <div><dt>Dates</dt><dd><ValueParts text={dates} /></dd></div>
      </dl>
    </div>
  );
}

/** The project's logic architecture, shown under the record strip as the article's visual abstract. */
export function ExperienceDiagram({ entry }: { entry: ShowcaseEntry }) {
  const diagram = architectureDiagrams[entry.id];
  return diagram ? <LogicDiagram diagram={diagram} /> : null;
}

export function ProblemAndApproach({ entry }: { entry: ShowcaseEntry }) {
  if (!entry.problemAndApproach) return null;
  return (
    <section className={styles.problemAndApproach} aria-labelledby="problem-and-approach" data-problem-and-approach>
      <h2 id="problem-and-approach" tabIndex={-1}>{entry.problemAndApproach.title}</h2>
      {entry.problemAndApproach.text.split(/\n+/u).map((text, index) => <p key={index}><InlineMarkdown text={text} /></p>)}
    </section>
  );
}

// A note that opens on a label ("Program context: …") runs the label in.
const NOTE_LABEL = /^([^:]{1,40}):\s+/u;

export function KeyContributions({ entry }: { entry: ShowcaseEntry }) {
  const contributionCount = entry.keyContributions.length;
  const prose = (text: string) => entry.categoryId === "01" ? <InlineMarkdown text={text} /> : <KeepNumberJoins text={text} />;
  return (
    <section className={styles.contributions} aria-labelledby="key-contributions" data-experience-contributions={entry.id}>
      <h2 id="key-contributions" tabIndex={-1}>{entry.contributionsLabel}</h2>
      <ol>{[...entry.keyContributions, ...entry.notes].map((text, index) => {
        const detail = entry.keyContributionDetails?.[String(index)];
        const DetailList = detail?.ordered ? "ol" : "ul";
        const note = index >= contributionCount;
        const label = note ? NOTE_LABEL.exec(text) : null;
        return <li key={index} data-contribution-item={index} data-contribution-note={note ? "" : undefined}>
          <div>
            {label ? <><span className={styles.noteLabel}>{`${label[1]}:`}</span>{" "}{prose(text.slice(label[0].length))}</> : prose(text)}
            {detail && <DetailList className={styles.contributionDetails} data-contribution-details={index}>
              {detail.items.map((item, childIndex) => <li key={childIndex} data-contribution-detail={childIndex}><InlineMarkdown text={item} /></li>)}
            </DetailList>}
          </div>
        </li>;
      })}</ol>
    </section>
  );
}
