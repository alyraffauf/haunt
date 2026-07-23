import type { CSSProperties } from "react";

import { hashString } from "~/lib/did-random";

type HauntSigilProps = {
  className?: string;
  color?: string;
  seed: string;
};

type SigilNode = {
  x: number;
  y: number;
};

export function HauntSigil({ seed, color, className = "" }: HauntSigilProps) {
  const pattern = getHauntSigilPattern(seed);

  return (
    <svg
      className={`haunt-sigil ${className}`}
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={{ "--sigil-color": color ?? pattern.color } as CSSProperties}
    >
      <circle cx="60" cy="60" r="51" strokeDasharray={pattern.dashArray} />
      <circle cx="60" cy="60" r="39" />
      <path d={createPolygonPath(pattern.nodes)} />
      <path d={createSpokePath(pattern.nodes)} />
      <circle className="haunt-sigil-node" cx="60" cy="60" r="8" />
      {pattern.nodes.map((node, index) => (
        <circle
          key={`${node.x}-${node.y}`}
          className="haunt-sigil-node"
          cx={node.x}
          cy={node.y}
          r={index % 2 === 0 ? 3.5 : 2.5}
        />
      ))}
    </svg>
  );
}

function getHauntSigilPattern(seed: string) {
  const hash = hashString(seed);
  const hue = 190 + (hash % 35);
  const nodeCount = 3 + (hash % 4);
  const phase = ((hash >>> 5) % 360) * (Math.PI / 180);

  return {
    color: `hsl(${hue} 38% 76%)`,
    dashArray: `${4 + (hash % 8)} ${3 + ((hash >>> 3) % 8)}`,
    nodes: createNodes(seed, nodeCount, phase),
  };
}

function createNodes(
  seed: string,
  nodeCount: number,
  phase: number,
): SigilNode[] {
  return Array.from({ length: nodeCount }, (_, index) => {
    const nodeHash = hashString(`${seed}:${index}`);
    const angle = phase + (index / nodeCount) * Math.PI * 2;
    const radius = 27 + (nodeHash % 10);

    return {
      x: roundCoordinate(60 + Math.cos(angle) * radius),
      y: roundCoordinate(60 + Math.sin(angle) * radius),
    };
  });
}

function createPolygonPath(nodes: SigilNode[]): string {
  const [firstNode, ...remainingNodes] = nodes;
  if (!firstNode) {
    return "";
  }

  return `M${firstNode.x} ${firstNode.y}${remainingNodes
    .map((node) => `L${node.x} ${node.y}`)
    .join("")}Z`;
}

function createSpokePath(nodes: SigilNode[]): string {
  return nodes.map((node) => `M60 60L${node.x} ${node.y}`).join("");
}

function roundCoordinate(value: number): number {
  return Math.round(value * 10) / 10;
}
