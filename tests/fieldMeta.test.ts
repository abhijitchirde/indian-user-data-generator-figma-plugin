import { describe, expect, test } from "@jest/globals";
import { dataSet } from "../src/data/dataSet";
import {
  FIELD_META,
  fieldsInGroup,
  GROUPS,
  PROFESSION_DOMAINS,
  tableSelection,
} from "../src/fieldMeta";

describe("table presets", () => {
  test('"Default" ticks the same 12 fields as before the registry', () => {
    const ticked = Object.entries(tableSelection("default"))
      .filter(([, on]) => on)
      .map(([key]) => key);
    expect(ticked.sort()).toEqual(
      [
        "FullNameValue",
        "DoBValue",
        "EmailValue",
        "MobileValue",
        "ProfValue",
        "UrbAddressValue",
        "CityValue",
        "StateValue",
        "PINValue",
        "UIDValue",
        "PANValue",
        "GSTINValue",
      ].sort()
    );
  });

  test('"Select all" and "Deselect all" cover every table field (27), not City & State', () => {
    const all = tableSelection("all");
    const none = tableSelection("none");
    expect(Object.keys(all)).toHaveLength(27);
    expect(Object.values(all).every((on) => on === true)).toBe(true);
    expect(Object.values(none).every((on) => on === false)).toBe(true);
    expect(all).not.toHaveProperty("CityStateValue");
  });
});

describe("groups", () => {
  test("every field belongs to a group shown in the UI", () => {
    const groupIds = GROUPS.map((g) => g.id);
    for (const field of FIELD_META) expect(groupIds).toContain(field.group);
  });

  test("button lists match the plugin's previous layout", () => {
    const labels = (id: Parameters<typeof fieldsInGroup>[0], tableOnly = false) =>
      fieldsInGroup(id, tableOnly).map((f) => f.shortLabel);
    expect(labels("personal")).toEqual(["First Name", "Last Name", "Full Name", "Birth Date", "Email", "Mobile"]);
    expect(labels("location")).toEqual(["Rural Addr.", "City Addr.", "City", "State", "City & State", "Post Code"]);
    expect(labels("location", true)).toEqual(["Rural Addr.", "City Addr.", "City", "State", "Post Code"]);
    expect(labels("personalIds")).toEqual([
      "Passport", "Aadhar", "PAN", "UPI (name)", "UPI (mob)", "Voter ID", "DL", "Vehicle RC", "RC (BH)",
    ]);
    expect(labels("businessIds")).toEqual(["PAN (Corp)", "GSTIN", "CIN", "DIN", "LLPIN", "TAN"]);
  });
});

test("every profession domain exists in the dataset", () => {
  for (const { value } of PROFESSION_DOMAINS) {
    if (value === "Random") continue;
    expect(Array.isArray((dataSet as any)[value])).toBe(true);
  }
});
