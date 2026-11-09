import { describe, expect, test } from "@jest/globals";
import { dataSet } from "../src/data/dataSet";
import {
  FIELDS,
  FieldKey,
  FieldSelection,
  generateRecords,
  Person,
  recordsToCSV,
  selectedTableFields,
} from "../src/fields";
import { generateEmail, generatePAN, generateUPIn } from "../src/functions/generators";

// Random generators: check each property over many samples
const RUNS = 500;
const thisYear = new Date().getFullYear();

const people = (options = {}) =>
  Array.from({ length: RUNS }, () => new Person(options));

const FORMATS: Partial<Record<FieldKey, RegExp>> = {
  DoB: /^\d{2}-\d{2}-\d{4}$/,
  Mobile: /^[6-9]\d{9}$/,
  PIN: /^\d{6}$/,
  Pass: /^[A-Z]\d{7}$/,
  UID: /^\d{4} \d{4} \d{4}$/,
  PAN: /^[A-Z]{3}P[A-Z]\d{4}[A-Z]$/,
  UPIm: /^[6-9]\d{9}@[a-z0-9]+$/,
  UPIn: /^\S+@[a-z0-9]+$/,
  Email: /^[a-z0-9.]+@[a-z0-9-]+\.[a-z.]+$/,
  DL: /^[A-Z]{2}\d{2,3}\d{4}\d{7}$/,
  RC: /^[A-Z]{2}\d{2,3}[A-Z]{2}\d{4}$/,
  RCBH: /^\d{2}BH\d{4}[A-HJ-NP-Z][A-Z]$/,
  Voter: /^[A-Z0-9]{10}$/,
  PANi: /^[A-Z]{3}[PCHFATBGLJ][A-Z]\d{4}[A-Z]$/,
  GSTIN: /^\d{2}[A-Z]{3}[PCHFATBGLJ][A-Z]\d{4}[A-Z]1Z[0-9A-Z]$/,
  CIN: /^[LU]\d{5}[A-Z]{2}\d{4}(PLC|PTC|OPC)\d{6}$/,
  DIN: /^\d{8}$/,
  LLPIN: /^[A-Z]{3}-\d{4}$/,
  TAN: /^[A-Z]{4}\d{5}[A-Z]$/,
};

describe("field formats", () => {
  for (const [key, format] of Object.entries(FORMATS)) {
    test(`${key} matches ${format}`, () => {
      for (const person of people()) {
        expect(person.get(key as FieldKey)).toMatch(format);
      }
    });
  }

  test("every field generates a non-empty string", () => {
    for (const person of people()) {
      for (const field of FIELDS) {
        const value = person.get(field.key);
        expect(typeof value).toBe("string");
        expect(value.length).toBeGreaterThan(0);
        expect(value).not.toMatch(/undefined|NaN/);
      }
    }
  });
});

describe("dates and years", () => {
  test("date of birth is a real date for an 18-80 year old", () => {
    for (const person of people()) {
      const [day, month, year] = person.get("DoB").split("-").map(Number);
      const date = new Date(year, month - 1, day);
      expect(date.getDate()).toBe(day);
      expect(date.getMonth()).toBe(month - 1);
      expect(year).toBeGreaterThanOrEqual(thisYear - 80);
      expect(year).toBeLessThanOrEqual(thisYear - 18);
    }
  });

  test("driving licence is issued after the holder turned 18, and not in the future", () => {
    for (const person of people()) {
      const dl = person.get("DL");
      const issueYear = Number(dl.slice(-11, -7));
      expect(issueYear).toBeGreaterThanOrEqual(person.birthYear() + 18);
      expect(issueYear).toBeLessThanOrEqual(thisYear);
    }
  });

  test("BH series year is between 2021 and this year", () => {
    for (const person of people()) {
      const year = 2000 + Number(person.get("RCBH").slice(0, 2));
      expect(year).toBeGreaterThanOrEqual(2021);
      expect(year).toBeLessThanOrEqual(thisYear);
    }
  });

  test("CIN incorporation year is not in the future", () => {
    for (const person of people()) {
      const year = Number(person.get("CIN").slice(8, 12));
      expect(year).toBeGreaterThanOrEqual(1950);
      expect(year).toBeLessThanOrEqual(thisYear);
    }
  });
});

describe("one person is internally consistent", () => {
  test("values are cached", () => {
    const person = new Person();
    expect(person.get("Email")).toBe(person.get("Email"));
  });

  test("full name, PAN, email and UPI use the same name", () => {
    for (const person of people()) {
      const first = person.get("FirstName");
      const last = person.get("LastName");
      expect(person.get("FullName")).toBe(`${first} ${last}`);
      expect(person.get("PAN")[4]).toBe(last[0].toUpperCase());
      expect(person.get("UPIn").startsWith(`${first}${last}`.replace(/\s+/g, "").toLowerCase())).toBe(true);
      expect(person.get("UPIm").startsWith(person.get("Mobile"))).toBe(true);
    }
  });

  test("addresses, city and PIN belong to the person's state", () => {
    for (const person of people()) {
      const state = person.get("State");
      const city = person.get("City");
      const pin = person.get("PIN");
      expect(dataSet[state].slice(4)).toContain(city);
      expect(pin[0]).toBe(dataSet[state][2]);
      for (const address of [person.get("UrbAddress"), person.get("RurAddress")]) {
        expect(address).toContain(city);
        expect(address).toContain(state);
        expect(address).toContain(`Pincode-${pin}`);
      }
      expect(person.get("CityState")).toBe(`${city}, ${state}`);
    }
  });

  test("DL, RC, GSTIN and CIN use the person's state", () => {
    for (const person of people()) {
      const [code, , , gstCode] = dataSet[person.get("State")];
      expect(person.get("DL").startsWith(code)).toBe(true);
      expect(person.get("RC").startsWith(code)).toBe(true);
      expect(person.get("CIN").slice(6, 8)).toBe(code);
      expect(person.get("GSTIN").startsWith(gstCode)).toBe(true);
      expect(person.get("GSTIN").slice(2, 12)).toBe(person.get("PANi"));
    }
  });

  test("profession comes from the chosen domain", () => {
    for (const person of people({ profDomain: "Healthcare" })) {
      expect(dataSet["Healthcare"]).toContain(person.get("Prof"));
    }
  });
});

describe("generators with multi-word names", () => {
  test("email and UPI never contain spaces", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(generateEmail("Bala Gopal", "Sen Gupta")).not.toMatch(/\s/);
      expect(generateUPIn("Bala Gopal", "Sen Gupta")).toMatch(/^balagopalsengupta@[a-z0-9]+$/);
    }
  });

  test("apostrophes are removed from email and UPI", () => {
    for (let i = 0; i < RUNS; i++) {
      expect(generateEmail("Priya", "D’Alia")).toMatch(/^[a-z0-9.]+@/);
      expect(generateUPIn("Priya", "D'Alia")).toMatch(/^priyadalia@[a-z0-9]+$/);
    }
  });

  test("PAN 5th character is the surname initial", () => {
    expect(generatePAN("sharma")[4]).toBe("S");
  });
});

describe("table, JSON and CSV output", () => {
  const selection: FieldSelection = {
    FullNameValue: true,
    EmailValue: true,
    UrbAddressValue: true,
    PINValue: true,
    TANValue: false,
  };

  test("selected fields keep table order and skip unticked ones", () => {
    expect(selectedTableFields(selection).map((f) => f.key)).toEqual([
      "FullName",
      "Email",
      "UrbAddress",
      "PIN",
    ]);
  });

  test("button-only fields are never in the table", () => {
    expect(selectedTableFields({ CityStateValue: true } as FieldSelection)).toEqual([]);
  });

  test("records use labels as keys, one record per user", () => {
    const records = generateRecords(selection, 25);
    expect(records).toHaveLength(25);
    for (const record of records) {
      expect(Object.keys(record)).toEqual(["Full Name", "Email", "Urban Address", "PIN Code"]);
    }
  });

  test("CSV has a header and quotes values containing commas", () => {
    const records = generateRecords(selection, 3);
    const lines = recordsToCSV(selection, records).trimEnd().split("\n");
    expect(lines[0]).toBe("Full Name,Email,Urban Address,PIN Code");
    expect(lines).toHaveLength(4);
    for (const [i, record] of records.entries()) {
      expect(lines[i + 1]).toContain(`"${record["Urban Address"]}"`);
    }
  });

  test("CSV escapes double quotes", () => {
    const csv = recordsToCSV({ FullNameValue: true }, [{ "Full Name": 'A "B" C' }]);
    expect(csv).toBe('Full Name\n"A ""B"" C"\n');
  });
});
