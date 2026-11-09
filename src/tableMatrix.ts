// What goes in each cell of a user table, independent of how it's drawn (Figma frames or a
// FigJam table). Pure, so it can be unit-tested.
//
//   "columns" (one column per user)        "rows" (one row per user)
//   Details    | User 1 | User 2           User   | Full Name | Email
//   Full Name  | ...    | ...              User 1 | ...       | ...
//   Email      | ...    | ...              User 2 | ...       | ...

import type { FieldKey } from "./fieldMeta";

export type TableLayout = "columns" | "rows";

export const TABLE_LAYOUTS: { value: TableLayout; label: string }[] = [
  { value: "columns", label: "Users as columns" },
  { value: "rows", label: "Users as rows" },
];

export function isTableLayout(value: unknown): value is TableLayout {
  return value === "columns" || value === "rows";
}

/** corner: top-left; header: first row; label: first column; data: generated values */
export type CellKind = "corner" | "header" | "label" | "data";

export interface MatrixCell {
  text: string;
  kind: CellKind;
  /** data cells: which field and which user (1-based) */
  field?: FieldKey;
  user?: number;
}

export interface TableField {
  key: FieldKey;
  label: string;
}

/**
 * users[i][key] is user i+1's value for that field.
 * Returns rows of cells, header row first.
 */
export function buildTableMatrix(
  fields: TableField[],
  users: Partial<Record<FieldKey, string>>[],
  layout: TableLayout
): MatrixCell[][] {
  const data = (field: TableField, userIndex: number): MatrixCell => ({
    text: users[userIndex][field.key] ?? "",
    kind: "data",
    field: field.key,
    user: userIndex + 1,
  });

  if (layout === "rows") {
    return [
      [
        { text: "User", kind: "corner" },
        ...fields.map((f): MatrixCell => ({ text: f.label, kind: "header" })),
      ],
      ...users.map((_, u) => [
        { text: `User ${u + 1}`, kind: "label" } as MatrixCell,
        ...fields.map((f) => data(f, u)),
      ]),
    ];
  }

  return [
    [
      { text: "Details", kind: "corner" },
      ...users.map((_, u): MatrixCell => ({ text: `User ${u + 1}`, kind: "header" })),
    ],
    ...fields.map((f) => [
      { text: f.label, kind: "label" } as MatrixCell,
      ...users.map((_, u) => data(f, u)),
    ]),
  ];
}

/** Width of a column that holds values of these fields (addresses need the most room) */
function widthForFields(keys: FieldKey[]): number {
  if (keys.some((k) => k === "RurAddress" || k === "UrbAddress")) return 240;
  if (keys.some((k) => k === "Email" || k === "UPIn" || k === "Prof")) return 170;
  return 120;
}

/** Column widths in px: a fixed label column, then one width per data column */
export function columnWidths(fields: TableField[], userCount: number, layout: TableLayout): number[] {
  const labelWidth = layout === "rows" ? 64 : 100;
  if (layout === "rows") {
    return [labelWidth, ...fields.map((f) => widthForFields([f.key]))];
  }
  // One column per user, each holding every field
  const width = widthForFields(fields.map((f) => f.key));
  return [labelWidth, ...Array.from({ length: userCount }, () => width)];
}
