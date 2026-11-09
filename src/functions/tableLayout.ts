// Row heights for user tables made of frames.
// Each cell hugs its text; then every cell in a row is set to the tallest cell's height,
// so long values (addresses) wrap instead of overflowing and borders stay aligned.
// Used when a table is created and again after "Regenerate" changes its text.

/** Plugin data on the table frame, so Regenerate can find and re-fit it */
export const TABLE_KEY = "userTable";

const frames = (node: FrameNode) =>
  node.children.filter((child): child is FrameNode => child.type === "FRAME");

export function fitRow(row: FrameNode) {
  const cells = frames(row);
  if (cells.length === 0) return;
  for (const cell of cells) cell.primaryAxisSizingMode = "AUTO"; // hug the text
  const height = Math.max(...cells.map((cell) => cell.height));
  for (const cell of cells) {
    cell.primaryAxisSizingMode = "FIXED";
    cell.resize(cell.width, height);
  }
}

export function fitTable(table: FrameNode) {
  for (const row of frames(table)) fitRow(row);
}

/** The user table a layer belongs to, or null */
export function findTable(node: BaseNode): FrameNode | null {
  let current: BaseNode | null = node.parent;
  while (current && current.type !== "PAGE" && current.type !== "DOCUMENT") {
    if (current.type === "FRAME" && current.getPluginData(TABLE_KEY) === "1") return current;
    current = current.parent;
  }
  return null;
}
