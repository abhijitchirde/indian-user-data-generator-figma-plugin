// "Fill by layer names": decides which text layers get which field, and which
// layers belong to the same person. Pure (works on any tree with type/name/children),
// so it can be unit-tested without Figma.
//
// Rules:
// - A text layer is filled when its name matches a field ("Email", "Phone number", "PAN"...).
// - Layers still named after their content (Figma's autoRename) are skipped: a label
//   showing the text "Email" is auto-named "Email" and must not be overwritten.
// - Each selected text layer is its own person.
// - A selected frame/group/instance is one person, unless it contains the same field
//   more than once (e.g. a list of cards). Then each child is split off the same way,
//   so every card becomes its own person.

import type { FieldKey } from "../fieldMeta";

export interface TreeNode {
  type: string;
  name: string;
  /** Figma: true while a text layer's name follows its content */
  autoRename?: boolean;
  children?: readonly TreeNode[];
}

export interface FieldMatch<T> {
  node: T;
  field: FieldKey;
}

export interface PersonGroup<T> {
  /** Container that holds this person's layers, or null for loose text layers */
  scope: T | null;
  texts: FieldMatch<T>[];
}

type Matcher = (layerName: string) => FieldKey | null;

function matchText<T extends TreeNode>(node: T, match: Matcher): FieldMatch<T> | null {
  if (node.type !== "TEXT" || node.autoRename === true) return null;
  const field = match(node.name);
  return field ? { node, field } : null;
}

function matchesInside<T extends TreeNode>(node: T, match: Matcher): FieldMatch<T>[] {
  const found: FieldMatch<T>[] = [];
  const visit = (current: T) => {
    const hit = matchText(current, match);
    if (hit) found.push(hit);
    for (const child of current.children ?? []) visit(child as T);
  };
  visit(node);
  return found;
}

function hasRepeatedField<T>(matches: FieldMatch<T>[]): boolean {
  const seen = new Set<FieldKey>();
  for (const { field } of matches) {
    if (seen.has(field)) return true;
    seen.add(field);
  }
  return false;
}

export function planFillByName<T extends TreeNode>(
  roots: readonly T[],
  match: Matcher
): PersonGroup<T>[] {
  const groups: PersonGroup<T>[] = [];

  const assignContainer = (container: T) => {
    const matches = matchesInside(container, match);
    if (matches.length === 0) return;

    if (!hasRepeatedField(matches)) {
      groups.push({ scope: container, texts: matches });
      return;
    }

    // Several people in here: split by child
    const looseTexts: FieldMatch<T>[] = [];
    for (const child of (container.children ?? []) as readonly T[]) {
      if (child.type === "TEXT") {
        const hit = matchText(child, match);
        if (hit) looseTexts.push(hit);
      } else {
        assignContainer(child);
      }
    }
    if (looseTexts.length === 0) return;
    if (hasRepeatedField(looseTexts)) {
      for (const text of looseTexts) groups.push({ scope: null, texts: [text] });
    } else {
      groups.push({ scope: null, texts: looseTexts });
    }
  };

  for (const root of roots) {
    if (root.type === "TEXT") {
      const hit = matchText(root, match);
      if (hit) groups.push({ scope: null, texts: [hit] });
    } else {
      assignContainer(root);
    }
  }

  return groups;
}
