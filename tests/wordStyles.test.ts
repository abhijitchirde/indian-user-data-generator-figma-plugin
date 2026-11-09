import { describe, expect, test } from "@jest/globals";
import { planWordStyleRanges, wordRanges } from "../src/functions/wordStyles";

/** Renders ranges as "text|sourceWord" pairs for readable assertions */
const render = (text: string, oldWordCount: number) =>
  planWordStyleRanges(oldWordCount, text).map(
    (r) => `${text.slice(r.start, r.end)}|${r.sourceWord}`
  );

describe("wordRanges", () => {
  test("finds words and ignores surrounding whitespace", () => {
    expect(wordRanges("  Rahul  Sharma ")).toEqual([
      { start: 2, end: 7 },
      { start: 9, end: 15 },
    ]);
  });

  test("empty and whitespace-only text has no words", () => {
    expect(wordRanges("")).toEqual([]);
    expect(wordRanges("   ")).toEqual([]);
  });
});

describe("planWordStyleRanges", () => {
  test("same number of words: word N takes old word N's style", () => {
    // e.g. "**Rahul** Sharma" → "**Priya** Patel"
    expect(render("Priya Patel", 2)).toEqual(["Priya |0", "Patel|1"]);
  });

  test("more new words than old: extra words take the last old word's style, merged", () => {
    expect(render("Bala Gopal Sen Gupta", 2)).toEqual(["Bala |0", "Gopal Sen Gupta|1"]);
  });

  test("fewer new words than old: only the first old styles are used", () => {
    expect(render("Pune", 3)).toEqual(["Pune|0"]);
  });

  test("ranges cover the whole text, including leading and trailing whitespace", () => {
    const text = " 12, MG Road, Pune ";
    const ranges = planWordStyleRanges(4, text);
    expect(ranges[0].start).toBe(0);
    expect(ranges[ranges.length - 1].end).toBe(text.length);
    for (let i = 1; i < ranges.length; i++) {
      expect(ranges[i].start).toBe(ranges[i - 1].end);
    }
  });

  test("nothing to plan without old words or new words", () => {
    expect(planWordStyleRanges(0, "Priya Patel")).toEqual([]);
    expect(planWordStyleRanges(2, "   ")).toEqual([]);
  });
});
