// Generators for every field in the registry (fieldMeta.ts), plus the Person model
// and table/JSON/CSV helpers. Used by the plugin code only: the UI imports
// fieldMeta.ts directly, so the dataset stays out of the UI bundle.

import { FIELD_META, selectionKey } from "./fieldMeta";
import type { FieldKey, FieldMeta, FieldSelection } from "./fieldMeta";
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

export type { FieldKey, FieldSelection } from "./fieldMeta";
export { isFieldKey, fieldForLayerName } from "./fieldMeta";

export interface PersonOptions {
  /** Profession domain from the UI dropdown, "Random" by default */
  profDomain?: string;
}

export interface FieldDef extends FieldMeta {
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

// Each generator reads the fields it depends on from the person,
// so a person's fields always agree with each other.
const GENERATORS: Record<FieldKey, (p: Person) => string> = {
  // Personal details
  FirstName: () => generateFirstName(),
  LastName: () => generateLastName(),
  FullName: (p) => `${p.get("FirstName")} ${p.get("LastName")}`,
  DoB: () => generateDoB(),
  Email: (p) => generateEmail(p.get("FirstName"), p.get("LastName")),
  Mobile: () => generateMobile(),

  // Profession
  Prof: (p) => generateProf(p.options.profDomain ?? "Random"),

  // Location
  RurAddress: (p) => generateRurAddress(p.get("State"), p.get("City"), p.get("PIN")),
  UrbAddress: (p) => generateUrbAddress(p.get("State"), p.get("City"), p.get("PIN")),
  City: (p) => generateCity(p.get("State")),
  State: () => generateState(),
  CityState: (p) => `${p.get("City")}, ${p.get("State")}`,
  PIN: (p) => generatePINCode(p.get("State")),

  // Personal IDs
  Pass: () => generatePassport(),
  UID: () => generateAadhar(),
  PAN: (p) => generatePAN(p.get("LastName")),
  UPIn: (p) => generateUPIn(p.get("FirstName"), p.get("LastName")),
  UPIm: (p) => generateUPIm(p.get("Mobile")),
  Voter: () => generateVoterID(),
  DL: (p) => generateDL(p.get("State"), p.birthYear()),
  RC: (p) => generateRC(p.get("State")),
  RCBH: () => generateRCBH(),

  // Business IDs
  PANi: () => generatePANi(),
  GSTIN: (p) => generateGSTIN(p.get("State"), p.get("PANi")),
  CIN: (p) => generateCIN(p.get("State")),
  DIN: () => generateDIN(),
  LLPIN: () => generateLLPIN(),
  TAN: () => generateTAN(),
};

export const FIELDS: FieldDef[] = FIELD_META.map((meta) => ({
  ...meta,
  generate: GENERATORS[meta.key],
}));

export const FIELDS_BY_KEY = Object.fromEntries(
  FIELDS.map((field) => [field.key, field])
) as Record<FieldKey, FieldDef>;

/** Table fields the user ticked, in table order */
export function selectedTableFields(selection: FieldSelection): FieldDef[] {
  return FIELDS.filter(
    (field) => field.inTable && selection[selectionKey(field.key)] === true
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
