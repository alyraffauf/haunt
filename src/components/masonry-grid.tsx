import type { ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";

const MASONRY_MEDIA_QUERY = "(min-width: 40rem)";

type MasonryGridProps = {
  children: ReactNode;
};

export function MasonryGrid({ children }: MasonryGridProps) {
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
        cards.forEach(clearCardPlacement);
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

      cards.forEach((card) => {
        const columnIndex = getShortestColumn(columnHeights);
        const rowSpan = getRowSpan(card, rowHeight, rowGap);

        card.style.gridColumnStart = String(columnIndex + 1);
        card.style.gridRowStart = String(columnHeights[columnIndex]! + 1);
        card.style.gridRowEnd = `span ${rowSpan}`;
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
  }, []);

  return (
    <div ref={gridRef} className="profile-grid mx-auto max-w-6xl">
      {children}
    </div>
  );
}

function clearCardPlacement(card: HTMLElement) {
  card.style.removeProperty("grid-column-start");
  card.style.removeProperty("grid-row-start");
  card.style.removeProperty("grid-row-end");
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
