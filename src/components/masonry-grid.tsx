import type { ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";

import { hashString } from "~/lib/did-random";

const MASONRY_MEDIA_QUERY = "(min-width: 40rem)";

type MasonryGridProps = {
  children: ReactNode;
  seed: string;
};

export function MasonryGrid({ children, seed }: MasonryGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const masonryGrid = gridRef.current;
    if (!masonryGrid) {
      return;
    }

    const gridElement: HTMLDivElement = masonryGrid;

    const mediaQuery = window.matchMedia(MASONRY_MEDIA_QUERY);
    let animationFrame = 0;

    function scheduleLayout() {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateLayout);
    }

    function updateLayout() {
      const cards = Array.from(gridElement.children) as HTMLElement[];

      if (!mediaQuery.matches) {
        gridElement.classList.remove("profile-grid-masonry");
        cards.forEach(clearCardLayout);
        return;
      }

      gridElement.classList.add("profile-grid-masonry");

      const styles = window.getComputedStyle(gridElement);
      const rowHeight = Number.parseFloat(styles.gridAutoRows);
      const rowGap = Number.parseFloat(styles.rowGap);
      const columnCount = getColumnCount(styles.gridTemplateColumns);

      if (!rowHeight || !columnCount) {
        return;
      }

      const columnHeights = Array<number>(columnCount).fill(0);

      cards.forEach((card, index) => {
        const columnIndex = getShortestColumn(columnHeights);

        card.style.gridColumnStart = String(columnIndex + 1);
        const rowSpan = getRowSpan(card, rowHeight, rowGap);

        card.style.gridRowStart = String(columnHeights[columnIndex]! + 1);
        card.style.gridRowEnd = `span ${rowSpan}`;
        setArtifactOffset(card, seed, index);
        columnHeights[columnIndex]! += rowSpan;
      });
    }

    const resizeObserver = new ResizeObserver(scheduleLayout);
    const mutationObserver = new MutationObserver(scheduleLayout);

    resizeObserver.observe(gridElement);
    mutationObserver.observe(gridElement, { childList: true });
    mediaQuery.addEventListener("change", scheduleLayout);
    scheduleLayout();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      mediaQuery.removeEventListener("change", scheduleLayout);
    };
  }, [seed]);

  return (
    <div ref={gridRef} className="profile-grid mx-auto max-w-6xl">
      {children}
    </div>
  );
}

function clearCardLayout(card: HTMLElement) {
  card.style.removeProperty("grid-column-start");
  card.style.removeProperty("grid-row-start");
  card.style.removeProperty("grid-row-end");
  card.style.removeProperty("--artifact-offset-x");
  card.style.removeProperty("--artifact-offset-y");
}

function setArtifactOffset(card: HTMLElement, seed: string, index: number) {
  const hash = hashString(`${seed}:artifact:${index}`);
  const horizontalOffset = (hash % 17) - 8;
  const verticalOffset = ((hash >>> 5) % 13) - 6;

  card.style.setProperty("--artifact-offset-x", `${horizontalOffset}px`);
  card.style.setProperty("--artifact-offset-y", `${verticalOffset}px`);
}

function getColumnCount(gridTemplateColumns: string): number {
  if (gridTemplateColumns === "none") {
    return 0;
  }

  return gridTemplateColumns.split(" ").length;
}

function getShortestColumn(columnHeights: number[]): number {
  return columnHeights.reduce(
    (shortestIndex, height, index) =>
      height < columnHeights[shortestIndex]! ? index : shortestIndex,
    0,
  );
}

function getRowSpan(
  card: HTMLElement,
  rowHeight: number,
  rowGap: number,
): number {
  return Math.ceil(
    (card.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap),
  );
}
