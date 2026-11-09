//Made by Abhijit Chirde
//abhijitchirde.com

import {
  fieldForLayerName,
  FieldSelection,
  generateRecords,
  isFieldKey,
  Person,
  recordsToCSV,
  selectedTableFields,
} from "./fields";
import { planFillByName } from "./functions/fillByName";
import { loadTableFonts, writeText, WriteTally } from "./functions/fonts";
import {
  addRegenerateButton,
  describeRegenerateResult,
  regenerateNodes,
  REGENERATE_COMMAND,
  tagPersonScope,
  tagTextField,
} from "./functions/regenerate";
import { setFont, setFontLight } from "./functions/utils";

// Upper limits for one request. The canvas table creates ~2 nodes per cell,
// so it is capped much lower than the file exports.
const MAX_TABLE_USERS = 200;
const MAX_EXPORT_USERS = 10000;

var generateTableLabelWidth = 78;
var generateTableDataWidth = 275;
var generateTableCellHeight = 26;
var generateTableHeaderHeight = 16;

if (figma.command === REGENERATE_COMMAND) {
  // Launched from the "Regenerate data" button in the properties panel: no UI
  regenerateNodes(figma.currentPage.selection).then((tally) =>
    figma.closePlugin(describeRegenerateResult(tally))
  );
} else {
  //Show UI on figma canvas
  figma.showUI(__html__, { width: 360, height: 620 });
  figma.ui.onmessage = handleMessage;
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
  if (msg.type === "get-theme") {
    // Send current Figma theme to UI
    // Figma and Slides use light theme, FigJam and Buzz use dark theme
    const isLightTheme =
      figma.editorType === "figma" || figma.editorType === "slides";
    figma.ui.postMessage({
      type: "theme-changed",
      theme: isLightTheme ? "light" : "dark",
    });
  }

  if (msg.type === "generate-random") {
    await fillSelection(msg.data.inputValue, msg.data.profDomain);
  }

  if (msg.type === "fill-by-name") {
    await fillByLayerNames(msg.data?.profDomain);
  }

  if (msg.type === "regenerate-selection") {
    // Same as the "Regenerate data" button in the properties panel
    const tally = await regenerateNodes(figma.currentPage.selection);
    figma.notify(describeRegenerateResult(tally), { timeout: 3000 });
  }

  if (msg.type === "generate-table") {
    const count = parseUserCount(msg.data.noOfUsers, MAX_TABLE_USERS);
    if (count !== null) {
      await generateTable(msg.data.chkData, count, msg.data.profDomain);
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

  if (msg.type === "disclaimer") {
    figma.notify(
      "This plugin generates sample user data offline. Any resemblances to real world entities are pure unintentional coincidences.",
      { timeout: 4000 }
    );
  }
}

/** Fills every selected text layer with a new value of the requested field */
async function fillSelection(fieldKey: unknown, profDomain?: string) {
  if (!isFieldKey(fieldKey)) return;

  const textNodes = figma.currentPage.selection.filter(
    (node): node is TextNode => node.type === "TEXT"
  );
  if (textNodes.length === 0) {
    figma.notify("Please select text layers to add data", { timeout: 1500 });
    return;
  }

  const tally = new WriteTally();
  for (const node of textNodes) {
    // Each layer is a different user
    const value = new Person({ profDomain }).get(fieldKey);
    const status = await writeText(node, value);
    tally.add(status);
    if (status !== "failed") tagTextField(node, fieldKey, profDomain);
  }

  const notes = tally.notes();
  if (notes) figma.notify(notes.trim(), { timeout: 4000 });
}

/**
 * Fills text layers whose names match a field ("Email", "Phone", "PAN"...).
 * Each selected frame/card is one person; containers holding several cards
 * are split so every card gets its own person (see fillByName.ts).
 */
async function fillByLayerNames(profDomain?: string) {
  const selection = figma.currentPage.selection;
  if (selection.length === 0) {
    figma.notify("Select frames, cards or text layers to fill", {
      timeout: 2000,
    });
    return;
  }

  const groups = planFillByName(selection, fieldForLayerName);
  if (groups.length === 0) {
    figma.notify(
      'No text layers with matching names. Rename layers to e.g. "Email", "Phone" or "PAN".',
      { timeout: 4000 }
    );
    return;
  }

  const tally = new WriteTally();
  for (const group of groups) {
    const person = new Person({ profDomain });
    for (const { node, field } of group.texts) {
      const text = node as TextNode;
      const status = await writeText(text, person.get(field));
      tally.add(status);
      if (status !== "failed") tagTextField(text, field, profDomain);
    }
    if (group.scope) {
      tagPersonScope(group.scope);
      addRegenerateButton(group.scope);
    }
  }

  const people = groups.length;
  figma.notify(
    `Filled ${tally.updated} layer${tally.updated === 1 ? "" : "s"} for ${people} ${
      people === 1 ? "person" : "people"
    }.${tally.notes()}`,
    { timeout: 3000 }
  );
}

// ============================================================================
// TABLE GENERATION
// ============================================================================

/**
 * Creates a table cell with text content
 * @param text - The text content to display in the cell
 * @param frameFormatter - Function to format the frame (e.g., formatLabelFrame, formatContentFrame)
 * @param textFormatter - Function to format the text (e.g., formatLabelText, formatContentText)
 * @returns The cell frame and its text layer
 */
function createTableCell(
  text: string,
  frameFormatter: (frame: FrameNode) => void,
  textFormatter: (text: TextNode) => void
): { frame: FrameNode; text: TextNode } {
  const cellFrame = figma.createFrame();
  frameFormatter(cellFrame);

  const cellText = figma.createText();
  setFont(cellText);
  cellText.characters = text;
  textFormatter(cellText);

  cellFrame.appendChild(cellText);
  return { frame: cellFrame, text: cellText };
}

/**
 * Creates a header cell for the table
 * @param text - Header text content
 * @param isLabelHeader - If true, formats as label header, otherwise as user header
 */
function createHeaderCell(text: string, isLabelHeader: boolean): FrameNode {
  if (isLabelHeader) {
    return createTableCell(text, formatLabelHeaderFrame, formatLabelHeaderText)
      .frame;
  }
  return createTableCell(text, formatUserHeaderFrame, formatUserHeaderText)
    .frame;
}

/**
 * Creates the label column section with all field labels
 * @returns Object with labelSection frame and its calculated height
 */
function createLabelSection(selection: FieldSelection): {
  section: FrameNode;
  height: number;
} {
  const labelSection = figma.createFrame();
  labelSection.layoutMode = "VERTICAL";
  labelSection.itemSpacing = 0;
  labelSection.name = "Labels";

  let sectionHeight = 0;

  // Add header cell for labels column
  labelSection.appendChild(createHeaderCell("Details", true));
  sectionHeight += generateTableHeaderHeight;

  for (const field of selectedTableFields(selection)) {
    labelSection.appendChild(
      createTableCell(field.label, formatLabelFrame, formatLabelText).frame
    );
    sectionHeight += generateTableCellHeight;
  }

  // Resize and remove autolayout before adding to parent
  labelSection.resize(generateTableLabelWidth, sectionHeight);
  labelSection.layoutMode = "NONE";

  return { section: labelSection, height: sectionHeight };
}

/**
 * Creates a data column for one user. The column is tagged as one person,
 * so "Regenerate data" replaces it with a new, internally consistent user.
 */
function createDataSection(
  userIndex: number,
  person: Person,
  selection: FieldSelection,
  sectionHeight: number
): FrameNode {
  const dataSection = figma.createFrame();
  dataSection.layoutMode = "VERTICAL";
  dataSection.itemSpacing = 0;
  dataSection.name = `User ${userIndex}`;
  tagPersonScope(dataSection);

  // Add header cell for user column
  dataSection.appendChild(createHeaderCell(`User ${userIndex}`, false));

  for (const field of selectedTableFields(selection)) {
    const cell = createTableCell(
      person.get(field.key),
      formatContentFrame,
      formatContentText
    );
    cell.text.name = field.label;
    tagTextField(cell.text, field.key, person.options.profDomain);
    dataSection.appendChild(cell.frame);
  }

  // Resize and remove autolayout before adding to parent
  dataSection.resize(generateTableDataWidth, sectionHeight);
  dataSection.layoutMode = "NONE";

  return dataSection;
}

/**
 * Generates a table with one label column and one column per user,
 * and adds it to the canvas.
 */
async function generateTable(
  selection: FieldSelection,
  userCount: number,
  profDomain?: string
) {
  if (selectedTableFields(selection).length === 0) {
    figma.notify("Please select at least one field", { timeout: 1500 });
    return;
  }

  await loadTableFonts();

  // Adjust data column width based on whether addresses are included
  generateTableDataWidth =
    selection.RurAddressValue || selection.UrbAddressValue ? 275 : 135;

  // Create main table container frame
  const tableFrame = figma.createFrame();
  tableFrame.layoutMode = "HORIZONTAL";
  tableFrame.itemSpacing = 0;
  tableFrame.name = "Indian user data";
  let tableFrameWidth = 0;

  const { section: labelSection, height: tableFrameHeight } =
    createLabelSection(selection);
  tableFrame.appendChild(labelSection);
  tableFrameWidth += generateTableLabelWidth;

  for (let i = 1; i <= userCount; i++) {
    const person = new Person({ profDomain });
    tableFrame.appendChild(
      createDataSection(i, person, selection, tableFrameHeight)
    );
    tableFrameWidth += generateTableDataWidth;
  }

  // Finalize table frame dimensions and remove autolayout
  tableFrame.resize(tableFrameWidth, tableFrameHeight);
  tableFrame.layoutMode = "NONE";
  addRegenerateButton(tableFrame);

  // Add table to canvas and set viewport focus
  figma.currentPage.appendChild(tableFrame);
  figma.currentPage.selection = [tableFrame];
  figma.viewport.scrollAndZoomIntoView([tableFrame]);

  figma.notify(`Table of ${userCount} users generated successfully.`, {
    timeout: 2500,
  });
}

function formatLabelFrame(inputFrameNode) {
  inputFrameNode.resize(generateTableLabelWidth, generateTableCellHeight);
  inputFrameNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.976, g: 0.984, b: 1 },
      // color: { r: 0.96, g: 0.96, b: 0.96 },
    },
  ];
  inputFrameNode.strokes = [
    {
      type: "SOLID",
      color: { r: 0.58, g: 0.698, b: 0.858 },
      // color: { r: 0.6, g: 0.6, b: 0.6 },
    },
  ];
  inputFrameNode.strokeWeight = 0.25;
  inputFrameNode.strokeAlign = "CENTER";
}

function formatContentFrame(inputFrameNode) {
  inputFrameNode.resize(generateTableDataWidth, generateTableCellHeight);
  inputFrameNode.strokes = [
    {
      type: "SOLID",
      color: { r: 0.58, g: 0.698, b: 0.858 },
      // color: { r: 0.6, g: 0.6, b: 0.6},
    },
  ];
  inputFrameNode.strokeWeight = 0.25;
  inputFrameNode.strokeAlign = "CENTER";
}

function formatLabelHeaderFrame(inputFrameNode) {
  inputFrameNode.resize(generateTableLabelWidth, generateTableHeaderHeight);
  inputFrameNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.858, g: 0.925, b: 1 },
    },
  ];
  inputFrameNode.strokes = [
    {
      type: "SOLID",
      color: { r: 0.58, g: 0.698, b: 0.858 },
      // color: { r: 0.6, g: 0.6, b: 0.6 },
    },
  ];
  inputFrameNode.strokeWeight = 0.25;
  inputFrameNode.strokeAlign = "CENTER";
}

function formatUserHeaderFrame(inputFrameNode) {
  inputFrameNode.resize(generateTableDataWidth, generateTableHeaderHeight);
  inputFrameNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.858, g: 0.925, b: 1 },
    },
  ];
  inputFrameNode.strokes = [
    {
      type: "SOLID",
      // color: { r: 0.58, g: 0.698, b: 0.858 },
      color: { r: 0.6, g: 0.6, b: 0.6 },
    },
  ];
  inputFrameNode.strokeWeight = 0.25;
  inputFrameNode.strokeAlign = "CENTER";
}

function formatLabelText(inputTextNode) {
  setFontLight(inputTextNode);
  inputTextNode.fontSize = 8;
  inputTextNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.2, g: 0.2, b: 0.2 },
    },
  ];
  inputTextNode.x += 3;
  inputTextNode.resize(generateTableLabelWidth - 6, generateTableCellHeight);
  inputTextNode.textAlignHorizontal = "LEFT";
  inputTextNode.textAlignVertical = "CENTER";
}

function formatContentText(inputTextNode) {
  setFont(inputTextNode);
  inputTextNode.fontSize = 9;
  inputTextNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.2, g: 0.2, b: 0.2 },
    },
  ];
  inputTextNode.x += 4;
  inputTextNode.resize(generateTableDataWidth - 8, generateTableCellHeight);
  inputTextNode.textAlignHorizontal = "LEFT";
  inputTextNode.textAlignVertical = "CENTER";
}

function formatLabelHeaderText(inputTextNode) {
  setFontLight(inputTextNode);
  inputTextNode.fontSize = 8;
  inputTextNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.2, g: 0.2, b: 0.2 },
    },
  ];
  inputTextNode.x += 3;
  inputTextNode.resize(generateTableLabelWidth - 6, generateTableHeaderHeight);
  inputTextNode.textAlignHorizontal = "LEFT";
  inputTextNode.textAlignVertical = "CENTER";
}

function formatUserHeaderText(inputTextNode) {
  setFontLight(inputTextNode);
  inputTextNode.fontSize = 8;
  inputTextNode.fills = [
    {
      type: "SOLID",
      color: { r: 0.2, g: 0.2, b: 0.2 },
    },
  ];
  inputTextNode.x += 4;
  inputTextNode.resize(generateTableDataWidth - 8, generateTableHeaderHeight);
  inputTextNode.textAlignHorizontal = "LEFT";
  inputTextNode.textAlignVertical = "CENTER";
}
