/** Creates a repeatable numeric seed from arbitrary DID-derived input. */
export function hashString(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) >>> 0;
  }

  return hash;
}

/** Returns deterministic pseudo-random values for visual generation. */
export function createSeededRandom(seed: number): () => number {
  let state = seed || 1;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}
