// Quick actions: run the plugin from Figma's command bar (Ctrl/Cmd + /) without opening
// the plugin window, e.g. "Indian User Data → Email" fills the selected text layers.
// Declared as a parameter in manifest.json; suggestions come from the field registry.
// Pure, so it can be unit-tested.

import { FIELD_META, normalizeLayerName } from "./fieldMeta";

/** manifest.json parameters[0].key */
export const QUICK_ACTION_KEY = "dataType";

export const ACTION_FILL_BY_NAME = "action:fill-by-name";
export const ACTION_REGENERATE = "action:regenerate";

export interface Suggestion {
  name: string;
  data: string;
}

interface Entry extends Suggestion {
  /** Words that find this entry, besides its name */
  terms: string[];
}

const ACTIONS: Entry[] = [
  {
    name: "Fill by layer names",
    data: ACTION_FILL_BY_NAME,
    terms: ["fill", "layer names", "card", "profile", "auto fill"],
  },
  {
    name: "Regenerate selected data",
    data: ACTION_REGENERATE,
    terms: ["regenerate", "refresh", "new data", "shuffle"],
  },
];

const ENTRIES: Entry[] = [
  ...ACTIONS,
  ...FIELD_META.map((field) => ({
    name: field.label,
    data: field.key,
    terms: [field.key, field.shortLabel, ...field.aliases],
  })),
];

/**
 * Suggestions for what the user typed: the two actions and every field, matched on
 * name, labels and aliases ("aadhaar" finds "UID (Aadhar)"). Names that start with
 * the query come first.
 */
export function quickActionSuggestions(query: string): Suggestion[] {
  const q = normalizeLayerName(query);
  const ranked: { entry: Entry; rank: number }[] = [];

  for (const entry of ENTRIES) {
    const words = [entry.name, ...entry.terms].map(normalizeLayerName);
    if (!q) ranked.push({ entry, rank: 0 });
    else if (words.some((w) => w.startsWith(q))) ranked.push({ entry, rank: 0 });
    else if (words.some((w) => w.includes(q))) ranked.push({ entry, rank: 1 });
  }

  return ranked
    .sort((a, b) => a.rank - b.rank) // stable: keeps registry order within a rank
    .map(({ entry }) => ({ name: entry.name, data: entry.data }));
}
