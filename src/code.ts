//Made by Abhijit Chirde
//abhijitchirde.com

import {
  fieldForLayerName,
  FieldSelection,
  FIELDS_BY_KEY,
  generateRecords,
  isFieldKey,
  Person,
  recordsToCSV,
  recordsToTSV,
  selectedTableFields,
} from "./fields";
import { planFillByName } from "./functions/fillByName";
import { loadTableFonts, writeText, WriteTally } from "./functions/fonts";
import { centeredAt, findFreeSpot, Rect } from "./functions/placement";
import {
  addRegenerateButton,
  describeRegenerateResult,
  regenerateNodes,
  REGENERATE_COMMAND,
  newPersonId,
  tagPersonScope,
  tagTextField,
} from "./functions/regenerate";
import { createFigJamTable, createFrameTable } from "./functions/table";
import {
  ACTION_FILL_BY_NAME,
  ACTION_REGENERATE,
  QUICK_ACTION_KEY,
  quickActionSuggestions,
} from "./quickActions";
import { buildTableMatrix, columnWidths, isTableLayout, TableLayout } from "./tableMatrix";

// Upper limits for one request. The canvas table creates ~2 nodes per cell,
// so it is capped much lower than the file exports.
const MAX_TABLE_USERS = 200;
const MAX_EXPORT_USERS = 10000;

const THEME_PREF_KEY = "themePreference";
const UI_PREFS_KEY = "uiPreferences";

/** What to tell the user after an action. quiet: no toast needed inside the plugin window */
interface Outcome {
  message: string;
  quiet?: boolean;
}

// Quick actions (Ctrl/Cmd + /): suggestions while the user types the data type
figma.parameters.on("input", ({ query, result }) => {
  result.setSuggestions(quickActionSuggestions(query));
});

// Every launch: properties-panel "Regenerate data" button, a quick action, or the plugin window
figma.on("run", async ({ command, parameters }) => {
  if (command === REGENERATE_COMMAND) {
    const tally = await regenerateNodes(figma.currentPage.selection);
    figma.closePlugin(describeRegenerateResult(tally));
  } else if (parameters?.[QUICK_ACTION_KEY]) {
    const outcome = await runQuickAction(parameters[QUICK_ACTION_KEY]);
    figma.closePlugin(outcome.message);
  } else {
    // 700 fits the tallest group (Personal IDs) open in both tabs without scrolling.
    // themeColors adds a figma-light / figma-dark class to the UI's <html> (used by ui.css).
    figma.showUI(__html__, { width: 360, height: 700, themeColors: true });
    figma.ui.onmessage = handleMessage;
  }
});

async function runQuickAction(dataType: string): Promise<Outcome> {
  if (dataType === ACTION_FILL_BY_NAME) return fillByLayerNames();
  if (dataType === ACTION_REGENERATE) {
    return { message: describeRegenerateResult(await regenerateNodes(figma.currentPage.selection)) };
  }
  return fillSelection(dataType);
}

function notifyOutcome(outcome: Outcome) {
  if (!outcome.quiet) figma.notify(outcome.message, { timeout: 4000 });
}

/** Validates the requested number of users, notifying the user when it is invalid */
function parseUserCount(value: unknown, max: number): number | null {
  const count = Number(value);
  if (!Number.isFinite(count) || !Number.isInteger(count)) {
    figma.notify("Please enter a whole number", { timeout: 1500 });
    return null;
  }
  if (count <= 0) {
    figma.notify("Please enter a number greater than 0", { timeout: 1500 });
    return null;
  }
  if (count > max) {
    figma.notify(`You can generate up to ${max} users at a time`, {
      timeout: 2500,
    });
    return null;
  }
  return count;
}

//Receiving the button inputs from UI
async function handleMessage(msg) {
  // Theme preference (Auto / Light / Dark from the footer), saved per user
  if (msg.type === "get-theme-pref") {
    const value = await figma.clientStorage.getAsync(THEME_PREF_KEY);
    figma.ui.postMessage({ type: "theme-pref", value: value ?? "auto" });
  }

  if (msg.type === "set-theme-pref") {
    await figma.clientStorage.setAsync(THEME_PREF_KEY, msg.value);
  }

  // UI choices (tab, table fields, user count, domains); the UI validates what it gets
  if (msg.type === "get-ui-prefs") {
    const value = await figma.clientStorage.getAsync(UI_PREFS_KEY);
    figma.ui.postMessage({ type: "ui-prefs", value: value ?? null });
  }

  if (msg.type === "set-ui-prefs") {
    await figma.clientStorage.setAsync(UI_PREFS_KEY, msg.value);
  }

  if (msg.type === "generate-random") {
    notifyOutcome(await fillSelection(msg.data.inputValue, msg.data.profDomain));
  }

  if (msg.type === "fill-by-name") {
    notifyOutcome(await fillByLayerNames(msg.data?.profDomain));
  }

  if (msg.type === "regenerate-selection") {
    // Same as the "Regenerate data" button in the properties panel
    const tally = await regenerateNodes(figma.currentPage.selection);
    figma.notify(describeRegenerateResult(tally), { timeout: 3000 });
  }

  if (msg.type === "generate-table") {
    const count = parseUserCount(msg.data.noOfUsers, MAX_TABLE_USERS);
    if (count !== null) {
      const layout = isTableLayout(msg.data.layout) ? msg.data.layout : "columns";
      await generateTable(msg.data.chkData, count, msg.data.profDomain, layout);
    }
  }

  if (msg.type === "export-json") {
    const count = parseUserCount(msg.data.noOfUsers, MAX_EXPORT_USERS);
    if (count !== null) {
      const records = generateRecords(msg.data.chkData, count, {
        profDomain: msg.data.profDomain,
      });
      figma.ui.postMessage({ type: "json-export-ready", data: records });
      figma.notify(`JSON export for ${count} user(s) generated successfully.`, {
        timeout: 2500,
      });
    }
  }

  if (msg.type === "export-csv") {
    const count = parseUserCount(msg.data.noOfUsers, MAX_EXPORT_USERS);
    if (count !== null) {
      const records = generateRecords(msg.data.chkData, count, {
        profDomain: msg.data.profDomain,
      });
      figma.ui.postMessage({
        type: "csv-export-ready",
        data: recordsToCSV(msg.data.chkData, records),
      });
      figma.notify(`CSV export for ${count} user(s) generated successfully.`, {
        timeout: 2500,
      });
    }
  }

  // Copy to clipboard: the plugin generates the text, the UI copies it (only the UI
  // iframe can reach the clipboard) and reports back with "copy-done"
  if (msg.type === "copy-json" || msg.type === "copy-tsv") {
    const count = parseUserCount(msg.data.noOfUsers, MAX_EXPORT_USERS);
    if (count !== null) {
      const records = generateRecords(msg.data.chkData, count, {
        profDomain: msg.data.profDomain,
      });
      const isJSON = msg.type === "copy-json";
      figma.ui.postMessage({
        type: "copy-ready",
        text: isJSON
          ? JSON.stringify(records, null, 2)
          : recordsToTSV(msg.data.chkData, records),
        message: `Copied ${count} user${count === 1 ? "" : "s"} ${
          isJSON ? "as JSON" : "for spreadsheets"
        }`,
      });
    }
  }

  if (msg.type === "copy-done") {
    figma.notify(
      msg.ok
        ? msg.message
        : "Couldn't copy to the clipboard. Use the JSON or CSV download instead.",
      { timeout: 2500, error: !msg.ok }
    );
  }

  if (msg.type === "disclaimer") {
    figma.notify(
      "Everything here is made up for designs and testing. Names, IDs and addresses aren't real, and any match with a real person or business is a coincidence.",
      { timeout: 6000 }
    );
  }
}

/** Fills every selected text layer with a new value of the requested field */
async function fillSelection(fieldKey: unknown, profDomain?: string): Promise<Outcome> {
  if (!isFieldKey(fieldKey)) return { message: "Unknown data type" };

  const textNodes = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === "TEXT"
  );
  if (textNodes.length === 0) {
    return { message: "Please select text layers to add data" };
  }

  const tally = new WriteTally();
  for (const node of textNodes) {
    // Each layer is a different user
    const value = new Person({ profDomain }).get(fieldKey);
    const status = await writeText(node, value);
    tally.add(status);
    if (status !== "failed") tagTextField(node, fieldKey, profDomain);
  }

  // Inside the plugin window the filled layers speak for themselves; only notes get a toast
  const notes = tally.notes();
  const n = tally.updated;
  return {
    message: `Filled ${n} layer${n === 1 ? "" : "s"} with ${FIELDS_BY_KEY[fieldKey].label}.${notes}`,
    quiet: !notes,
  };
}

/**
 * Fills text layers whose names match a field ("Email", "Phone", "PAN"...).
 * Each selected frame/card is one person; containers holding several cards
 * are split so every card gets its own person (see fillByName.ts).
 */
async function fillByLayerNames(profDomain?: string): Promise<Outcome> {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    return { message: "Select frames, cards or text layers to fill" };
  }

  const groups = planFillByName(selection, fieldForLayerName);
  if (groups.length === 0) {
    return {
      message:
        'No text layers with matching names. Rename layers to e.g. "Email", "Phone" or "PAN".',
    };
  }

  const tally = new WriteTally();
  for (const group of groups) {
    const person = new Person({ profDomain });
    // Loose layers filled together share an id, so Regenerate keeps them one person
    const personId =
      !group.scope && group.texts.length > 1 ? newPersonId() : "";
    for (const { node, field } of group.texts) {
      const text = node as TextNode;
      const status = await writeText(text, person.get(field));
      tally.add(status);
      if (status !== "failed") tagTextField(text, field, profDomain, personId);
    }
    if (group.scope) {
      tagPersonScope(group.scope);
      addRegenerateButton(group.scope);
    }
  }

  const people = groups.length;
  return {
    message: `Filled ${tally.updated} layer${tally.updated === 1 ? "" : "s"} for ${people} ${
      people === 1 ? "person" : "people"
    }.${tally.notes()}`,
  };
}

// ============================================================================
// TABLE GENERATION
// ============================================================================

/**
 * Puts a new node in the middle of what the user is looking at, to the right of anything
 * already there (never on top of existing designs), selects it and scrolls to it.
 */
function placeAndReveal(node: SceneNode) {
  const obstacles = figma.currentPage.children
    .filter((child) => child !== node)
    .map((child) => child.absoluteBoundingBox)
    .filter((box): box is Rect => box !== null);
  const spot = findFreeSpot(
    centeredAt(figma.viewport.center, node.width, node.height),
    obstacles
  );
  node.x = spot.x;
  node.y = spot.y;
  figma.currentPage.selection = [node];

  // Center on it at the current zoom, or zoom out only if it's too big to fit
  const view = figma.viewport.bounds;
  if (spot.width <= view.width && spot.height <= view.height) {
    figma.viewport.center = { x: spot.x + spot.width / 2, y: spot.y + spot.height / 2 };
  } else {
    figma.viewport.scrollAndZoomIntoView([node]);
  }
}

/**
 * Adds a table of users to the canvas: users as columns (one row per field) or users as
 * rows. Frames with auto layout in Figma/Slides/Buzz, FigJam's own table in FigJam.
 */
async function generateTable(
  selection: FieldSelection,
  userCount: number,
  profDomain?: string,
  layout: TableLayout = "columns"
) {
  const fields = selectedTableFields(selection);
  if (fields.length === 0) {
    figma.notify("Please select at least one field", { timeout: 1500 });
    return;
  }

  const users = Array.from({ length: userCount }, () => {
    const person = new Person({ profDomain });
    return Object.fromEntries(fields.map((f) => [f.key, person.get(f.key)]));
  });
  const matrix = buildTableMatrix(fields, users, layout);
  const widths = columnWidths(fields, userCount, layout);

  let table: SceneNode;
  if (figma.editorType === "figjam") {
    table = await createFigJamTable(matrix, widths);
  } else {
    await loadTableFonts();
    table = createFrameTable(matrix, widths, profDomain);
  }
  figma.currentPage.appendChild(table);
  placeAndReveal(table);

  figma.notify(`Table of ${userCount} user${userCount === 1 ? "" : "s"} added.`, {
    timeout: 2500,
  });
}
