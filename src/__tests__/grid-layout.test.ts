import { describe, expect, it } from 'vitest';
import {
  compactLayout,
  moveElement,
  resizeElement,
  type GridItem
} from '$lib/components/dashboard/grid-layout';
import { WIDGET_REGISTRY } from '$lib/components/dashboard/widget-registry';
import { DEFAULT_WIDGET_LAYOUT, widgetMinSize } from '$lib/domain/dashboard';

function item(id: string, colStart: number, rowStart: number, colSpan = 6, rowSpan = 4): GridItem {
  return { id, colStart, rowStart, colSpan, rowSpan };
}

function positions(items: GridItem[]): Record<string, [number, number]> {
  return Object.fromEntries(items.map((i) => [i.id, [i.colStart, i.rowStart]]));
}

describe('compactLayout', () => {
  it('pulls items up to close vertical gaps', () => {
    const items = [item('a', 1, 1), item('b', 1, 20)];
    expect(positions(compactLayout(items))).toEqual({ a: [1, 1], b: [1, 5] });
  });

  it('leaves items in separate columns at the top', () => {
    const items = [item('a', 1, 1), item('b', 7, 9)];
    expect(positions(compactLayout(items))).toEqual({ a: [1, 1], b: [7, 1] });
  });

  it('separates items that arrive overlapping', () => {
    const items = [item('a', 1, 1), item('b', 1, 1)];
    const packed = compactLayout(items);
    expect(packed.find((i) => i.id === 'b')!.rowStart).toBe(5);
  });
});

describe('moveElement', () => {
  it('swaps with the widget below instead of pushing it further down', () => {
    // The old compactor pinned the dragged widget then repacked everything else beneath it, so
    // dragging 'a' down shoved 'b' — which was already below — down again instead of swapping.
    const items = [item('a', 1, 1), item('b', 1, 5)];
    expect(positions(moveElement(items, 'a', 1, 5))).toEqual({ a: [1, 5], b: [1, 1] });
  });

  it('swaps with the widget above when dragging up', () => {
    const items = [item('a', 1, 1), item('b', 1, 5)];
    expect(positions(moveElement(items, 'b', 1, 1))).toEqual({ a: [1, 5], b: [1, 1] });
  });

  it('ignores a nudge too small to clear the neighbour', () => {
    const items = [item('a', 1, 1), item('b', 1, 5)];
    expect(positions(moveElement(items, 'a', 1, 3))).toEqual({ a: [1, 1], b: [1, 5] });
  });

  it('leaves untouched columns alone', () => {
    const items = [item('a', 1, 1), item('b', 7, 1), item('c', 1, 5)];
    expect(positions(moveElement(items, 'a', 1, 5))).toEqual({
      a: [1, 5],
      b: [7, 1],
      c: [1, 1]
    });
  });

  it('cascades displaced widgets down without dropping any', () => {
    const items = [item('a', 1, 1), item('b', 1, 5), item('c', 1, 9), item('d', 1, 13)];
    const moved = moveElement(items, 'd', 1, 1);
    const rows = moved.map((i) => i.rowStart).sort((x, y) => x - y);
    expect(rows).toEqual([1, 5, 9, 13]);
    expect(moved.find((i) => i.id === 'd')!.rowStart).toBe(1);
  });

  it('clamps a widget dragged past the right edge', () => {
    const items = [item('a', 1, 1)];
    expect(moveElement(items, 'a', 99, 1)[0].colStart).toBe(7);
  });
});

describe('resizeElement', () => {
  it('pushes the widget below down rather than lifting it above', () => {
    const items = [item('a', 1, 1), item('b', 1, 5)];
    expect(positions(resizeElement(items, 'a', 6, 8))).toEqual({ a: [1, 1], b: [1, 9] });
  });

  it('pulls neighbours back up when a widget shrinks', () => {
    const items = [item('a', 1, 1, 6, 8), item('b', 1, 9)];
    expect(positions(resizeElement(items, 'a', 6, 4))).toEqual({ a: [1, 1], b: [1, 5] });
  });

  it('clamps growth to the columns remaining to the right', () => {
    const items = [item('a', 7, 1)];
    expect(resizeElement(items, 'a', 12, 4)[0].colSpan).toBe(6);
  });

  it('refuses to shrink a widget below its own minimum', () => {
    const items = [item('a', 1, 1)];
    const resized = resizeElement(items, 'a', 1, 1, { minColSpan: 3, minRowSpan: 2 })[0];
    expect([resized.colSpan, resized.rowSpan]).toEqual([3, 2]);
  });

  it('lets the grid edge win over a minimum that cannot fit', () => {
    const items = [item('a', 11, 1, 2, 4)];
    expect(resizeElement(items, 'a', 1, 4, { minColSpan: 6, minRowSpan: 1 })[0].colSpan).toBe(2);
  });
});

describe('widgetMinSize', () => {
  it('keeps every registry default at or above its widget minimum', () => {
    for (const def of Object.values(WIDGET_REGISTRY)) {
      const { minColSpan, minRowSpan } = widgetMinSize(def.type);
      expect(def.defaultColSpan).toBeGreaterThanOrEqual(minColSpan);
      expect(def.defaultRowSpan).toBeGreaterThanOrEqual(minRowSpan);
    }
  });

  it('ships a default layout that already satisfies the minimums', () => {
    for (const layoutItem of DEFAULT_WIDGET_LAYOUT) {
      const { minColSpan, minRowSpan } = widgetMinSize(layoutItem.type);
      expect(layoutItem.colSpan).toBeGreaterThanOrEqual(minColSpan);
      expect(layoutItem.rowSpan).toBeGreaterThanOrEqual(minRowSpan);
    }
  });
});
