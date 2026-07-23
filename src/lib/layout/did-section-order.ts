import { createSeededRandom, hashString } from "~/lib/did-random";

/** Returns a deterministically shuffled copy of a list for DID-based layouts. */
export function getDidSectionOrder<T>(did: string, sections: T[]): T[] {
  const random = createSeededRandom(hashString(`${did}:sections`));
  const orderedSections = [...sections];

  for (let index = orderedSections.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentSection = orderedSections[index];

    orderedSections[index] = orderedSections[swapIndex]!;
    orderedSections[swapIndex] = currentSection!;
  }

  return orderedSections;
}
