import { readFile, writeFile } from "node:fs/promises";

import { Resvg } from "@resvg/resvg-js";
import satori from "satori";

const IMAGE_WIDTH = 1200;
const IMAGE_HEIGHT = 630;
const font = await readFile("scripts/space-mono.ttf");

const svg = await satori(
  <div
    style={{
      alignItems: "center",
      background: "#10090d",
      color: "#e8ddcc",
      display: "flex",
      height: "100%",
      overflow: "hidden",
      padding: "76px 92px",
      position: "relative",
      width: "100%",
    }}
  >
    <div
      style={{
        background: "#35101f",
        borderRadius: "999px",
        height: "720px",
        opacity: 0.68,
        position: "absolute",
        right: "-180px",
        top: "-290px",
        width: "720px",
      }}
    />
    <div style={{ display: "flex", flexDirection: "column", width: "620px" }}>
      <div
        style={{
          color: "#a98e8e",
          display: "flex",
          fontSize: "20px",
          letterSpacing: "4px",
          textTransform: "uppercase",
        }}
      >
        An atmosphere compendium
      </div>
      <div
        style={{
          display: "flex",
          fontSize: "86px",
          fontWeight: 650,
          letterSpacing: "-5px",
          lineHeight: 1,
          marginTop: "24px",
        }}
      >
        haunt.at
      </div>
      {/* <div
        style={{
          color: "#c4afa8",
          display: "flex",
          fontSize: "28px",
          lineHeight: 1.35,
          marginTop: "34px",
        }}
      >
        Visit a presence on the AT Protocol.
      </div> */}
    </div>
    <Sigil />
  </div>,
  {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    fonts: [{ name: "Space Mono", data: font, weight: 400, style: "normal" }],
  },
);

const png = new Resvg(svg, {
  fitTo: { mode: "width", value: IMAGE_WIDTH },
}).render();

await writeFile("public/og.png", png.asPng());

function Sigil() {
  return (
    <svg
      width="286"
      height="286"
      viewBox="0 0 120 120"
      fill="none"
      stroke="#9cc6d1"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <circle cx="60" cy="60" r="51" strokeDasharray="10 7" />
      <circle cx="60" cy="60" r="39" />
      <path d="M60 19 91 37v36L60 101 29 73V37Z" />
      <path d="M60 31v58M35 45l50 30M85 45 35 75" />
      <circle cx="60" cy="60" r="8" fill="#9cc6d1" />
      <circle cx="60" cy="19" r="3" fill="#9cc6d1" />
      <circle cx="91" cy="73" r="3" fill="#9cc6d1" />
      <circle cx="29" cy="73" r="3" fill="#9cc6d1" />
    </svg>
  );
}
