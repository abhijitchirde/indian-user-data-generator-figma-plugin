import { describe, expect, test } from "@jest/globals";
import { FieldSelection, tableSelection } from "../src/fieldMeta";
import { generateRecords, Person } from "../src/fields";
import { rng, withStream } from "../src/functions/random";

const all: FieldSelection = tableSelection("all");
const users = (seed: string | undefined, count = 20, selection = all, profDomain = "Random") =>
  generateRecords(selection, count, { profDomain, seed });

describe("seeded users", () => {
  test("the same seed gives the same users, every field", () => {
    expect(users("demo-2026")).toEqual(users("demo-2026"));
  });

  test("different seeds give different users", () => {
    expect(users("a")).not.toEqual(users("b"));
  });

  test("short, long, numeric and wordy seeds all work", () => {
    for (const seed of ["1", "42", "007", "demo", "Sprint 12 handoff", "9".repeat(40)]) {
      expect(users(seed, 3)).toEqual(users(seed, 3));
    }
  });

  test("seeds are exact text: case and leading zeros matter, outer spaces don't", () => {
    expect(users("Demo")).not.toEqual(users("demo"));
    expect(users("007")).not.toEqual(users("7"));
    expect(users(" demo ")).toEqual(users("demo"));
  });

  test("an empty or blank seed means new users each time", () => {
    expect(users("")).not.toEqual(users(""));
    expect(users("   ")).not.toEqual(users("   "));
    expect(users(undefined)).not.toEqual(users(undefined));
  });

  test("the first users don't change when more users are asked for", () => {
    expect(users("grow", 20).slice(0, 5)).toEqual(users("grow", 5));
  });

  test("ticking more fields adds values without changing the existing ones", () => {
    const few: FieldSelection = { FullNameValue: true, EmailValue: true };
    const before = users("stable", 10, few);
    const after = users("stable", 10, all);
    before.forEach((record, i) => {
      expect(after[i]["Full Name"]).toBe(record["Full Name"]);
      expect(after[i]["Email"]).toBe(record["Email"]);
    });
  });

  test("changing the profession domain only changes the profession", () => {
    const tech = users("job", 10, all, "Tech and IT");
    const health = users("job", 10, all, "Healthcare");
    tech.forEach((record, i) => {
      expect(health[i]["Full Name"]).toBe(record["Full Name"]);
      expect(health[i]["Urban Address"]).toBe(record["Urban Address"]);
      expect(health[i]["PAN (Personal)"]).toBe(record["PAN (Personal)"]);
    });
  });

  test("a seeded user is still internally consistent", () => {
    for (const record of users("consistent", 50)) {
      const [first, last] = [record["First Name"], record["Last Name"]];
      expect(record["Full Name"]).toBe(`${first} ${last}`);
      expect(record["Urban Address"]).toContain(record["City"]);
      expect(record["Urban Address"]).toContain(`Pincode-${record["PIN Code"]}`);
    }
  });

  test("user N of a seeded table is user N of the seeded JSON/CSV", () => {
    // The table reads fields in its own order; per-field sequences make order irrelevant
    const records = users("handoff", 5);
    for (let i = 0; i < 5; i++) {
      const person = new Person({ profDomain: "Random", seed: "handoff", index: i + 1 });
      expect(person.get("TAN")).toBe(records[i]["TAN"]); // read in a different order first
      expect(person.get("FullName")).toBe(records[i]["Full Name"]);
      expect(person.get("UrbAddress")).toBe(records[i]["Urban Address"]);
    }
  });
});

describe("withStream", () => {
  test("same key, same numbers; randomness restored afterwards, even after an error", () => {
    expect(() =>
      withStream("boom", () => {
        throw new Error("fail");
      })
    ).toThrow("fail");
    expect(withStream("x", () => [rng(), rng()])).toEqual(withStream("x", () => [rng(), rng()]));
    expect(rng()).not.toBe(rng()); // unseeded again
  });

  test("values stay in range (0 <= n < 1)", () => {
    withStream("range", () => {
      for (let i = 0; i < 10000; i++) {
        const n = rng();
        expect(n >= 0 && n < 1).toBe(true);
      }
    });
  });
});
