import type { ReactNode } from "react";

export function renderInlineText(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const inlineMarkup = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gu;
  let offset = 0;
  for (const match of text.matchAll(inlineMarkup)) {
    if (match.index > offset) parts.push(text.slice(offset, match.index));
    if (match[1]) {
      parts.push(<strong key={match.index}>{renderInlineText(match[1])}</strong>);
    } else if (match[2]) {
      parts.push(<em key={match.index}>{renderInlineText(match[2])}</em>);
    } else {
      parts.push(<a key={match.index} href={match[4]}>{renderInlineText(match[3])}</a>);
    }
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push(text.slice(offset));
  return parts;
}
