// "Regenerate data" support.
//
// Every layer the plugin fills records which field it holds (plugin data), and gets
// relaunch data so Figma shows a "Regenerate data" button in the properties panel
// when it is selected (see `relaunchButtons` in manifest.json).
//
// Containers whose text layers belong to one user (e.g. a table column) are marked as a
// "person scope", so regenerating gives them a new user whose fields stay consistent.

import { FieldKey, isFieldKey, Person } from "../fields";
import { writeText, WriteTally } from "./fonts";

const FIELD_KEY = "field";
const PROF_DOMAIN_KEY = "profDomain";
const PERSON_SCOPE_KEY = "person";
// Shared by loose text layers filled as one person (no container to mark as the scope)
const PERSON_ID_KEY = "personId";

export const REGENERATE_COMMAND = "regenerate";

// Tagging is best-effort: some nodes (e.g. layers inside instances in some editors)
// or editors may not support plugin/relaunch data. Filling must never fail because of it.
function safely(action: () => void) {
  try {
    action();
  } catch (error) {
    console.warn("Indian User Data: could not tag layer", error);
  }
}

export function addRegenerateButton(node: SceneNode) {
  safely(() =>
    node.setRelaunchData({
      [REGENERATE_COMMAND]: "Replace with new Indian user data",
    })
  );
}

/**
 * Records which field a text layer holds and adds the "Regenerate data" button.
 * personId links loose layers that were filled as one person; "" clears an old link.
 */
export function tagTextField(
  node: TextNode,
  key: FieldKey,
  profDomain?: string,
  personId = ""
) {
  safely(() => {
    node.setPluginData(FIELD_KEY, key);
    node.setPluginData(PROF_DOMAIN_KEY, key === "Prof" ? profDomain ?? "Random" : "");
    node.setPluginData(PERSON_ID_KEY, personId);
  });
  addRegenerateButton(node);
}

/** A new id for a group of loose layers filled as one person */
export function newPersonId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Marks a container whose tagged text layers all describe the same user */
export function tagPersonScope(node: SceneNode) {
  safely(() => node.setPluginData(PERSON_SCOPE_KEY, "1"));
}

function isTaggedText(node: BaseNode): node is TextNode {
  return node.type === "TEXT" && isFieldKey(node.getPluginData(FIELD_KEY));
}

/** Nearest ancestor marked as a person scope, or null */
function findPersonScope(node: BaseNode): BaseNode | null {
  let current = node.parent;
  while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
    if (current.getPluginData(PERSON_SCOPE_KEY) === "1") return current;
    current = current.parent;
  }
  return null;
}

function collectTaggedText(selection: readonly SceneNode[]): TextNode[] {
  const found = new Set<TextNode>();
  for (const node of selection) {
    if (isTaggedText(node)) found.add(node);
    if ("findAll" in node) {
      for (const child of node.findAll(isTaggedText)) found.add(child as TextNode);
    }
  }
  return [...found];
}

/** Regenerates every tagged text layer in (or inside) the given selection */
export async function regenerateNodes(
  selection: readonly SceneNode[]
): Promise<WriteTally> {
  const people = new Map<string, Person>();
  const tally = new WriteTally();

  for (const node of collectTaggedText(selection)) {
    const key = node.getPluginData(FIELD_KEY) as FieldKey;
    // Same person if filled together: shared person id, else the nearest card/column
    const personId = node.getPluginData(PERSON_ID_KEY);
    const scopeId = personId
      ? `person:${personId}`
      : findPersonScope(node)?.id ?? node.id;

    let person = people.get(scopeId);
    if (!person) {
      person = new Person();
      people.set(scopeId, person);
    }
    if (key === "Prof") {
      person.options.profDomain = node.getPluginData(PROF_DOMAIN_KEY) || "Random";
    }

    tally.add(await writeText(node, person.get(key)));
  }

  return tally;
}

export function describeRegenerateResult(tally: WriteTally): string {
  if (tally.updated === 0 && tally.failed === 0) {
    return "Nothing to regenerate. Select layers filled by Indian User Data.";
  }
  const n = tally.updated;
  return `Regenerated ${n} layer${n === 1 ? "" : "s"}.${tally.notes()}`;
}
