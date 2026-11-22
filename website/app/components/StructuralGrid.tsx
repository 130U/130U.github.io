const guides = [
  "frame-start",
  "rail-boundary",
  "reading-start",
  "reading-measure",
  "reading-end",
] as const;

/**
 * Decorative column guides. "index" pages hang titles on the reading start and
 * set prose on a second axis three columns in; "article" pages end their
 * reading column where the contents rail begins.
 */
export type GuideLayout = "index" | "article";

export function StructuralGrid({ layout = "article" }: { layout?: GuideLayout }) {
  return (
    <div className="structural-grid" data-guides={layout} aria-hidden="true">
      {guides.map((guide) => (
        <span
          className={`structural-guide structural-guide-${guide}`}
          key={guide}
        >
          <span className="structural-guide-tick" />
        </span>
      ))}
    </div>
  );
}
