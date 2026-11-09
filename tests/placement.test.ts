import { describe, expect, test } from "@jest/globals";
import { centeredAt, findFreeSpot, isInside, PLACEMENT_GAP, Rect } from "../src/functions/placement";

const rect = (x: number, y: number, width: number, height: number): Rect => ({ x, y, width, height });

describe("centeredAt", () => {
  test("centers the table on the view's center, whole pixels", () => {
    expect(centeredAt({ x: 500, y: 300 }, 213, 100)).toEqual(rect(394, 250, 213, 100));
  });
});

describe("findFreeSpot", () => {
  const table = rect(0, 0, 400, 300);

  test("an empty page keeps the centered spot", () => {
    expect(findFreeSpot(table, [])).toEqual(table);
  });

  test("layers elsewhere don't move the table", () => {
    expect(findFreeSpot(table, [rect(2000, 2000, 100, 100), rect(-900, 0, 100, 100)])).toEqual(table);
  });

  test("a layer in the way: the table goes to its right, with a gap", () => {
    const frame = rect(100, 50, 600, 400);
    expect(findFreeSpot(table, [frame])).toEqual(rect(700 + PLACEMENT_GAP, 0, 400, 300));
  });

  test("a layer just closer than the gap also counts as in the way", () => {
    const frame = rect(400 + PLACEMENT_GAP - 1, 0, 100, 100); // 79px to the right of the table
    expect(findFreeSpot(table, [frame]).x).toBe(400 + PLACEMENT_GAP - 1 + 100 + PLACEMENT_GAP);
  });

  test("keeps moving right past a row of screens", () => {
    // Three 375-wide screens side by side with 100px between them, all at the table's height
    const screens = [rect(-100, 0, 375, 800), rect(375, 0, 375, 800), rect(850, 0, 375, 800)];
    expect(findFreeSpot(table, screens).x).toBe(850 + 375 + PLACEMENT_GAP);
  });

  test("stays at the same height (only moves right)", () => {
    const spot = findFreeSpot(rect(0, 1234, 400, 300), [rect(0, 1200, 500, 500)]);
    expect(spot.y).toBe(1234);
  });

  test("never overlaps any layer afterwards", () => {
    const layers = Array.from({ length: 40 }, (_, i) =>
      rect((i * 137) % 1500 - 300, (i * 71) % 900 - 200, 50 + (i * 31) % 400, 40 + (i * 17) % 300)
    );
    const spot = findFreeSpot(rect(200, 100, 600, 400), layers);
    for (const layer of layers) {
      const clear =
        spot.x >= layer.x + layer.width + PLACEMENT_GAP ||
        spot.x + spot.width + PLACEMENT_GAP <= layer.x ||
        spot.y >= layer.y + layer.height + PLACEMENT_GAP ||
        spot.y + spot.height + PLACEMENT_GAP <= layer.y;
      expect(clear).toBe(true);
    }
  });
});

describe("isInside", () => {
  const view = rect(0, 0, 1000, 800);
  test("fully visible vs partly outside", () => {
    expect(isInside(rect(100, 100, 300, 300), view)).toBe(true);
    expect(isInside(rect(800, 100, 300, 300), view)).toBe(false);
  });
});
