// Single source of truth for every data field the plugin can generate.
// Used by single-layer fill, the canvas table, JSON/CSV export and "Regenerate".
// Keys match the values the UI already sends, and table checkboxes use `${key}Value`.

import {
  generateAadhar,
  generateCIN,
  generateCity,
  generateDIN,
  generateDL,
  generateDoB,
  generateEmail,
  generateFirstName,
  generateGSTIN,
  generateLastName,
  generateLLPIN,
  generateMobile,
  generatePAN,
  generatePANi,
  generatePassport,
  generatePINCode,
  generateProf,
  generateRC,
  generateRCBH,
  generateRurAddress,
  generateState,
  generateTAN,
  generateUPIm,
  generateUPIn,
  generateUrbAddress,
  generateVoterID,
} from "./functions/generators";

export type FieldKey =
  | "FirstName"
  | "LastName"
  | "FullName"
  | "DoB"
  | "Email"
  | "Mobile"
  | "Prof"
  | "RurAddress"
  | "UrbAddress"
  | "City"
  | "State"
  | "CityState"
  | "PIN"
  | "Pass"
  | "UID"
  | "PAN"
  | "UPIn"
  | "UPIm"
  | "DL"
  | "RC"
  | "RCBH"
  | "Voter"
  | "PANi"
  | "GSTIN"
  | "CIN"
  | "DIN"
  | "LLPIN"
  | "TAN";

export type FieldGroup =
  | "personal"
  | "profession"
  | "location"
  | "personalIds"
  | "businessIds";

export interface PersonOptions {
  /** Profession domain from the UI dropdown, "Random" by default */
  profDomain?: string;
}

export interface FieldDef {
  key: FieldKey;
  /** Label used in the canvas table, JSON keys and CSV headers */
  label: string;
  group: FieldGroup;
  /** false for fields that are only offered as single-layer buttons */
  inTable: boolean;
  generate: (person: Person) => string;
}

/**
 * One fictitious user. Fields are generated on first access and cached,
 * so every field of a person stays consistent (same name in email/UPI/PAN,
 * same state/city/PIN in addresses, DL issued after turning 18...).
 */
export class Person {
  private readonly values = new Map<FieldKey, string>();

  constructor(readonly options: PersonOptions = {}) {}

  get(key: FieldKey): string {
    if (!this.values.has(key)) {
      const field = FIELDS_BY_KEY[key];
      if (!field) throw new Error(`Unknown field: ${key}`);
      this.values.set(key, field.generate(this));
    }
    return this.values.get(key);
  }

  /** Birth year parsed from the DD-MM-YYYY date of birth */
  birthYear(): number {
    return parseInt(this.get("DoB").slice(-4), 10);
  }
}

export const FIELDS: FieldDef[] = [
  // Personal details
  { key: "FirstName", label: "First Name", group: "personal", inTable: true,
    generate: () => generateFirstName() },
  { key: "LastName", label: "Last Name", group: "personal", inTable: true,
    generate: () => generateLastName() },
  { key: "FullName", label: "Full Name", group: "personal", inTable: true,
    generate: (p) => `${p.get("FirstName")} ${p.get("LastName")}` },
  { key: "DoB", label: "Date of Birth", group: "personal", inTable: true,
    generate: () => generateDoB() },
  { key: "Email", label: "Email", group: "personal", inTable: true,
    generate: (p) => generateEmail(p.get("FirstName"), p.get("LastName")) },
  { key: "Mobile", label: "Mobile", group: "personal", inTable: true,
    generate: () => generateMobile() },

  // Profession
  { key: "Prof", label: "Profession", group: "profession", inTable: true,
    generate: (p) => generateProf(p.options.profDomain ?? "Random") },

  // Location
  { key: "RurAddress", label: "Rural Address", group: "location", inTable: true,
    generate: (p) => generateRurAddress(p.get("State"), p.get("City"), p.get("PIN")) },
  { key: "UrbAddress", label: "Urban Address", group: "location", inTable: true,
    generate: (p) => generateUrbAddress(p.get("State"), p.get("City"), p.get("PIN")) },
  { key: "City", label: "City", group: "location", inTable: true,
    generate: (p) => generateCity(p.get("State")) },
  { key: "State", label: "State", group: "location", inTable: true,
    generate: () => generateState() },
  { key: "CityState", label: "City, State", group: "location", inTable: false,
    generate: (p) => `${p.get("City")}, ${p.get("State")}` },
  { key: "PIN", label: "PIN Code", group: "location", inTable: true,
    generate: (p) => generatePINCode(p.get("State")) },

  // Personal IDs
  { key: "Pass", label: "Passport", group: "personalIds", inTable: true,
    generate: () => generatePassport() },
  { key: "UID", label: "UID (Aadhar)", group: "personalIds", inTable: true,
    generate: () => generateAadhar() },
  { key: "PAN", label: "PAN (Personal)", group: "personalIds", inTable: true,
    generate: (p) => generatePAN(p.get("LastName")) },
  { key: "UPIn", label: "UPI (name)", group: "personalIds", inTable: true,
    generate: (p) => generateUPIn(p.get("FirstName"), p.get("LastName")) },
  { key: "UPIm", label: "UPI (mobile)", group: "personalIds", inTable: true,
    generate: (p) => generateUPIm(p.get("Mobile")) },
  { key: "DL", label: "Driving License", group: "personalIds", inTable: true,
    generate: (p) => generateDL(p.get("State"), p.birthYear()) },
  { key: "RC", label: "Vehicle Reg. (RC)", group: "personalIds", inTable: true,
    generate: (p) => generateRC(p.get("State")) },
  { key: "RCBH", label: "Vehicle Reg. (BH series)", group: "personalIds", inTable: true,
    generate: () => generateRCBH() },
  { key: "Voter", label: "Voter ID", group: "personalIds", inTable: true,
    generate: () => generateVoterID() },

  // Business IDs
  { key: "PANi", label: "PAN (Corp)", group: "businessIds", inTable: true,
    generate: () => generatePANi() },
  { key: "GSTIN", label: "GSTIN", group: "businessIds", inTable: true,
    generate: (p) => generateGSTIN(p.get("State"), p.get("PANi")) },
  { key: "CIN", label: "CIN", group: "businessIds", inTable: true,
    generate: (p) => generateCIN(p.get("State")) },
  { key: "DIN", label: "DIN", group: "businessIds", inTable: true,
    generate: () => generateDIN() },
  { key: "LLPIN", label: "LLPIN", group: "businessIds", inTable: true,
    generate: () => generateLLPIN() },
  { key: "TAN", label: "TAN", group: "businessIds", inTable: true,
    generate: () => generateTAN() },
];

export const FIELDS_BY_KEY = Object.fromEntries(
  FIELDS.map((field) => [field.key, field])
) as Record<FieldKey, FieldDef>;

export function isFieldKey(value: unknown): value is FieldKey {
  return typeof value === "string" && value in FIELDS_BY_KEY;
}

/** Checkbox state sent by the table tab, e.g. { EmailValue: true, ... } */
export type FieldSelection = Partial<Record<`${FieldKey}Value`, boolean>>;

/** Table fields the user ticked, in table order */
export function selectedTableFields(selection: FieldSelection): FieldDef[] {
  return FIELDS.filter(
    (field) => field.inTable && selection[`${field.key}Value`] === true
  );
}

/** Generates `count` users as plain label → value records (used by JSON and CSV export) */
export function generateRecords(
  selection: FieldSelection,
  count: number,
  options: PersonOptions = {}
): Record<string, string>[] {
  const fields = selectedTableFields(selection);
  const records: Record<string, string>[] = [];
  for (let i = 0; i < count; i++) {
    const person = new Person(options);
    const record: Record<string, string> = {};
    for (const field of fields) record[field.label] = person.get(field.key);
    records.push(record);
  }
  return records;
}

function escapeCSV(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function recordsToCSV(selection: FieldSelection, records: Record<string, string>[]): string {
  const headers = selectedTableFields(selection).map((field) => field.label);
  const lines = [headers.map(escapeCSV).join(",")];
  for (const record of records) {
    lines.push(headers.map((header) => escapeCSV(record[header] ?? "")).join(","));
  }
  return lines.join("\n") + "\n";
}
