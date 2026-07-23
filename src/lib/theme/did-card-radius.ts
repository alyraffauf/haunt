import { hashString } from "~/lib/did-random";

const MAX_CARD_RADIUS_PX = 24;

/** Returns a stable, deliberately modest card radius for a DID. */
export function getDidCardRadius(did: string): string {
  const radius = hashString(`${did}:card-radius`) % (MAX_CARD_RADIUS_PX + 1);

  return `${radius}px`;
}
