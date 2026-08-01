import type { Component } from 'svelte';
import type { WidgetColSpan, WidgetRowSpan, WidgetType } from '$lib/domain/dashboard';
import FleetStatWidget from './widgets/FleetStatWidget.svelte';
import ExpenseBreakdownWidget from './widgets/ExpenseBreakdownWidget.svelte';
import MonthlyExpenseTrendWidget from './widgets/MonthlyExpenseTrendWidget.svelte';
import VehicleLeaderboardWidget from './widgets/VehicleLeaderboardWidget.svelte';
import FleetFuelTrendWidget from './widgets/FleetFuelTrendWidget.svelte';
import StatusDonutWidget from './widgets/StatusDonutWidget.svelte';
import VehicleHealthWidget from './widgets/VehicleHealthWidget.svelte';
import UpcomingRemindersWidget from './widgets/UpcomingRemindersWidget.svelte';
import VehicleQuickListWidget from './widgets/VehicleQuickListWidget.svelte';
import RecentActivityWidget from './widgets/RecentActivityWidget.svelte';
import CalendarWidget from './widgets/CalendarWidget.svelte';
import Car from '@lucide/svelte/icons/car';
import Route from '@lucide/svelte/icons/route';
import Fuel from '@lucide/svelte/icons/fuel';
import DollarSign from '@lucide/svelte/icons/dollar-sign';
import CircleGauge from '@lucide/svelte/icons/circle-gauge';

interface WidgetDefinition {
  type: WidgetType;
  title: string;
  description: string;
  component: Component<any>;
  extraProps?: Record<string, unknown>;
  defaultColSpan: WidgetColSpan;
  defaultRowSpan: WidgetRowSpan;
  /** Only stat-style widgets set these — WidgetCard renders the icon in its header when present. */
  icon?: Component<{ class?: string }>;
  iconColor?: string;
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetDefinition> = {
  'stat-vehicle-count': {
    type: 'stat-vehicle-count',
    title: 'Total Vehicles',
    description: 'Number of vehicles in your garage',
    component: FleetStatWidget,
    extraProps: { metric: 'vehicle-count' },
    defaultColSpan: 3,
    defaultRowSpan: 4,
    icon: Car,
    iconColor: 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-500/30'
  },
  'stat-total-distance': {
    type: 'stat-total-distance',
    title: 'Total Distance',
    description: 'Distance driven across the whole fleet',
    component: FleetStatWidget,
    extraProps: { metric: 'total-distance' },
    defaultColSpan: 3,
    defaultRowSpan: 4,
    icon: Route,
    iconColor: 'bg-gradient-to-br from-violet-400 to-violet-600 shadow-violet-500/30'
  },
  'stat-fuel-used': {
    type: 'stat-fuel-used',
    title: 'Total Fuel Used',
    description: 'Fuel consumed across the whole fleet',
    component: FleetStatWidget,
    extraProps: { metric: 'fuel-used' },
    defaultColSpan: 3,
    defaultRowSpan: 4,
    icon: Fuel,
    iconColor: 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30'
  },
  'stat-total-expenses': {
    type: 'stat-total-expenses',
    title: 'Total Expenses',
    description: 'Fuel, maintenance and insurance spend combined',
    component: FleetStatWidget,
    extraProps: { metric: 'total-expenses' },
    defaultColSpan: 3,
    defaultRowSpan: 4,
    icon: DollarSign,
    iconColor: 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30'
  },
  'stat-cost-per-distance': {
    type: 'stat-cost-per-distance',
    title: 'Cost / Distance',
    description: 'Overall running cost per unit distance',
    component: FleetStatWidget,
    extraProps: { metric: 'cost-per-distance' },
    defaultColSpan: 3,
    defaultRowSpan: 4,
    icon: CircleGauge,
    iconColor: 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/30'
  },
  'expense-breakdown-donut': {
    type: 'expense-breakdown-donut',
    title: 'Expenses by Category',
    description: 'Fuel vs. maintenance vs. insurance spend',
    component: ExpenseBreakdownWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'monthly-expense-trend': {
    type: 'monthly-expense-trend',
    title: 'Monthly Expense Trend',
    description: 'Last 12 months of spend by category',
    component: MonthlyExpenseTrendWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'cost-by-vehicle-leaderboard': {
    type: 'cost-by-vehicle-leaderboard',
    title: 'Cost by Vehicle',
    description: 'Which vehicles cost the most to run',
    component: VehicleLeaderboardWidget,
    extraProps: { metric: 'cost' },
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'fleet-fuel-trend': {
    type: 'fleet-fuel-trend',
    title: 'Fleet Fuel Trend',
    description: 'Daily fuel usage across the fleet',
    component: FleetFuelTrendWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'efficiency-leaderboard': {
    type: 'efficiency-leaderboard',
    title: 'Efficiency Leaderboard',
    description: 'Vehicles ranked by fuel efficiency',
    component: VehicleLeaderboardWidget,
    extraProps: { metric: 'efficiency' },
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'pucc-status-donut': {
    type: 'pucc-status-donut',
    title: 'PUC Status',
    description: 'Pollution certificate status across the fleet',
    component: StatusDonutWidget,
    extraProps: { metric: 'pucc' },
    defaultColSpan: 6,
    defaultRowSpan: 6
  },
  'insurance-status-donut': {
    type: 'insurance-status-donut',
    title: 'Insurance Status',
    description: 'Insurance policy status across the fleet',
    component: StatusDonutWidget,
    extraProps: { metric: 'insurance' },
    defaultColSpan: 6,
    defaultRowSpan: 6
  },
  'vehicle-health-distribution': {
    type: 'vehicle-health-distribution',
    title: 'Vehicle Health',
    description: 'Overall good/attention/needs-action breakdown',
    component: VehicleHealthWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'upcoming-reminders-list': {
    type: 'upcoming-reminders-list',
    title: 'Upcoming Reminders',
    description: 'Reminders coming due soon',
    component: UpcomingRemindersWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'vehicle-quick-list': {
    type: 'vehicle-quick-list',
    title: 'My Vehicles',
    description: 'Quick access to your vehicles',
    component: VehicleQuickListWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'recent-activity-feed': {
    type: 'recent-activity-feed',
    title: 'Recent Activity',
    description: 'Latest fuel and maintenance logs across the fleet',
    component: RecentActivityWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'activity-calendar': {
    type: 'activity-calendar',
    title: 'Activity Calendar',
    description: 'Upcoming reminders and past fuel/maintenance activity by date',
    component: CalendarWidget,
    defaultColSpan: 4,
    defaultRowSpan: 10
  }
};
