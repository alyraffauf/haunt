import type { ReactNode } from "react";
import { Children, useLayoutEffect, useState } from "react";

const THREE_COLUMN_BREAKPOINT = 64 * 16;
const TWO_COLUMN_BREAKPOINT = 40 * 16;

type MasonryGridProps = {
  children: ReactNode;
};

export function MasonryGrid({ children }: MasonryGridProps) {
  const columnCount = useColumnCount();
  const columns = Array.from({ length: columnCount }, () => [] as ReactNode[]);

  Children.toArray(children).forEach((artifact, index) => {
    const columnIndex = index % columnCount;
    columns[columnIndex]!.push(artifact);
  });

  return (
    <div
      className="profile-grid mx-auto max-w-6xl"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
      }}
    >
      {columns.map((artifacts, index) => (
        <div className="profile-grid-column" key={index}>
          {artifacts}
        </div>
      ))}
    </div>
  );
}

function useColumnCount(): number {
  const [columnCount, setColumnCount] = useState(getColumnCount);

  useLayoutEffect(() => {
    function updateColumnCount() {
      setColumnCount(getColumnCount());
    }

    window.addEventListener("resize", updateColumnCount);
    updateColumnCount();

    return () => window.removeEventListener("resize", updateColumnCount);
  }, []);

  return columnCount;
}

function getColumnCount(): number {
  if (window.innerWidth >= THREE_COLUMN_BREAKPOINT) {
    return 3;
  }

  if (window.innerWidth >= TWO_COLUMN_BREAKPOINT) {
    return 2;
  }

  return 1;
}
