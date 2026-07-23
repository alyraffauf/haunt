import { createSeededRandom, hashString } from "~/lib/did-random";

// The DTCG schema makes the token output consumable by design-token tooling.
const DTCG_SCHEMA_URL =
  "https://www.designtokens.org/schemas/2025.10/format.json";

/** CSS-ready semantic colors for a dark profile theme. */
export type DidColorScheme = {
  background: string;
  card: string;
  border: string;
  accent: string;
};

/** A minimal DTCG color-token document for platform-specific exporters. */
export type DidDesignTokens = {
  $schema: string;
  color: {
    canvas: DidColorToken;
    surface: DidColorToken;
    divider: DidColorToken;
    accent: DidColorToken;
  };
};

type DidColorToken = {
  $type: "color";
  $value: {
    colorSpace: "srgb";
    components: [number, number, number];
    hex: string;
  };
};

type HslColor = {
  hue: number;
  saturation: number;
  lightness: number;
};

type GeneratedColors = {
  canvas: HslColor;
  surface: HslColor;
  divider: HslColor;
  accent: HslColor;
};

export type DidTheme = {
  css: DidColorScheme;
  tokens: DidDesignTokens;
};

/**
 * Creates a stable dark-pastel theme from an AT Protocol DID.
 *
 * The DID seeds the generator, so the output is varied across identities but
 * remains stable across requests. Consumers can use `css` directly or pass
 * `tokens` to a DTCG-compatible exporter.
 */
export function getDidTheme(did: string): DidTheme {
  const colors = generateColors(did);
  const css = {
    background: formatHsl(colors.canvas),
    card: formatHsl(colors.surface),
    border: formatHsl(colors.divider),
    accent: formatHsl(colors.accent),
  };

  return {
    css,
    tokens: {
      $schema: DTCG_SCHEMA_URL,
      color: {
        canvas: createColorToken(colors.canvas),
        surface: createColorToken(colors.surface),
        divider: createColorToken(colors.divider),
        accent: createColorToken(colors.accent),
      },
    },
  };
}

/** Returns only the CSS colors for consumers that do not need token metadata. */
export function getDidColorScheme(did: string): DidColorScheme {
  return getDidTheme(did).css;
}

function generateColors(did: string): GeneratedColors {
  // Keep every random value inside a hand-tuned range so arbitrary hues stay
  // readable as dark backgrounds and pleasant as pastel accents.
  const random = createSeededRandom(hashString(did));
  const hue = random() * 360;
  const backgroundSaturation = 20 + random() * 12;
  const backgroundLightness = 11 + random() * 6;
  const cardSaturation = backgroundSaturation + random() * 4;
  const cardLightness = backgroundLightness + 4 + random() * 3;

  return {
    canvas: {
      hue,
      saturation: backgroundSaturation,
      lightness: backgroundLightness,
    },
    surface: {
      hue,
      saturation: cardSaturation,
      lightness: cardLightness,
    },
    divider: {
      hue,
      saturation: 35 + random() * 20,
      lightness: 35 + random() * 12,
    },
    accent: {
      hue,
      saturation: 65 + random() * 20,
      lightness: 76 + random() * 10,
    },
  };
}

function createColorToken(color: HslColor): DidColorToken {
  const components = hslToRgb(color);

  return {
    $type: "color",
    $value: {
      colorSpace: "srgb",
      components,
      hex: rgbToHex(components),
    },
  };
}

function formatHsl(color: HslColor): string {
  return `hsl(${Math.round(color.hue)} ${Math.round(color.saturation)}% ${Math.round(color.lightness)}%)`;
}

function hslToRgb(color: HslColor): [number, number, number] {
  // DTCG tokens use normalized sRGB components, while the browser theme uses
  // HSL because it makes the generated lightness and saturation easy to tune.
  const saturation = color.saturation / 100;
  const lightness = color.lightness / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePart = color.hue / 60;
  const secondComponent = chroma * (1 - Math.abs((huePart % 2) - 1));
  const lightnessAdjustment = lightness - chroma / 2;
  const rgbByHue = getRgbByHue(huePart, chroma, secondComponent);

  return rgbByHue.map((component) => component + lightnessAdjustment) as [
    number,
    number,
    number,
  ];
}

function getRgbByHue(
  huePart: number,
  chroma: number,
  secondComponent: number,
): [number, number, number] {
  if (huePart < 1) return [chroma, secondComponent, 0];
  if (huePart < 2) return [secondComponent, chroma, 0];
  if (huePart < 3) return [0, chroma, secondComponent];
  if (huePart < 4) return [0, secondComponent, chroma];
  if (huePart < 5) return [secondComponent, 0, chroma];

  return [chroma, 0, secondComponent];
}

function rgbToHex(components: [number, number, number]): string {
  return `#${components
    .map((component) =>
      Math.round(component * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}
