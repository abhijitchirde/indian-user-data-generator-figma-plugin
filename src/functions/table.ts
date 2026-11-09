// Draws a user table (see tableMatrix.ts for what goes where):
// - Figma Design, Slides, Buzz: auto-layout frames (a column of rows of cells), so text
//   wraps and every row is as tall as its tallest cell; data cells are tagged for Regenerate
// - FigJam: FigJam's own table
// Colors and fonts are the plugin's existing table style.

import { FIELD_META_BY_KEY } from "../fieldMeta";
import type { MatrixCell } from "../tableMatrix";
import { TABLE_FONT_LIGHT, TABLE_FONT_REGULAR } from "./fonts";
import { addRegenerateButton, newPersonId, tagTextField } from "./regenerate";
import { fitTable, TABLE_KEY } from "./tableLayout";

const HEADER_BG: RGB = { r: 0.858, g: 0.925, b: 1 };
const LABEL_BG: RGB = { r: 0.976, g: 0.984, b: 1 };
const DATA_BG: RGB = { r: 1, g: 1, b: 1 };
const BORDER: RGB = { r: 0.58, g: 0.698, b: 0.858 };
const TEXT: RGB = { r: 0.2, g: 0.2, b: 0.2 };

const solid = (color: RGB): SolidPaint[] => [{ type: "SOLID", color }];

const background = (cell: MatrixCell): RGB =>
  cell.kind === "data" ? DATA_BG : cell.kind === "label" ? LABEL_BG : HEADER_BG;

function createCell(cell: MatrixCell, width: number): FrameNode {
  const frame = figma.createFrame();
  frame.name = cell.kind === "data" ? FIELD_META_BY_KEY[cell.field].label : cell.text;
  frame.layoutMode = "VERTICAL";
  frame.resize(width, 24);
  frame.counterAxisSizingMode = "FIXED"; // column width
  frame.primaryAxisSizingMode = "AUTO"; // hug the text; fitted per row afterwards
  frame.primaryAxisAlignItems = "CENTER"; // vertically centered when the row is taller
  frame.paddingLeft = frame.paddingRight = 6;
  frame.paddingTop = frame.paddingBottom = 5;
  frame.fills = solid(background(cell));
  frame.strokes = solid(BORDER);
  frame.strokeWeight = 0.5;
  frame.strokeAlign = "CENTER";
  frame.clipsContent = false;

  const text = figma.createText();
  text.fontName = cell.kind === "data" ? TABLE_FONT_REGULAR : TABLE_FONT_LIGHT;
  text.fontSize = cell.kind === "data" ? 9 : 8;
  text.characters = cell.text;
  text.fills = solid(TEXT);
  text.name = frame.name;
  frame.appendChild(text);
  text.layoutAlign = "STRETCH"; // full cell width
  text.textAutoResize = "HEIGHT"; // wrap and grow downwards
  return frame;
}

function createRow(cells: MatrixCell[], widths: number[], name: string): FrameNode {
  const row = figma.createFrame();
  row.name = name;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "AUTO";
  row.counterAxisSizingMode = "AUTO";
  row.itemSpacing = 0;
  row.fills = [];
  row.clipsContent = false;
  cells.forEach((cell, i) => row.appendChild(createCell(cell, widths[i])));
  return row;
}

/** Auto-layout frame table. Fonts must be loaded (loadTableFonts). */
export function createFrameTable(
  matrix: MatrixCell[][],
  widths: number[],
  profDomain?: string
): FrameNode {
  const table = figma.createFrame();
  table.name = "Indian user data";
  table.layoutMode = "VERTICAL";
  table.primaryAxisSizingMode = "AUTO";
  table.counterAxisSizingMode = "AUTO";
  table.itemSpacing = 0;
  table.fills = [];
  table.clipsContent = false;
  table.setPluginData(TABLE_KEY, "1");

  // One id per user, so Regenerate gives each user a new, consistent person
  const personIds = new Map<number, string>();
  const personId = (user: number) => {
    if (!personIds.has(user)) personIds.set(user, newPersonId());
    return personIds.get(user);
  };

  matrix.forEach((cells, r) => {
    const row = createRow(cells, widths, r === 0 ? "Header" : cells[0].text);
    table.appendChild(row);
    cells.forEach((cell, c) => {
      if (cell.kind !== "data") return;
      const text = (row.children[c] as FrameNode).children[0] as TextNode;
      tagTextField(text, cell.field, profDomain, personId(cell.user));
    });
  });

  fitTable(table);
  addRegenerateButton(table);
  return table;
}

/** FigJam's native table (not tagged for Regenerate: table cells can't hold plugin data) */
export async function createFigJamTable(
  matrix: MatrixCell[][],
  widths: number[]
): Promise<TableNode> {
  const rows = matrix.length;
  const columns = matrix[0].length;
  const table = figma.createTable(rows, columns);
  table.name = "Indian user data";

  const loaded = new Set<string>();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const cell = table.cellAt(r, c);
      const font = cell.text.fontName;
      if (font !== figma.mixed && !loaded.has(`${font.family}/${font.style}`)) {
        await figma.loadFontAsync(font);
        loaded.add(`${font.family}/${font.style}`);
      }
      cell.text.characters = matrix[r][c].text;
      if (matrix[r][c].kind !== "data") cell.fills = solid(background(matrix[r][c]));
    }
  }
  widths.forEach((width, c) => table.resizeColumn(c, width));
  return table;
}
