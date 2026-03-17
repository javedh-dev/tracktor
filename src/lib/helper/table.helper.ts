import type { Column, Table, Updater } from '@tanstack/table-core';

export type VisiblePageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function applyUpdater<T>(updater: Updater<T>, current: T): T {
  if (typeof updater === 'function') {
    return (updater as (old: T) => T)(current);
  }

  return updater;
}

export function getVisiblePageItems<TData>(
  table: Table<TData>,
  maxVisiblePages = 7
): VisiblePageItem[] {
  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const pages: VisiblePageItem[] = [0];
  const rangeStart = Math.max(1, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 2, currentPage + 2);

  if (rangeStart > 1) {
    pages.push('ellipsis-start');
  }

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    pages.push(page);
  }

  if (rangeEnd < totalPages - 2) {
    pages.push('ellipsis-end');
  }

  pages.push(totalPages - 1);

  return pages;
}

export function getColumnDisplayName<TData>(column: Column<TData, unknown>): string {
  const headerContent = column.columnDef.header;

  if (typeof headerContent !== 'function') {
    return column.id;
  }

  try {
    const result = headerContent({} as never);

    if (result && typeof result === 'object' && 'props' in result) {
      return ((result as { props?: { label?: string } }).props?.label || column.id) as string;
    }
  } catch {
    return column.id;
  }

  return column.id;
}
