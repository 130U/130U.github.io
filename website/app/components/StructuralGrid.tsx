const guides = [
  "frame-start",
  "rail-boundary",
  "reading-start",
  "reading-measure",
  "reading-end",
] as const;

export function StructuralGrid() {
  return (
    <div className="structural-grid" aria-hidden="true">
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
