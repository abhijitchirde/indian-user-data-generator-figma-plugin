// Where to put a new table on the canvas: centered in the current view, and moved to the
// right of anything already there, so it never lands on top of existing designs.
// Pure (plain rectangles), so it can be unit-tested.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Space kept between the new table and existing layers */
export const PLACEMENT_GAP = 80;

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function grow(rect: Rect, by: number): Rect {
  return { x: rect.x - by, y: rect.y - by, width: rect.width + 2 * by, height: rect.height + 2 * by };
}

/** A rectangle of the given size centered on a point (whole pixels) */
export function centeredAt(center: { x: number; y: number }, width: number, height: number): Rect {
  return { x: Math.round(center.x - width / 2), y: Math.round(center.y - height / 2), width, height };
}

/**
 * Starting from `start`, moves right past every layer it would overlap (keeping `gap`
 * around existing layers) until the spot is free. Only moves horizontally, so the table
 * stays at the height the user was looking at.
 */
export function findFreeSpot(start: Rect, obstacles: Rect[], gap = PLACEMENT_GAP): Rect {
  const spot = { ...start };
  // Each step moves past at least one obstacle, so this ends within obstacles.length steps
  for (let step = 0; step <= obstacles.length; step++) {
    const hits = obstacles.filter((o) => overlaps(spot, grow(o, gap)));
    if (hits.length === 0) return spot;
    spot.x = Math.max(...hits.map((o) => o.x + o.width)) + gap;
  }
  return spot;
}

/** True if `inner` is completely inside `outer` */
export function isInside(inner: Rect, outer: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}
