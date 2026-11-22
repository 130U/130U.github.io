import { Fragment } from "react";

// A hyphenated compound in a title (PCA-Based, Green-Credit) holds one line, so
// a display line never ends on a hyphen that reads as a broken word. In a
// column narrower than the compound it wraps inside (`.keep-whole`).
const COMPOUND = /(?<=^|\s)(\S+-\S+)(?=\s|$)/u;

export function TitleText({ text }: { text: string }) {
  return text.split(COMPOUND).map((part, index) => index % 2
    ? <span key={index} className="keep-whole">{part}</span>
    : <Fragment key={index}>{part}</Fragment>);
}
