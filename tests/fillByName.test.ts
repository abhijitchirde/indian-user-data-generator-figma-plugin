import { describe, expect, test } from "@jest/globals";
import {
  fieldForLayerName,
  FIELD_META,
  layerNameClaims,
  normalizeLayerName,
} from "../src/fieldMeta";
import { planFillByName, TreeNode } from "../src/functions/fillByName";

// Minimal stand-ins for Figma nodes
const text = (name: string, autoRename = false): TreeNode => ({ type: "TEXT", name, autoRename });
const frame = (name: string, ...children: TreeNode[]): TreeNode => {
  const node: TreeNode = { type: "FRAME", name, children };
  for (const child of children) child.parent = node;
  return node;
};

/** Groups as [scope name | "-", "layer=Field" ...] for readable assertions */
const plan = (...roots: TreeNode[]) =>
  planFillByName(roots, fieldForLayerName).map((group) => [
    group.scope ? group.scope.name : "-",
    ...group.texts.map((t) => `${t.node.name}=${t.field}`),
  ]);

describe("layer name matching", () => {
  test("names are normalized: case, spaces, punctuation", () => {
    expect(normalizeLayerName("Phone Number")).toBe("phonenumber");
    expect(normalizeLayerName("phone_number")).toBe("phonenumber");
    expect(normalizeLayerName("#E-mail:")).toBe("email");
  });

  test("common names map to the right field", () => {
    expect(fieldForLayerName("Email")).toBe("Email");
    expect(fieldForLayerName("e-mail")).toBe("Email");
    expect(fieldForLayerName("Phone number")).toBe("Mobile");
    expect(fieldForLayerName("Name")).toBe("FullName");
    expect(fieldForLayerName("First name")).toBe("FirstName");
    expect(fieldForLayerName("Surname")).toBe("LastName");
    expect(fieldForLayerName("DOB")).toBe("DoB");
    expect(fieldForLayerName("Aadhaar Number")).toBe("UID");
    expect(fieldForLayerName("PAN")).toBe("PAN");
    expect(fieldForLayerName("PAN (Corp)")).toBe("PANi");
    expect(fieldForLayerName("Pincode")).toBe("PIN");
    expect(fieldForLayerName("Address")).toBe("UrbAddress");
    expect(fieldForLayerName("UPI ID")).toBe("UPIn");
    expect(fieldForLayerName("GST No")).toBe("GSTIN");
  });

  test("unrelated names do not match", () => {
    for (const name of ["Title", "Button", "Label", "Rectangle 1", "Password", "Frame 12"]) {
      expect(fieldForLayerName(name)).toBeNull();
    }
  });

  test("no layer name is claimed by two fields", () => {
    const conflicts = [...layerNameClaims()].filter(([, fields]) => fields.length > 1);
    expect(conflicts).toEqual([]);
  });

  test("every field can be reached by its key and label", () => {
    for (const field of FIELD_META) {
      expect(fieldForLayerName(field.key)).toBe(field.key);
      expect(fieldForLayerName(field.label)).toBe(field.key);
    }
  });
});

describe("planFillByName", () => {
  test("a selected text layer is its own person", () => {
    expect(plan(text("Email"))).toEqual([["-", "Email=Email"]]);
  });

  test("text layers selected together are one person", () => {
    // Shift-click "Name", "Email" and "Phone": the email must match the name
    const card = frame("Card", text("Name"), text("Email"), text("Phone"));
    const [name, email, phone] = card.children as TreeNode[];
    expect(plan(name, email, phone)).toEqual([
      ["-", "Name=FullName", "Email=Email", "Phone=Mobile"],
    ]);
  });

  test("selected layers from different cards are split by card when a field repeats", () => {
    const card1 = frame("Card 1", text("Name"), text("Email"));
    const card2 = frame("Card 2", text("Name"), text("Email"));
    const layers = [...(card1.children as TreeNode[]), ...(card2.children as TreeNode[])];
    expect(plan(...layers)).toEqual([
      ["-", "Name=FullName", "Email=Email"],
      ["-", "Name=FullName", "Email=Email"],
    ]);
  });

  test("the same field selected twice in one frame gives one person per layer", () => {
    const column = frame("Column", text("Email"), text("Email"));
    expect(plan(...(column.children as TreeNode[]))).toEqual([
      ["-", "Email=Email"],
      ["-", "Email=Email"],
    ]);
  });

  test("selected text layers and a selected card: the card is its own person", () => {
    const card = frame("Card", text("Name"), text("Email"));
    const loose = frame("Header", text("PAN"));
    expect(plan(card, ...(loose.children as TreeNode[]))).toEqual([
      ["Card", "Name=FullName", "Email=Email"],
      ["-", "PAN=PAN"],
    ]);
  });

  test("a card is one person, including nested layers; unmatched layers are ignored", () => {
    const card = frame("Card", text("Name"), text("Title"), frame("Contact", text("Email"), text("Phone")));
    expect(plan(card)).toEqual([["Card", "Name=FullName", "Email=Email", "Phone=Mobile"]]);
  });

  test("layers still named after their content are not filled (labels)", () => {
    // A label showing "Email" is auto-named "Email"; the value layer was renamed by the designer
    const card = frame("Card", text("Email", true), text("Email"));
    expect(plan(card)).toEqual([["Card", "Email=Email"]]);
  });

  test("a list of cards: each card is its own person", () => {
    const card = (n: number) => frame(`Card ${n}`, text("Name"), text("Email"));
    expect(plan(frame("List", card(1), card(2), card(3)))).toEqual([
      ["Card 1", "Name=FullName", "Email=Email"],
      ["Card 2", "Name=FullName", "Email=Email"],
      ["Card 3", "Name=FullName", "Email=Email"],
    ]);
  });

  test("selecting several cards gives one person per card", () => {
    expect(plan(frame("A", text("Name")), frame("B", text("Name")))).toEqual([
      ["A", "Name=FullName"],
      ["B", "Name=FullName"],
    ]);
  });

  test("loose text layers next to repeated cards share one person", () => {
    const page = frame(
      "Page",
      text("PAN"),
      text("GSTIN"),
      frame("Card 1", text("Name")),
      frame("Card 2", text("Name"))
    );
    expect(plan(page)).toEqual([
      ["Card 1", "Name=FullName"],
      ["Card 2", "Name=FullName"],
      ["-", "PAN=PAN", "GSTIN=GSTIN"],
    ]);
  });

  test("repeated loose text layers each get their own person", () => {
    expect(plan(frame("Column", text("Email"), text("Email")))).toEqual([
      ["-", "Email=Email"],
      ["-", "Email=Email"],
    ]);
  });

  test("nothing to fill gives no groups", () => {
    expect(plan(frame("Empty", text("Title"), frame("Inner")))).toEqual([]);
  });
});
