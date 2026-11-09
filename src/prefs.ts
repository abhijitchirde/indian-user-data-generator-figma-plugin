// UI choices remembered between sessions (saved with figma.clientStorage by code.ts).
// Pure, so it can be unit-tested: sanitizePrefs() turns whatever was stored (possibly
// from an older plugin version) into valid preferences.

import {
  FieldSelection,
  FIELD_META,
  PROFESSION_DOMAINS,
  selectionKey,
  tableSelection,
} from "./fieldMeta";

export type TabId = "1" | "2";

export interface UiPrefs {
  /** Open tab: "1" Add to text layers, "2" Create user sets */
  tab: TabId;
  /** Profession domain in the first tab */
  fillDomain: string;
  /** Ticked fields in the table tab */
  tableSelection: FieldSelection;
  /** Number of users in the table tab (a string while the user is typing) */
  tableUsers: number | string;
  /** Profession domain in the table tab */
  tableDomain: string;
}

export const MAX_USERS_INPUT = 10000;

export const DEFAULT_PREFS: UiPrefs = {
  tab: "1",
  fillDomain: "Random",
  tableSelection: tableSelection("default"),
  tableUsers: 1,
  tableDomain: "Random",
};

const isDomain = (value: unknown): value is string =>
  PROFESSION_DOMAINS.some((domain) => domain.value === value);

export function sanitizePrefs(raw: unknown): UiPrefs {
  const stored = (raw && typeof raw === "object" ? raw : {}) as Partial<Record<keyof UiPrefs, unknown>>;

  // Known table fields only; fields added in a later version get their default
  const storedSelection = (stored.tableSelection ?? {}) as Record<string, unknown>;
  const selection: FieldSelection = {};
  for (const field of FIELD_META) {
    if (!field.inTable) continue;
    const key = selectionKey(field.key);
    const value = storedSelection[key];
    selection[key] = typeof value === "boolean" ? value : field.defaultInTable;
  }

  const users = Math.floor(Number(stored.tableUsers));

  return {
    tab: stored.tab === "2" ? "2" : "1",
    fillDomain: isDomain(stored.fillDomain) ? stored.fillDomain : "Random",
    tableSelection: selection,
    tableUsers: users >= 1 ? Math.min(users, MAX_USERS_INPUT) : 1,
    tableDomain: isDomain(stored.tableDomain) ? stored.tableDomain : "Random",
  };
}
