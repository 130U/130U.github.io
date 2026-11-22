/** The magnifier of the zoom control that tables and figures share. */
export function ZoomGlyph() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.75" />
      <path d="m10.5 10.5 3 3M5 7h4" />
      <path d="M7 5v4" data-zoom-plus />
    </svg>
  );
}
