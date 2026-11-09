// Random numbers for all generated data.
// By default this is Math.random. withSeed() swaps in a seeded generator (mulberry32) for
// the duration of a callback, so the same seed gives the same users every time — in the
// canvas table, JSON, CSV and copies alike.

type Random = () => number;

let current: Random = Math.random;

/** A number in [0, 1), like Math.random */
export const rng: Random = () => current();

/** Text or number seed → 32-bit integer (FNV-1a) */
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Small, fast seeded generator with good spread for this use */
function mulberry32(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Runs fn with seeded randomness. An empty seed means "random each time".
 * Must be synchronous: generate everything inside fn, write to the canvas afterwards.
 */
export function withSeed<T>(seed: string | undefined | null, fn: () => T): T {
  const trimmed = (seed ?? "").trim();
  if (!trimmed) return fn();

  const previous = current;
  current = mulberry32(hashSeed(trimmed));
  try {
    return fn();
  } finally {
    current = previous;
  }
}
