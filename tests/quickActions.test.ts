import { describe, expect, test } from "@jest/globals";
import { FIELD_META } from "../src/fieldMeta";
import {
  ACTION_FILL_BY_NAME,
  ACTION_REGENERATE,
  quickActionSuggestions,
} from "../src/quickActions";

const names = (query: string) => quickActionSuggestions(query).map((s) => s.name);

describe("quick action suggestions", () => {
  test("empty query lists both actions first, then every field", () => {
    const all = quickActionSuggestions("");
    expect(all.slice(0, 2).map((s) => s.data)).toEqual([ACTION_FILL_BY_NAME, ACTION_REGENERATE]);
    expect(all).toHaveLength(2 + FIELD_META.length);
  });

  test("fields are found by label, short label and aliases", () => {
    expect(names("email")).toContain("Email");
    expect(names("aadhaar")).toEqual(["UID (Aadhar)"]);
    expect(names("phone")).toContain("Mobile");
    expect(names("gst")).toContain("GSTIN");
    expect(names("pincode")).toContain("PIN Code");
  });

  test("names starting with the query come before names containing it", () => {
    // "pan" starts PAN (Personal) and PAN (Corp), and is inside "company pan" too
    const result = names("pan");
    expect(result.slice(0, 2)).toEqual(["PAN (Personal)", "PAN (Corp)"]);
  });

  test("actions are found by their words", () => {
    expect(names("fill")[0]).toBe("Fill by layer names");
    expect(names("regen")).toEqual(["Regenerate selected data"]);
    expect(names("refresh")).toEqual(["Regenerate selected data"]);
  });

  test("case, spaces and punctuation don't matter", () => {
    expect(names("Date of birth")).toEqual(names("dateofbirth"));
    expect(names("E-MAIL")).toContain("Email");
  });

  test("nothing matches gives no suggestions", () => {
    expect(quickActionSuggestions("xyzzy")).toEqual([]);
  });

  test("every suggestion's data is a field key or an action", () => {
    const keys = new Set<string>([...FIELD_META.map((f) => f.key), ACTION_FILL_BY_NAME, ACTION_REGENERATE]);
    for (const s of quickActionSuggestions("")) expect(keys.has(s.data)).toBe(true);
  });
});
