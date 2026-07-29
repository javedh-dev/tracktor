import { getContext, setContext } from 'svelte';
import {
  GRID_COLUMNS,
  GRID_MAX_ROW_SPAN,
  widgetMinSize,
  type WidgetLayoutItem,
  type WidgetMinSize
} from '$lib/domain/dashboard';
import { clamp, ROW_UNIT_PX } from './widget-size';
import { moveElement, resizeElement, type GridRect } from './grid-layout';

export type GridMode = 'move' | 'resize';

/** Pixel geometry of the widget being dragged, relative to the grid's padding box. */
export interface FloatRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Rendered track geometry: `pitch` is one track plus one gap, i.e. the distance between track starts. */
export interface GridMetrics {
  colPitch: number;
  colGap: number;
  rowPitch: number;
  rowGap: number;
}

const EDGE_SCROLL_ZONE_PX = 80;
const EDGE_SCROLL_MAX_PX = 22;

function readMetrics(grid: HTMLElement): GridMetrics {
  const style = getComputedStyle(grid);
  const columns = style.gridTemplateColumns
    .split(' ')
    .map(parseFloat)
    .filter((width) => !Number.isNaN(width));
  const colGap = parseFloat(style.columnGap) || 0;
  const rowGap = parseFloat(style.rowGap) || 0;

  return {
    colGap,
    rowGap,
    colPitch: (columns[0] ?? grid.clientWidth / GRID_COLUMNS) + colGap,
    rowPitch: ROW_UNIT_PX + rowGap
  };
}

function findScroller(el: HTMLElement | undefined): HTMLElement {
  const fallback = (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
  for (let node = el?.parentElement; node; node = node.parentElement) {
    const overflowY = getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
  }
  return fallback;
}

/**
 * Drives pointer-driven move/resize for a widget grid. The widget being manipulated follows the
 * pointer in raw pixels while a snapped `draft` layout is recomputed from the committed layout on
 * every frame — the dragged item's rect within that draft is the dotted placeholder. Nothing reaches
 * the store until the pointer is released, so the live layout never churns mid-gesture.
 */
export class GridInteraction {
  #getItems: () => WidgetLayoutItem[];
  #commit: (items: WidgetLayoutItem[]) => void;

  gridEl = $state<HTMLElement | undefined>();
  /** Pointer interaction only applies at the 12-column breakpoint; below it the grid stacks. */
  enabled = $state(false);

  draft = $state<WidgetLayoutItem[] | null>(null);
  activeId = $state<string | null>(null);
  mode = $state<GridMode | null>(null);
  float = $state<FloatRect | null>(null);
  /** Track sizes captured at gesture start; also lets the placeholder be drawn in pixels. */
  metrics = $state<GridMetrics | null>(null);

  constructor(getItems: () => WidgetLayoutItem[], commit: (items: WidgetLayoutItem[]) => void) {
    this.#getItems = getItems;
    this.#commit = commit;
  }

  #minSize(item: WidgetLayoutItem): WidgetMinSize {
    return widgetMinSize(item.type);
  }

  /** Layout to render: the in-flight draft while dragging, otherwise the committed layout. */
  get items(): WidgetLayoutItem[] {
    return this.draft ?? this.#getItems();
  }

  get placeholder(): GridRect | null {
    if (!this.activeId || !this.draft) return null;
    return this.draft.find((item) => item.id === this.activeId) ?? null;
  }

  /**
   * The placeholder's rect in pixels. Drawing the outline as an absolutely-positioned box instead of
   * a grid-placed one keeps a *painted* element from re-flowing grid tracks on every snap step —
   * Safari doesn't reliably invalidate the area such an element vacates, which left a dashed ghost
   * at every width a shrinking widget passed through.
   */
  get placeholderRect(): FloatRect | null {
    const rect = this.placeholder;
    const metrics = this.metrics;
    if (!rect || !metrics) return null;

    return {
      left: (rect.colStart - 1) * metrics.colPitch,
      top: (rect.rowStart - 1) * metrics.rowPitch,
      width: rect.colSpan * metrics.colPitch - metrics.colGap,
      height: rect.rowSpan * metrics.rowPitch - metrics.rowGap
    };
  }

  isActive(id: string): boolean {
    return this.activeId === id;
  }

  #snapshot(): WidgetLayoutItem[] {
    return this.#getItems().map((item) => ({ ...item }));
  }

  start(mode: GridMode, id: string, event: PointerEvent, cardEl: HTMLElement): void {
    if (!this.enabled || this.activeId || event.button !== 0) return;

    const grid = this.gridEl;
    const source = this.#getItems().find((item) => item.id === id);
    if (!grid || !source) return;

    event.preventDefault();
    // The stat layout makes the whole card a drag handle, so the resize corner must not also
    // reach it. (The `activeId` guard above already covers this; this keeps it explicit.)
    event.stopPropagation();

    const metrics = readMetrics(grid);
    const gridBox = grid.getBoundingClientRect();
    const cardBox = cardEl.getBoundingClientRect();
    const origin: FloatRect = {
      left: cardBox.left - gridBox.left,
      top: cardBox.top - gridBox.top,
      width: cardBox.width,
      height: cardBox.height
    };
    // Where inside the card the pointer grabbed, so the card doesn't jump to the cursor.
    const grab = { x: event.clientX - cardBox.left, y: event.clientY - cardBox.top };
    const scroller = findScroller(grid);

    let pointerX = event.clientX;
    let pointerY = event.clientY;
    let frame = 0;

    this.activeId = id;
    this.mode = mode;
    this.float = { ...origin };
    this.metrics = metrics;
    this.draft = this.#snapshot();
    const bodyClass = mode === 'move' ? 'grid-moving' : 'grid-resizing';
    document.body.classList.add(bodyClass);

    // Capture on the grid — never the card, which goes `pointer-events: none` while it floats. This
    // guarantees the gesture terminates: without it, releasing outside the window drops `pointerup`
    // and the draft (and its placeholder) is stranded on screen until the next interaction.
    const pointerId = event.pointerId;
    try {
      grid.setPointerCapture(pointerId);
    } catch {
      // Capture is best-effort; the window listeners below still cover the common case.
    }

    const update = () => {
      // Re-read the box every frame so edge auto-scroll doesn't skew the mapping.
      const box = grid.getBoundingClientRect();

      if (mode === 'move') {
        const left = pointerX - box.left - grab.x;
        const top = pointerY - box.top - grab.y;
        this.float = { left, top, width: origin.width, height: origin.height };

        const colStart = clamp(
          Math.round(left / metrics.colPitch) + 1,
          1,
          GRID_COLUMNS - source.colSpan + 1
        );
        const rowStart = Math.max(1, Math.round(top / metrics.rowPitch) + 1);
        this.draft = moveElement(this.#snapshot(), id, colStart, rowStart);
        return;
      }

      const min = this.#minSize(source);
      const maxColSpan = GRID_COLUMNS - source.colStart + 1;
      const minColSpan = Math.min(min.minColSpan, maxColSpan);
      const minRowSpan = Math.min(min.minRowSpan, GRID_MAX_ROW_SPAN);

      // The pointer can't drag the ghost below the widget's floor either, so what you see while
      // resizing is always a size the widget will actually accept.
      const width = clamp(
        pointerX - box.left - origin.left,
        minColSpan * metrics.colPitch - metrics.colGap,
        maxColSpan * metrics.colPitch - metrics.colGap
      );
      const height = clamp(
        pointerY - box.top - origin.top,
        minRowSpan * metrics.rowPitch - metrics.rowGap,
        GRID_MAX_ROW_SPAN * metrics.rowPitch - metrics.rowGap
      );
      this.float = { left: origin.left, top: origin.top, width, height };

      const colSpan = Math.round((width + metrics.colGap) / metrics.colPitch);
      const rowSpan = Math.round((height + metrics.rowGap) / metrics.rowPitch);
      this.draft = resizeElement(this.#snapshot(), id, colSpan, rowSpan, min);
    };

    const autoScroll = () => {
      frame = requestAnimationFrame(autoScroll);

      const top = pointerY - EDGE_SCROLL_ZONE_PX;
      const bottom = pointerY - (window.innerHeight - EDGE_SCROLL_ZONE_PX);
      const delta =
        top < 0
          ? (top / EDGE_SCROLL_ZONE_PX) * EDGE_SCROLL_MAX_PX
          : bottom > 0
            ? (bottom / EDGE_SCROLL_ZONE_PX) * EDGE_SCROLL_MAX_PX
            : 0;
      if (delta === 0) return;

      const before = scroller.scrollTop;
      scroller.scrollTop = before + delta;
      if (scroller.scrollTop !== before) update();
    };

    const handleMove = (moveEvent: PointerEvent) => {
      pointerX = moveEvent.clientX;
      pointerY = moveEvent.clientY;
      update();
    };

    const finish = (commit: boolean) => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      window.removeEventListener('lostpointercapture', handleUp);
      window.removeEventListener('blur', handleCancel);
      window.removeEventListener('keydown', handleKey, true);
      document.body.classList.remove(bodyClass);
      if (grid.hasPointerCapture?.(pointerId)) grid.releasePointerCapture(pointerId);

      const next = this.draft;
      this.draft = null;
      this.activeId = null;
      this.mode = null;
      this.float = null;
      this.metrics = null;
      if (commit && next) this.#commit(next);
    };

    const handleUp = () => finish(true);
    const handleCancel = () => finish(false);
    const handleKey = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key !== 'Escape') return;
      keyEvent.preventDefault();
      finish(false);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    window.addEventListener('lostpointercapture', handleUp);
    window.addEventListener('blur', handleCancel);
    window.addEventListener('keydown', handleKey, true);
    frame = requestAnimationFrame(autoScroll);
  }

  /** Keyboard equivalent of dragging the widget by its handle. */
  nudgeMove(id: string, colDelta: number, rowDelta: number): void {
    const source = this.#getItems().find((item) => item.id === id);
    if (!source) return;
    this.#commit(
      moveElement(
        this.#snapshot(),
        id,
        source.colStart + colDelta,
        Math.max(1, source.rowStart + rowDelta)
      )
    );
  }

  /** Keyboard equivalent of dragging the resize handle. */
  nudgeResize(id: string, colDelta: number, rowDelta: number): void {
    const source = this.#getItems().find((item) => item.id === id);
    if (!source) return;
    this.#commit(
      resizeElement(
        this.#snapshot(),
        id,
        source.colSpan + colDelta,
        source.rowSpan + rowDelta,
        this.#minSize(source)
      )
    );
  }
}

const GRID_INTERACTION_KEY = Symbol('grid-interaction');

export function setGridInteraction(interaction: GridInteraction): GridInteraction {
  return setContext(GRID_INTERACTION_KEY, interaction);
}

export function getGridInteraction(): GridInteraction {
  const interaction = getContext<GridInteraction | undefined>(GRID_INTERACTION_KEY);
  if (!interaction) throw new Error('WidgetCard must be rendered inside DashboardGrid');
  return interaction;
}
