import { GRID_COLUMNS, GRID_MAX_ROW_SPAN } from '$lib/domain/dashboard';

/** Base pixel height of one row unit; a widget's rowSpan is this many units tall (before gaps). */
export const ROW_UNIT_PX = 28;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampColSpan(span: number): number {
  return clamp(Math.round(span), 1, GRID_COLUMNS);
}

function clampRowSpan(span: number): number {
  return clamp(Math.round(span), 1, GRID_MAX_ROW_SPAN);
}

function clampColStart(colStart: number, colSpan: number): number {
  return clamp(Math.round(colStart), 1, GRID_COLUMNS - clampColSpan(colSpan) + 1);
}

function clampRowStart(rowStart: number): number {
  return Math.max(1, Math.round(rowStart));
}

// CSS custom properties for a widget's grid rect; WidgetCard only wires these to grid-column/grid-row at the 12-col breakpoint since colStart/rowStart don't translate to the stacked mobile layout.
export function widgetGridVars(item: {
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}): string {
  return (
    `--wc-col-start: ${clampColStart(item.colStart, item.colSpan)}; ` +
    `--wc-col-span: ${clampColSpan(item.colSpan)}; ` +
    `--wc-row-start: ${clampRowStart(item.rowStart)}; ` +
    `--wc-row-span: ${clampRowSpan(item.rowSpan)};`
  );
}
