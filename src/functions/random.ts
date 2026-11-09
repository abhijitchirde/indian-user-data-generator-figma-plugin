// Random numbers for all generated data.
//
// By default this is Math.random. With a seed (the "Seed" field in "Create user sets"),
// every value gets its own seeded sequence, keyed by seed + user number + field:
// "demo|3|Email" is always the same email for user 3. So a seed gives the same users no
// matter which fields are ticked, how many users are asked for, or which profession
// domain is chosen (only the profession itself changes).
//
// Seed text → 32-bit number (FNV-1a hash) → mulberry32 generator.

type Random = () => number;

let current: Random = Math.random;

/** A number in [0, 1), like Math.random */
export const rng: Random = () => current();

/** Any text → 32-bit integer (FNV-1a) */
function hashText(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
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

/** "" for no seed; otherwise the seed without surrounding spaces */
export function normalizeSeed(seed: string | undefined | null): string {
  return (seed ?? "").trim();
}

/**
 * Runs fn with a seeded sequence for one value (e.g. key "demo|3|Email"), then restores
 * the previous generator, also after an error. Nested calls (a field reading the fields
 * it depends on) each get their own sequence. fn must be synchronous.
 */
export function withStream<T>(key: string, fn: () => T): T {
  const previous = current;
  current = mulberry32(hashText(key));
  try {
    return fn();
  } finally {
    current = previous;
  }
}
