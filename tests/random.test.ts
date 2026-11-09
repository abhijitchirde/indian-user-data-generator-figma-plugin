import { describe, expect, test } from "@jest/globals";
import { FieldSelection, tableSelection } from "../src/fieldMeta";
import { generateRecords, Person } from "../src/fields";
import { rng, withSeed } from "../src/functions/random";

const all: FieldSelection = tableSelection("all");
const users = (seed: string | undefined, count = 20) =>
  withSeed(seed, () => generateRecords(all, count, { profDomain: "Random" }));

describe("withSeed", () => {
  test("the same seed gives the same users, every field", () => {
    expect(users("demo-2026")).toEqual(users("demo-2026"));
  });

  test("different seeds give different users", () => {
    expect(users("a")).not.toEqual(users("b"));
  });

  test("an empty or blank seed means new users each time", () => {
    expect(users("")).not.toEqual(users(""));
    expect(users("   ")).not.toEqual(users("   "));
    expect(users(undefined)).not.toEqual(users(undefined));
  });

  test("spaces around the seed are ignored", () => {
    expect(users(" demo ")).toEqual(users("demo"));
  });

  test("the first users don't change when more users are asked for", () => {
    // 5 users with a seed are the first 5 of 20 with the same seed
    expect(users("grow", 20).slice(0, 5)).toEqual(users("grow", 5));
  });

  test("randomness goes back to normal after the seeded block, even after an error", () => {
    expect(() =>
      withSeed("boom", () => {
        throw new Error("fail");
      })
    ).toThrow("fail");
    const a = withSeed("x", () => rng());
    const b = withSeed("x", () => rng());
    expect(a).toBe(b);
    expect(rng()).not.toBe(rng()); // unseeded again
  });

  test("seeded table users match the seeded JSON/CSV users", () => {
    // The table generates people first, field by field in table order — the same as generateRecords
    const fields = ["FullName", "Email", "UrbAddress", "PIN"] as const;
    const selection: FieldSelection = { FullNameValue: true, EmailValue: true, UrbAddressValue: true, PINValue: true };
    const tablePeople = withSeed("handoff", () =>
      Array.from({ length: 3 }, () => {
        const person = new Person({ profDomain: "Random" });
        for (const key of fields) person.get(key);
        return person;
      })
    );
    const records = withSeed("handoff", () => generateRecords(selection, 3, { profDomain: "Random" }));
    tablePeople.forEach((person, i) => {
      expect(records[i]["Full Name"]).toBe(person.get("FullName"));
      expect(records[i]["Urban Address"]).toBe(person.get("UrbAddress"));
    });
  });

  test("seeded values stay in range (0 <= n < 1)", () => {
    withSeed("range", () => {
      for (let i = 0; i < 10000; i++) {
        const n = rng();
        expect(n >= 0 && n < 1).toBe(true);
      }
    });
  });
});
