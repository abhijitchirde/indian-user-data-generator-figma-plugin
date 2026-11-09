import { describe, expect, test } from "@jest/globals";
import { buildTableMatrix, columnWidths, TableField } from "../src/tableMatrix";

const fields: TableField[] = [
  { key: "FullName", label: "Full Name" },
  { key: "Email", label: "Email" },
];
const users = [
  { FullName: "Priya Patel", Email: "priya.patel@gmail.com" },
  { FullName: "Rahul Sharma", Email: "sharma.rahul@yahoo.in" },
  { FullName: "Bala Gopal", Email: "balagopal@outlook.com" },
];
const texts = (rows: ReturnType<typeof buildTableMatrix>) => rows.map((r) => r.map((c) => c.text));

describe("buildTableMatrix", () => {
  test("users as columns: one row per field, one column per user", () => {
    expect(texts(buildTableMatrix(fields, users, "columns"))).toEqual([
      ["Details", "User 1", "User 2", "User 3"],
      ["Full Name", "Priya Patel", "Rahul Sharma", "Bala Gopal"],
      ["Email", "priya.patel@gmail.com", "sharma.rahul@yahoo.in", "balagopal@outlook.com"],
    ]);
  });

  test("users as rows: one row per user, one column per field", () => {
    expect(texts(buildTableMatrix(fields, users, "rows"))).toEqual([
      ["User", "Full Name", "Email"],
      ["User 1", "Priya Patel", "priya.patel@gmail.com"],
      ["User 2", "Rahul Sharma", "sharma.rahul@yahoo.in"],
      ["User 3", "Bala Gopal", "balagopal@outlook.com"],
    ]);
  });

  test("cell kinds: corner, header row, label column, data", () => {
    for (const layout of ["columns", "rows"] as const) {
      const rows = buildTableMatrix(fields, users, layout);
      expect(rows[0][0].kind).toBe("corner");
      expect(rows[0].slice(1).every((c) => c.kind === "header")).toBe(true);
      expect(rows.slice(1).every((r) => r[0].kind === "label")).toBe(true);
      expect(rows.slice(1).every((r) => r.slice(1).every((c) => c.kind === "data"))).toBe(true);
    }
  });

  test("data cells know their field and user, in both layouts", () => {
    const byColumns = buildTableMatrix(fields, users, "columns");
    expect(byColumns[2][3]).toEqual({ text: "balagopal@outlook.com", kind: "data", field: "Email", user: 3 });
    const byRows = buildTableMatrix(fields, users, "rows");
    expect(byRows[3][2]).toEqual({ text: "balagopal@outlook.com", kind: "data", field: "Email", user: 3 });
  });

  test("every row has the same number of cells", () => {
    for (const layout of ["columns", "rows"] as const) {
      const rows = buildTableMatrix(fields, users, layout);
      expect(new Set(rows.map((r) => r.length)).size).toBe(1);
    }
  });
});

describe("columnWidths", () => {
  test("one width per column, label column first", () => {
    expect(columnWidths(fields, 3, "columns")).toHaveLength(4);
    expect(columnWidths(fields, 3, "rows")).toHaveLength(3);
  });

  test("addresses get the widest columns", () => {
    const withAddress: TableField[] = [...fields, { key: "UrbAddress", label: "Urban Address" }];
    const [, name, email, address] = columnWidths(withAddress, 1, "rows");
    expect(address).toBeGreaterThan(email);
    expect(email).toBeGreaterThan(name);
    // Users as columns: every user column must fit an address
    expect(columnWidths(withAddress, 2, "columns").slice(1)).toEqual([address, address]);
  });
});
