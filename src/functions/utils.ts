//finding a number in range (incl low and high)
export function numBetween(low: number, high: number) {
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

// Table cells are created by the plugin, so they use Roboto (loaded by loadTableFonts)
export function setFont(currentNode: SceneNode) {
  if (currentNode.type === "TEXT") {
    currentNode.fontName = { family: "Roboto", style: "Regular" };
  }
}

export function setFontLight(currentNode: SceneNode) {
  if (currentNode.type === "TEXT") {
    currentNode.fontName = { family: "Roboto", style: "Light" };
  }
}
