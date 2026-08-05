import { GRID_COLUMNS, GRID_MAX_ROW_SPAN } from '$lib/domain/dashboard';
import { clamp } from './widget-size';

export interface GridRect {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}

export type GridItem = GridRect & { id: string };

function overlaps(a: GridItem, b: GridItem): boolean {
  return (
    a.id !== b.id &&
    a.colStart < b.colStart + b.colSpan &&
    a.colStart + a.colSpan > b.colStart &&
    a.rowStart < b.rowStart + b.rowSpan &&
    a.rowStart + a.rowSpan > b.rowStart
  );
}

function byPosition(a: GridItem, b: GridItem): number {
  return a.rowStart - b.rowStart || a.colStart - b.colStart;
}

function collidesAt(items: GridItem[], item: GridItem, rowStart: number): boolean {
  const probe = { ...item, rowStart };
  return items.some((other) => overlaps(other, probe));
}

// Vertical gravity: walk items in reading order and settle each one at the highest row it can reach
// without touching anything already settled. Items are only ever compared against items placed
// before them, so a single pass both closes gaps and resolves leftover overlap.
export function compactLayout<T extends GridItem>(items: T[]): T[] {
  const settled: T[] = [];

  for (const item of [...items].sort(byPosition)) {
    let rowStart = item.rowStart;
    while (collidesAt(settled, item, rowStart)) rowStart += 1;
    while (rowStart > 1 && !collidesAt(settled, item, rowStart - 1)) rowStart -= 1;
    item.rowStart = rowStart;
    settled.push(item);
  }

  return items;
}

// Clears space for `target` by displacing whatever it now overlaps. A collider first tries the gap
// the target just vacated (directly above it), which is what makes dragging one widget onto another
// read as a swap; otherwise it drops below the target and cascades into whatever it hits in turn.
function displaceColliders<T extends GridItem>(
  items: T[],
  target: T,
  handled: Set<string>,
  options: { movingUp: boolean; allowTuck: boolean }
): void {
  const colliders = items.filter((item) => overlaps(item, target)).sort(byPosition);
  // Resolve the nearest collider in the direction of travel first so cascades run away from the target.
  if (options.movingUp) colliders.reverse();

  for (const collider of colliders) {
    if (handled.has(collider.id)) continue;
    handled.add(collider.id);

    const tuckedRow = target.rowStart - collider.rowSpan;
    if (options.allowTuck && tuckedRow >= 1 && !collidesAt(items, collider, tuckedRow)) {
      collider.rowStart = tuckedRow;
      continue;
    }

    collider.rowStart = target.rowStart + target.rowSpan;
    displaceColliders(items, collider, handled, options);
  }
}

/** Drops the widget at (colStart, rowStart), pushing others out of the way, then applies gravity. */
export function moveElement<T extends GridItem>(
  items: T[],
  id: string,
  colStart: number,
  rowStart: number
): T[] {
  const target = items.find((item) => item.id === id);
  if (!target) return items;

  const movingUp = rowStart < target.rowStart;
  target.colStart = clamp(colStart, 1, GRID_COLUMNS - target.colSpan + 1);
  target.rowStart = Math.max(1, rowStart);

  displaceColliders(items, target, new Set([id]), { movingUp, allowTuck: true });
  return compactLayout(items);
}

/**
 * Resizes the widget from its top-left anchor, pushing others down, then applies gravity.
 * `min` is the widget's own floor; it wins over the pointer but not over the grid's right edge.
 */
export function resizeElement<T extends GridItem>(
  items: T[],
  id: string,
  colSpan: number,
  rowSpan: number,
  min: { minColSpan: number; minRowSpan: number } = { minColSpan: 1, minRowSpan: 1 }
): T[] {
  const target = items.find((item) => item.id === id);
  if (!target) return items;

  const maxColSpan = GRID_COLUMNS - target.colStart + 1;
  target.colSpan = clamp(colSpan, Math.min(min.minColSpan, maxColSpan), maxColSpan);
  target.rowSpan = clamp(rowSpan, Math.min(min.minRowSpan, GRID_MAX_ROW_SPAN), GRID_MAX_ROW_SPAN);

  // Growing a widget must never lift its neighbours above it, so no tucking here.
  displaceColliders(items, target, new Set([id]), { movingUp: false, allowTuck: false });
  return compactLayout(items);
}
