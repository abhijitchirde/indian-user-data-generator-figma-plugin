import { describe, expect, test } from "@jest/globals";
import { tableSelection } from "../src/fieldMeta";
import { DEFAULT_PREFS, sanitizePrefs } from "../src/prefs";

describe("sanitizePrefs", () => {
  test("nothing stored yet gives the defaults", () => {
    for (const stored of [undefined, null, "", 42, []]) {
      expect(sanitizePrefs(stored)).toEqual(DEFAULT_PREFS);
    }
  });

  test("valid stored choices are kept", () => {
    const stored = {
      tab: "2",
      fillDomain: "Healthcare",
      tableSelection: tableSelection("all"),
      tableUsers: 25,
      tableDomain: "Finance",
      tableLayout: "rows",
    };
    expect(sanitizePrefs(stored)).toEqual(stored);
  });

  test("table layout is columns or rows, columns by default", () => {
    expect(sanitizePrefs({}).tableLayout).toBe("columns");
    expect(sanitizePrefs({ tableLayout: "grid" }).tableLayout).toBe("columns");
    expect(sanitizePrefs({ tableLayout: "rows" }).tableLayout).toBe("rows");
  });

  test("unknown or broken values fall back to defaults", () => {
    const prefs = sanitizePrefs({
      tab: "3",
      fillDomain: "Astronaut",
      tableUsers: "abc",
      tableDomain: 7,
    });
    expect(prefs.tab).toBe("1");
    expect(prefs.fillDomain).toBe("Random");
    expect(prefs.tableUsers).toBe(1);
    expect(prefs.tableDomain).toBe("Random");
  });

  test("user count is a whole number from 1 to 10,000", () => {
    expect(sanitizePrefs({ tableUsers: 0 }).tableUsers).toBe(1);
    expect(sanitizePrefs({ tableUsers: -5 }).tableUsers).toBe(1);
    expect(sanitizePrefs({ tableUsers: "12" }).tableUsers).toBe(12);
    expect(sanitizePrefs({ tableUsers: 7.8 }).tableUsers).toBe(7);
    expect(sanitizePrefs({ tableUsers: 50000 }).tableUsers).toBe(10000);
  });

  test("table selection: stored ticks kept, unknown keys dropped, new fields get their default", () => {
    const prefs = sanitizePrefs({
      tableSelection: { EmailValue: false, TANValue: true, OldFieldValue: true },
    });
    expect(prefs.tableSelection.EmailValue).toBe(false); // stored
    expect(prefs.tableSelection.TANValue).toBe(true); // stored
    expect(prefs.tableSelection).not.toHaveProperty("OldFieldValue");
    expect(prefs.tableSelection.FullNameValue).toBe(true); // not stored -> default
    expect(Object.keys(prefs.tableSelection)).toHaveLength(27);
  });
});
