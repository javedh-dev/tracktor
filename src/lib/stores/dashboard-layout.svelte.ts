import { apiClient } from '$lib/helper/api.helper';
import {
  DEFAULT_WIDGET_LAYOUT,
  GRID_COLUMNS,
  widgetMinSize,
  WIDGET_TYPES,
  type WidgetColSpan,
  type WidgetLayoutItem,
  type WidgetRowSpan,
  type WidgetType
} from '$lib/domain/dashboard';
import { compactLayout } from '$lib/components/dashboard/grid-layout';

const SAVE_DEBOUNCE_MS = 600;

/** Grows anything below its widget's minimum, so old layouts don't render clipped. */
function applyMinSizes(items: WidgetLayoutItem[]): WidgetLayoutItem[] {
  return items.map((item) => {
    const { minColSpan, minRowSpan } = widgetMinSize(item.type);
    const colSpan = Math.max(item.colSpan, minColSpan);
    return {
      ...item,
      colSpan,
      rowSpan: Math.max(item.rowSpan, minRowSpan),
      colStart: Math.min(item.colStart, GRID_COLUMNS - colSpan + 1)
    };
  });
}

class DashboardLayoutStore {
  items = $state<WidgetLayoutItem[]>([]);
  loading = $state(false);
  saving = $state(false);
  error = $state<string | undefined>();

  private saveTimer: ReturnType<typeof setTimeout> | undefined;

  async fetchLayout() {
    this.loading = true;
    this.error = undefined;
    try {
      const { data: res } = await apiClient.get<{ success: boolean; data: WidgetLayoutItem[] }>(
        '/dashboard/layout'
      );
      const layout = res.success && res.data ? res.data : DEFAULT_WIDGET_LAYOUT;
      this.items = compactLayout(applyMinSizes(layout));
    } catch (err) {
      this.error = 'Failed to load dashboard layout';
      this.items = compactLayout(applyMinSizes(DEFAULT_WIDGET_LAYOUT));
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  private scheduleSave() {
    this.saving = true;
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.persist(), SAVE_DEBOUNCE_MS);
  }

  private async persist() {
    try {
      await apiClient.put('/dashboard/layout', $state.snapshot(this.items));
    } catch (err) {
      console.error('Failed to save dashboard layout', err);
    } finally {
      this.saving = false;
    }
  }

  get availableWidgetTypes(): WidgetType[] {
    const used = new Set(this.items.map((w) => w.type));
    return (Object.keys(WIDGET_TYPES) as WidgetType[]).filter((t) => !used.has(t));
  }

  addWidget(type: WidgetType, colSpan: WidgetColSpan = 6, rowSpan: WidgetRowSpan = 8) {
    const { minColSpan, minRowSpan } = widgetMinSize(type);
    const bottomRow = this.items.reduce((max, w) => Math.max(max, w.rowStart + w.rowSpan), 1);
    const items = [
      ...this.items.map((w) => ({ ...w })),
      {
        id: crypto.randomUUID(),
        type,
        colStart: 1,
        rowStart: bottomRow,
        colSpan: Math.max(colSpan, minColSpan),
        rowSpan: Math.max(rowSpan, minRowSpan)
      }
    ];
    this.items = compactLayout(items);
    this.scheduleSave();
  }

  removeWidget(id: string) {
    const items = this.items.filter((w) => w.id !== id).map((w) => ({ ...w }));
    this.items = compactLayout(items);
    this.scheduleSave();
  }

  resetToDefault() {
    this.items = compactLayout(applyMinSizes(DEFAULT_WIDGET_LAYOUT));
    this.scheduleSave();
  }

  /**
   * Accepts a layout already resolved by the grid engine (see `grid-layout.ts`). Called once per
   * drag/resize gesture, on drop — the grid keeps its own draft while the pointer is down.
   */
  commitLayout(items: WidgetLayoutItem[]) {
    this.items = items;
    this.scheduleSave();
  }
}

export const dashboardLayoutStore = new DashboardLayoutStore();
