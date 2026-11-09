// Field descriptions shared by the plugin code and the UI.
// Deliberately free of generators/dataset imports so the UI bundle stays small.
// Generators are attached in fields.ts.

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
  | "Voter"
  | "DL"
  | "RC"
  | "RCBH"
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

export const GROUPS: { id: FieldGroup; label: string }[] = [
  { id: "personal", label: "Personal Details" },
  { id: "profession", label: "Profession" },
  { id: "location", label: "Location" },
  { id: "personalIds", label: "Personal IDs" },
  { id: "businessIds", label: "Business IDs" },
];

/** Profession domains; values are dataset keys in dataSet.ts ("Random" picks a domain) */
export const PROFESSION_DOMAINS: { value: string; label: string }[] = [
  { value: "Random", label: "Random" },
  { value: "Tech and IT", label: "Tech and IT" },
  { value: "Engineering", label: "Engineering" },
  { value: "Management", label: "Management" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Science", label: "Science" },
  { value: "Education", label: "Education" },
  { value: "Art and media", label: "Art and media" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Construction", label: "Construction" },
  { value: "Govt and administration", label: "Govt and administration" },
  { value: "Volunteering", label: "Volunteering" },
  { value: "Other", label: "Others" },
];

export interface FieldMeta {
  key: FieldKey;
  /** Label used in the canvas table, JSON keys and CSV headers */
  label: string;
  /** Compact label for plugin buttons and checkboxes */
  shortLabel: string;
  group: FieldGroup;
  /** false for fields that are only offered as single-layer buttons */
  inTable: boolean;
  /** Ticked by default in the table tab */
  defaultInTable: boolean;
  /**
   * Layer names that are filled with this field by "Fill by layer names".
   * Compared after normalizing (lowercase, letters and digits only), so
   * "Phone number", "phone_number" and "PhoneNumber" all match "phonenumber".
   * The key, label and short label are always matched as well.
   */
  aliases: string[];
}

export const FIELD_META: FieldMeta[] = [
  // Personal details
  { key: "FirstName", label: "First Name", shortLabel: "First Name", group: "personal",
    inTable: true, defaultInTable: false,
    aliases: ["first name", "fname", "given name", "first"] },
  { key: "LastName", label: "Last Name", shortLabel: "Last Name", group: "personal",
    inTable: true, defaultInTable: false,
    aliases: ["last name", "lname", "surname", "family name", "last"] },
  { key: "FullName", label: "Full Name", shortLabel: "Full Name", group: "personal",
    inTable: true, defaultInTable: true,
    aliases: ["name", "full name", "user name", "customer name", "display name"] },
  { key: "DoB", label: "Date of Birth", shortLabel: "Birth Date", group: "personal",
    inTable: true, defaultInTable: true,
    aliases: ["dob", "date of birth", "birth date", "birthday"] },
  { key: "Email", label: "Email", shortLabel: "Email", group: "personal",
    inTable: true, defaultInTable: true,
    aliases: ["email", "e-mail", "email address", "email id", "mail"] },
  { key: "Mobile", label: "Mobile", shortLabel: "Mobile", group: "personal",
    inTable: true, defaultInTable: true,
    aliases: ["mobile", "phone", "phone number", "mobile number", "mobile no", "phone no",
      "contact", "contact number", "cell"] },

  // Profession
  { key: "Prof", label: "Profession", shortLabel: "Profession", group: "profession",
    inTable: true, defaultInTable: true,
    aliases: ["profession", "occupation", "job", "job title", "designation", "role"] },

  // Location
  { key: "RurAddress", label: "Rural Address", shortLabel: "Rural Addr.", group: "location",
    inTable: true, defaultInTable: false,
    aliases: ["rural address", "village address"] },
  { key: "UrbAddress", label: "Urban Address", shortLabel: "City Addr.", group: "location",
    inTable: true, defaultInTable: true,
    aliases: ["address", "urban address", "city address", "street address"] },
  { key: "City", label: "City", shortLabel: "City", group: "location",
    inTable: true, defaultInTable: true,
    aliases: ["city", "town", "district"] },
  { key: "State", label: "State", shortLabel: "State", group: "location",
    inTable: true, defaultInTable: true,
    aliases: ["state"] },
  { key: "CityState", label: "City, State", shortLabel: "City & State", group: "location",
    inTable: false, defaultInTable: false,
    aliases: ["city state", "city and state", "location"] },
  { key: "PIN", label: "PIN Code", shortLabel: "Post Code", group: "location",
    inTable: true, defaultInTable: true,
    aliases: ["pin", "pincode", "postcode", "postal code", "zip", "zip code"] },

  // Personal IDs
  { key: "Pass", label: "Passport", shortLabel: "Passport", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["passport", "passport number", "passport no"] },
  { key: "UID", label: "UID (Aadhar)", shortLabel: "Aadhar", group: "personalIds",
    inTable: true, defaultInTable: true,
    aliases: ["aadhaar", "aadhar", "aadhaar number", "aadhar number", "aadhaar no", "uid"] },
  { key: "PAN", label: "PAN (Personal)", shortLabel: "PAN", group: "personalIds",
    inTable: true, defaultInTable: true,
    aliases: ["pan", "pan number", "pan no", "pan card"] },
  { key: "UPIn", label: "UPI (name)", shortLabel: "UPI (name)", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["upi", "upi id", "vpa"] },
  { key: "UPIm", label: "UPI (mobile)", shortLabel: "UPI (mob)", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["upi mobile", "upi phone"] },
  { key: "Voter", label: "Voter ID", shortLabel: "Voter ID", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["voter", "voter id", "voter id number", "epic", "epic number"] },
  { key: "DL", label: "Driving License", shortLabel: "DL", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["dl", "driving license", "driving licence", "dl number", "license number",
      "licence number"] },
  { key: "RC", label: "Vehicle Reg. (RC)", shortLabel: "Vehicle RC", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["rc", "vehicle number", "vehicle registration", "registration number"] },
  { key: "RCBH", label: "Vehicle Reg. (BH series)", shortLabel: "RC (BH)", group: "personalIds",
    inTable: true, defaultInTable: false,
    aliases: ["rc bh", "bh series", "bh number"] },

  // Business IDs
  { key: "PANi", label: "PAN (Corp)", shortLabel: "PAN (Corp)", group: "businessIds",
    inTable: true, defaultInTable: false,
    aliases: ["company pan", "corporate pan", "business pan", "pan corp"] },
  { key: "GSTIN", label: "GSTIN", shortLabel: "GSTIN", group: "businessIds",
    inTable: true, defaultInTable: true,
    aliases: ["gstin", "gst", "gst number", "gst no"] },
  { key: "CIN", label: "CIN", shortLabel: "CIN", group: "businessIds",
    inTable: true, defaultInTable: false,
    aliases: ["cin", "cin number", "corporate identification number"] },
  { key: "DIN", label: "DIN", shortLabel: "DIN", group: "businessIds",
    inTable: true, defaultInTable: false,
    aliases: ["din", "din number", "director identification number"] },
  { key: "LLPIN", label: "LLPIN", shortLabel: "LLPIN", group: "businessIds",
    inTable: true, defaultInTable: false,
    aliases: ["llpin", "llp number"] },
  { key: "TAN", label: "TAN", shortLabel: "TAN", group: "businessIds",
    inTable: true, defaultInTable: false,
    aliases: ["tan", "tan number"] },
];

export const FIELD_META_BY_KEY = Object.fromEntries(
  FIELD_META.map((field) => [field.key, field])
) as Record<FieldKey, FieldMeta>;

/** Fields of one group, in display order; tableOnly skips button-only fields */
export function fieldsInGroup(group: FieldGroup, tableOnly = false): FieldMeta[] {
  return FIELD_META.filter((f) => f.group === group && (!tableOnly || f.inTable));
}

export function isFieldKey(value: unknown): value is FieldKey {
  return typeof value === "string" && value in FIELD_META_BY_KEY;
}

// ---------------------------------------------------------------------------
// Table selection (checkbox state is keyed `${key}Value`, e.g. EmailValue)
// ---------------------------------------------------------------------------

export type SelectionKey = `${FieldKey}Value`;
export type FieldSelection = Partial<Record<SelectionKey, boolean>>;

export const selectionKey = (key: FieldKey): SelectionKey => `${key}Value`;

/** Checkbox state for the table tab: "default", all on, or all off */
export function tableSelection(mode: "default" | "all" | "none"): FieldSelection {
  const selection: FieldSelection = {};
  for (const field of FIELD_META) {
    if (!field.inTable) continue;
    selection[selectionKey(field.key)] =
      mode === "all" ? true : mode === "none" ? false : field.defaultInTable;
  }
  return selection;
}

// ---------------------------------------------------------------------------
// Layer name matching
// ---------------------------------------------------------------------------

/** "Phone Number", "phone_number", "PHONE-NUMBER:" → "phonenumber" */
export function normalizeLayerName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

const FIELD_BY_LAYER_NAME: Map<string, FieldKey> = (() => {
  const map = new Map<string, FieldKey>();
  for (const field of FIELD_META) {
    for (const name of [field.key, field.label, field.shortLabel, ...field.aliases]) {
      const normalized = normalizeLayerName(name);
      // First field wins, so a generic short label never overrides an explicit alias
      if (normalized && !map.has(normalized)) map.set(normalized, field.key);
    }
  }
  return map;
})();

/** The field a text layer should be filled with, based on its name */
export function fieldForLayerName(name: string): FieldKey | null {
  return FIELD_BY_LAYER_NAME.get(normalizeLayerName(name)) ?? null;
}

/** For tests: every normalized name and the fields claiming it */
export function layerNameClaims(): Map<string, FieldKey[]> {
  const claims = new Map<string, FieldKey[]>();
  for (const field of FIELD_META) {
    const names = new Set(
      [field.key, field.label, field.shortLabel, ...field.aliases].map(normalizeLayerName)
    );
    for (const name of names) claims.set(name, [...(claims.get(name) ?? []), field.key]);
  }
  return claims;
}
