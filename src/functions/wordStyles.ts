// Pure helpers for keeping per-word styling when a text layer's content is replaced.
// No Figma API here, so it can be unit-tested.
//
// Approach: word N of the new text takes the style of word N of the old text.
// Extra new words take the style of the last old word. Whitespace after a word
// takes that word's style (like typing after a word in a text editor).
//
//   old: [Rahul](bold) [Sharma](regular)
//   new: [Priya](bold) [Patel](regular)

export interface TextRange {
  start: number;
  end: number;
}

export interface StyledRange extends TextRange {
  /** Index of the word in the old text whose style this range takes */
  sourceWord: number;
}

/** Ranges of the non-whitespace runs ("words") in a text */
export function wordRanges(text: string): TextRange[] {
  const ranges: TextRange[] = [];
  const pattern = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    ranges.push({ start: match.index, end: match.index + match[0].length });
  }
  return ranges;
}

/**
 * Splits the new text into ranges, each styled like one word of the old text.
 * Neighbouring ranges taking the same old word are merged. The ranges cover the
 * whole new text with no gaps.
 */
export function planWordStyleRanges(oldWordCount: number, newText: string): StyledRange[] {
  const words = wordRanges(newText);
  if (oldWordCount === 0 || words.length === 0) return [];

  const ranges: StyledRange[] = [];
  words.forEach((_, i) => {
    const start = i === 0 ? 0 : words[i].start;
    const end = i + 1 < words.length ? words[i + 1].start : newText.length;
    const sourceWord = Math.min(i, oldWordCount - 1);

    const previous = ranges[ranges.length - 1];
    if (previous && previous.sourceWord === sourceWord) previous.end = end;
    else ranges.push({ start, end, sourceWord });
  });
  return ranges;
}
