// Font handling for writing into existing text layers.
//
// - Figma throws if `characters` is set before every font in the layer is loaded,
//   so all fonts are loaded first.
// - Setting `characters` gives the whole new text the style of the first character.
//   To keep layers with mixed styling (e.g. a bold first name), the style of each word
//   is captured first and re-applied word by word (see wordStyles.ts).
// - Fonts that are not installed are replaced by Inter (ships with Figma) in the
//   closest style, so the layer can still be edited.

import { planWordStyleRanges, wordRanges } from "./wordStyles";

export const TABLE_FONT_REGULAR: FontName = { family: "Roboto", style: "Regular" };
export const TABLE_FONT_LIGHT: FontName = { family: "Roboto", style: "Light" };

const FALLBACK_FAMILY = "Inter";
const FALLBACK_FONT: FontName = { family: FALLBACK_FAMILY, style: "Regular" };

export async function loadTableFonts(): Promise<void> {
  await Promise.all([
    figma.loadFontAsync(TABLE_FONT_REGULAR),
    figma.loadFontAsync(TABLE_FONT_LIGHT),
  ]);
}

// ---------------------------------------------------------------------------
// Fallback fonts
// ---------------------------------------------------------------------------

/** "SemiBold" / "Semi-Bold" / "semibold" → "Semi Bold" (Inter's style naming) */
function toInterStyle(style: string): string {
  const words: Record<string, string> = {
    thin: "Thin",
    hairline: "Thin",
    extralight: "Extra Light",
    ultralight: "Extra Light",
    light: "Light",
    regular: "Regular",
    normal: "Regular",
    book: "Regular",
    medium: "Medium",
    semibold: "Semi Bold",
    demibold: "Semi Bold",
    bold: "Bold",
    extrabold: "Extra Bold",
    ultrabold: "Extra Bold",
    black: "Black",
    heavy: "Black",
  };
  const compact = style.toLowerCase().replace(/[\s_-]+/g, "");
  const italic = compact.includes("italic") || compact.includes("oblique");
  const weightKey = compact.replace(/italic|oblique/g, "");
  const weight = words[weightKey] ?? "Regular";
  if (!italic) return weight;
  return weight === "Regular" ? "Italic" : `${weight} Italic`;
}

/** Loads Inter in the closest available style to the given font, falling back to Inter Regular */
async function loadFallbackFont(original: FontName): Promise<FontName> {
  const closest: FontName = { family: FALLBACK_FAMILY, style: toInterStyle(original.style) };
  try {
    await figma.loadFontAsync(closest);
    return closest;
  } catch {
    await figma.loadFontAsync(FALLBACK_FONT);
    return FALLBACK_FONT;
  }
}

const fontKey = (font: FontName) => `${font.family}\u0000${font.style}`;

/**
 * Loads each distinct font. Fonts that cannot be loaded (not installed)
 * are mapped to an Inter fallback. Returns original font key → font to use.
 */
async function resolveFonts(fonts: FontName[]): Promise<Map<string, FontName>> {
  const resolved = new Map<string, FontName>();
  for (const font of fonts) {
    const key = fontKey(font);
    if (resolved.has(key)) continue;
    try {
      await figma.loadFontAsync(font);
      resolved.set(key, font);
    } catch {
      resolved.set(key, await loadFallbackFont(font));
    }
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Per-word styles
// ---------------------------------------------------------------------------

const STYLE_FIELDS = [
  "fontName",
  "fontSize",
  "fills",
  "fillStyleId",
  "textStyleId",
  "textDecoration",
  "textCase",
  "letterSpacing",
  "lineHeight",
] as const;

type WordStyle = Pick<StyledTextSegment, (typeof STYLE_FIELDS)[number]>;
type Segment = WordStyle & { start: number; end: number };

function toWordStyle(segment: Segment): WordStyle {
  const style = {} as WordStyle;
  for (const field of STYLE_FIELDS) (style as any)[field] = segment[field];
  return style;
}

const sameStyle = (a: WordStyle, b: WordStyle) => JSON.stringify(a) === JSON.stringify(b);

/** Style of each word in the current text, taken from the word's first character */
function captureWordStyles(text: string, segments: Segment[]): WordStyle[] {
  return wordRanges(text).map(({ start }) => {
    const segment = segments.find((s) => s.start <= start && start < s.end);
    return toWordStyle(segment);
  });
}

async function applyWordStyle(
  node: TextNode,
  start: number,
  end: number,
  style: WordStyle,
  fonts: Map<string, FontName>
) {
  const font = fonts.get(fontKey(style.fontName));
  const fontWasReplaced = fontKey(font) !== fontKey(style.fontName);

  // Re-link the text style, unless its font is missing (that would bring the missing font back)
  if (style.textStyleId && !fontWasReplaced) {
    await node.setRangeTextStyleIdAsync(start, end, style.textStyleId);
  } else {
    node.setRangeFontName(start, end, font);
    node.setRangeFontSize(start, end, style.fontSize);
    node.setRangeTextCase(start, end, style.textCase);
    node.setRangeTextDecoration(start, end, style.textDecoration);
    node.setRangeLetterSpacing(start, end, style.letterSpacing);
    node.setRangeLineHeight(start, end, style.lineHeight);
  }

  if (style.fillStyleId) {
    await node.setRangeFillStyleIdAsync(start, end, style.fillStyleId);
  } else {
    node.setRangeFills(start, end, style.fills);
  }
}

// ---------------------------------------------------------------------------
// Writing text
// ---------------------------------------------------------------------------

export type WriteStatus = "written" | "fallback" | "failed";

/**
 * Replaces the text of a layer, keeping its styling, including per-word styling
 * in mixed-style layers. Fonts that are not installed are replaced by Inter
 * (closest weight) and "fallback" is returned.
 */
export async function writeText(node: TextNode, text: string): Promise<WriteStatus> {
  try {
    const oldText = node.characters;
    const segments: Segment[] =
      oldText.length > 0 ? node.getStyledTextSegments([...STYLE_FIELDS]) : [];

    const usedFonts =
      segments.length > 0
        ? segments.map((s) => s.fontName)
        : node.fontName !== figma.mixed
          ? [node.fontName]
          : [FALLBACK_FONT];
    const fonts = await resolveFonts(usedFonts);
    const usedFallback = usedFonts.some(
      (font) => fontKey(fonts.get(fontKey(font))) !== fontKey(font)
    );

    // Swap missing fonts for their fallback first, otherwise the layer can't be edited
    if (usedFallback) {
      if (segments.length > 0) {
        for (const s of segments) {
          const font = fonts.get(fontKey(s.fontName));
          if (fontKey(font) !== fontKey(s.fontName)) node.setRangeFontName(s.start, s.end, font);
        }
      } else {
        node.fontName = fonts.get(fontKey(usedFonts[0]));
      }
    }

    const wordStyles = captureWordStyles(oldText, segments);
    node.characters = text;

    // Single-style layers are already correct: new text takes the first character's style
    const isMixed = wordStyles.some((style) => !sameStyle(style, wordStyles[0]));
    if (isMixed) {
      try {
        for (const range of planWordStyleRanges(wordStyles.length, text)) {
          await applyWordStyle(node, range.start, range.end, wordStyles[range.sourceWord], fonts);
        }
      } catch (error) {
        // The text itself was written; only the per-word styling could not be restored
        console.warn("Indian User Data: could not restore mixed styling", node.name, error);
      }
    }

    return usedFallback ? "fallback" : "written";
  } catch (error) {
    console.error("Indian User Data: could not update text layer", node.name, error);
    return "failed";
  }
}

/** Counts write results for user-facing summaries */
export class WriteTally {
  written = 0;
  fallback = 0;
  failed = 0;

  add(status: WriteStatus) {
    this[status]++;
  }

  get updated() {
    return this.written + this.fallback;
  }

  /** Extra notes for the notification, e.g. " 2 layers used Inter because..." */
  notes(): string {
    let notes = "";
    if (this.fallback > 0) {
      notes += ` ${this.fallback} layer${this.fallback === 1 ? "" : "s"} used Inter because the original font is missing.`;
    }
    if (this.failed > 0) {
      notes += ` ${this.failed} layer${this.failed === 1 ? "" : "s"} could not be updated.`;
    }
    return notes;
  }
}
