import { z } from 'zod';
import type { Vehicle } from './vehicle';

export interface StatusBucket {
  valid: number;
  expiringSoon: number;
  expired: number;
  notAvailable: number;
}

export interface VehicleSummary {
  id: string;
  make: string;
  model: string;
  licensePlate: string | null;
  image: string | null;
  odometer: number;
  fuelType: Vehicle['fuelType'];
  totalDistance: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalInsuranceCost: number;
  totalExpenses: number;
  avgMileage: number | null;
  costPerDistance: number | null;
  puccStatus: 'valid' | 'expiring_soon' | 'expired' | 'not_available';
  insuranceStatus: 'valid' | 'expiring_soon' | 'expired' | 'not_available';
  healthStatus: 'good' | 'attention' | 'needs_action';
}

export interface UpcomingReminder {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string | null;
  type: string;
  note: string | null;
  dueDate: string;
  daysUntilDue: number;
}

export interface ActivityEntry {
  id: string;
  type: 'fuel' | 'maintenance';
  vehicleId: string;
  vehicleName: string;
  date: string;
  description: string;
  cost: number;
}

export interface MonthlyExpensePoint {
  month: string; // YYYY-MM
  fuel: number;
  maintenance: number;
  insurance: number;
  total: number;
}

export interface DashboardSummary {
  fleet: {
    totalVehicles: number;
    totalDistance: number;
    totalFuelUsed: number;
    totalExpenses: number;
    costPerDistance: number | null;
  };
  expenses: {
    breakdown: { fuel: number; maintenance: number; insurance: number };
    monthlyTrend: MonthlyExpensePoint[];
  };
  fuel: {
    dailyTrend: Array<{ date: string; fuelAmount: number }>;
  };
  compliance: {
    pucc: StatusBucket;
    insurance: StatusBucket;
    vehicleHealth: { good: number; attention: number; needsAction: number };
    upcomingReminders: UpcomingReminder[];
  };
  vehicles: VehicleSummary[];
  activity: ActivityEntry[];
}

export const WIDGET_TYPES = {
  'stat-vehicle-count': 'stat-vehicle-count',
  'stat-total-distance': 'stat-total-distance',
  'stat-fuel-used': 'stat-fuel-used',
  'stat-total-expenses': 'stat-total-expenses',
  'stat-cost-per-distance': 'stat-cost-per-distance',
  'expense-breakdown-donut': 'expense-breakdown-donut',
  'monthly-expense-trend': 'monthly-expense-trend',
  'cost-by-vehicle-leaderboard': 'cost-by-vehicle-leaderboard',
  'fleet-fuel-trend': 'fleet-fuel-trend',
  'efficiency-leaderboard': 'efficiency-leaderboard',
  'pucc-status-donut': 'pucc-status-donut',
  'insurance-status-donut': 'insurance-status-donut',
  'vehicle-health-distribution': 'vehicle-health-distribution',
  'upcoming-reminders-list': 'upcoming-reminders-list',
  'vehicle-quick-list': 'vehicle-quick-list',
  'recent-activity-feed': 'recent-activity-feed',
  'activity-calendar': 'activity-calendar'
} as const;

export type WidgetType = keyof typeof WIDGET_TYPES;

const widgetTypeOptions = Object.keys(WIDGET_TYPES) as [WidgetType, ...WidgetType[]];

// Widgets have an explicit (colStart, rowStart) position plus a (colSpan, rowSpan) size in a 12-col grid; every move/resize/remove recompacts the layout (see grid-compaction.ts).
export const GRID_COLUMNS = 12;
export const GRID_MAX_ROW_SPAN = 12;

export type WidgetColSpan = number;
export type WidgetRowSpan = number;

export interface WidgetLayoutItem {
  id: string;
  type: WidgetType;
  colStart: number;
  rowStart: number;
  colSpan: WidgetColSpan;
  rowSpan: WidgetRowSpan;
}

const widgetLayoutItemSchema = z.object({
  id: z.string(),
  type: z.enum(widgetTypeOptions),
  colStart: z.number().int().min(1).max(GRID_COLUMNS),
  rowStart: z.number().int().min(1),
  colSpan: z.number().int().min(1).max(GRID_COLUMNS),
  rowSpan: z.number().int().min(1).max(GRID_MAX_ROW_SPAN)
});

export const widgetLayoutSchema = z.array(widgetLayoutItemSchema).max(32);

/**
 * Smallest rect a widget stays legible in. Enforced when resizing, when adding, and when reading a
 * persisted layout back — so a layout saved before a widget's minimum changed heals on load rather
 * than rendering clipped. One row unit is 28px plus the 16px grid gap, so N rows ≈ 44N − 16 px.
 */
export interface WidgetMinSize {
  minColSpan: number;
  minRowSpan: number;
}

const DEFAULT_MIN_SIZE: WidgetMinSize = { minColSpan: 2, minRowSpan: 3 };

const WIDGET_MIN_SIZES: Partial<Record<WidgetType, WidgetMinSize>> = {
  // Label over a single number, laid out beside the icon. Legible down to 2 rows (72px); 3 columns
  // is what the longest label ("Total Fuel Used") needs beside the icon before it starts eliding.
  'stat-vehicle-count': { minColSpan: 3, minRowSpan: 2 },
  'stat-total-distance': { minColSpan: 3, minRowSpan: 2 },
  'stat-fuel-used': { minColSpan: 3, minRowSpan: 2 },
  'stat-total-expenses': { minColSpan: 3, minRowSpan: 2 },
  'stat-cost-per-distance': { minColSpan: 3, minRowSpan: 2 },
  // Ring plus legend.
  'expense-breakdown-donut': { minColSpan: 3, minRowSpan: 6 },
  'pucc-status-donut': { minColSpan: 3, minRowSpan: 6 },
  'insurance-status-donut': { minColSpan: 3, minRowSpan: 6 },
  'vehicle-health-distribution': { minColSpan: 3, minRowSpan: 6 },
  // Plot area plus a rotated x-axis.
  'monthly-expense-trend': { minColSpan: 4, minRowSpan: 6 },
  'fleet-fuel-trend': { minColSpan: 4, minRowSpan: 6 },
  // Scrolling lists stay usable at a couple of visible rows.
  'cost-by-vehicle-leaderboard': { minColSpan: 3, minRowSpan: 4 },
  'efficiency-leaderboard': { minColSpan: 3, minRowSpan: 4 },
  'upcoming-reminders-list': { minColSpan: 3, minRowSpan: 4 },
  'vehicle-quick-list': { minColSpan: 3, minRowSpan: 4 },
  'recent-activity-feed': { minColSpan: 3, minRowSpan: 4 },
  // Month grid (7 cols) plus a per-date event list below it.
  'activity-calendar': { minColSpan: 4, minRowSpan: 8 }
};

export function widgetMinSize(type: WidgetType): WidgetMinSize {
  return WIDGET_MIN_SIZES[type] ?? DEFAULT_MIN_SIZE;
}

export const DEFAULT_WIDGET_LAYOUT: WidgetLayoutItem[] = [
  { id: 'default-1', type: 'stat-vehicle-count', colStart: 1, rowStart: 1, colSpan: 3, rowSpan: 4 },
  {
    id: 'default-2',
    type: 'stat-total-distance',
    colStart: 4,
    rowStart: 1,
    colSpan: 3,
    rowSpan: 4
  },
  { id: 'default-3', type: 'stat-fuel-used', colStart: 7, rowStart: 1, colSpan: 3, rowSpan: 4 },
  {
    id: 'default-4',
    type: 'stat-total-expenses',
    colStart: 10,
    rowStart: 1,
    colSpan: 3,
    rowSpan: 4
  },
  {
    id: 'default-5',
    type: 'fleet-fuel-trend',
    colStart: 1,
    rowStart: 5,
    colSpan: 9,
    rowSpan: 8
  },
  {
    id: 'default-6',
    type: 'expense-breakdown-donut',
    colStart: 1,
    rowStart: 13,
    colSpan: 6,
    rowSpan: 8
  },
  {
    id: 'default-7',
    type: 'vehicle-health-distribution',
    colStart: 7,
    rowStart: 13,
    colSpan: 6,
    rowSpan: 8
  },
  {
    id: 'default-8',
    type: 'vehicle-quick-list',
    colStart: 1,
    rowStart: 21,
    colSpan: 9,
    rowSpan: 8
  },
  {
    id: 'default-9',
    type: 'pucc-status-donut',
    colStart: 1,
    rowStart: 29,
    colSpan: 6,
    rowSpan: 6
  },
  {
    id: 'default-10',
    type: 'upcoming-reminders-list',
    colStart: 1,
    rowStart: 33,
    colSpan: 6,
    rowSpan: 8
  }
];
