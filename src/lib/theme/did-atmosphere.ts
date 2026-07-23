import { createSeededRandom, hashString } from "~/lib/did-random";

export type DidAtmosphere = {
  backgroundImage: string;
};

/** Builds a stable, CSS-only space backdrop from a DID. */
export function getDidAtmosphere(did: string): DidAtmosphere {
  const random = createSeededRandom(hashString(`${did}:atmosphere`));
  const hue = random() * 360;
  const secondHue = (hue + 80 + random() * 100) % 360;
  const firstGlow = createGlowPosition(random);
  const secondGlow = createGlowPosition(random);
  const stars = createStars(random);

  return {
    backgroundImage: [
      `radial-gradient(circle at ${firstGlow.x}% ${firstGlow.y}%, hsl(${hue} 80% 65% / 0.18), transparent ${firstGlow.size}%)`,
      `radial-gradient(circle at ${secondGlow.x}% ${secondGlow.y}%, hsl(${secondHue} 80% 65% / 0.14), transparent ${secondGlow.size}%)`,
      ...stars,
    ].join(",\n"),
  };
}

function createGlowPosition(random: () => number): {
  x: number;
  y: number;
  size: number;
} {
  return {
    x: Math.round(random() * 100),
    y: Math.round(random() * 100),
    size: Math.round(24 + random() * 20),
  };
}

function createStars(random: () => number): string[] {
  return Array.from({ length: 14 }, () => {
    const x = Math.round(random() * 100);
    const y = Math.round(random() * 100);
    const opacity = (0.25 + random() * 0.5).toFixed(2);

    return `radial-gradient(circle at ${x}% ${y}%, hsl(0 0% 100% / ${opacity}) 0 1px, transparent 1.5px)`;
  });
}
