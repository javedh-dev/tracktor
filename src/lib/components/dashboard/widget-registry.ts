import type { Component } from 'svelte';
import type { WidgetColSpan, WidgetRowSpan, WidgetType } from '$lib/domain/dashboard';
import { ACCENT } from '$lib/helper/accent-color.helper';
import FleetStatWidget from './widgets/FleetStatWidget.svelte';
import ExpenseBreakdownWidget from './widgets/ExpenseBreakdownWidget.svelte';
import MonthlyExpenseTrendWidget from './widgets/MonthlyExpenseTrendWidget.svelte';
import VehicleLeaderboardWidget from './widgets/VehicleLeaderboardWidget.svelte';
import FleetFuelTrendWidget from './widgets/FleetFuelTrendWidget.svelte';
import FuelConsumptionTrendWidget from './widgets/FuelConsumptionTrendWidget.svelte';
import MileageOverviewWidget from './widgets/MileageOverviewWidget.svelte';
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
import * as w from '$lib/paraglide/messages/_index.js';

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
    title: w.widget_total_vehicles(),
    description: w.widget_total_vehicles_description(),
    component: FleetStatWidget,
    extraProps: { metric: 'vehicle-count' },
    defaultColSpan: 3,
    defaultRowSpan: 2,
    icon: Car,
    iconColor: ACCENT.denim.gradient
  },
  'stat-total-distance': {
    type: 'stat-total-distance',
    title: w.widget_total_distance(),
    description: w.widget_total_distance_description(),
    component: FleetStatWidget,
    extraProps: { metric: 'total-distance' },
    defaultColSpan: 3,
    defaultRowSpan: 2,
    icon: Route,
    iconColor: ACCENT.plum.gradient
  },
  'stat-fuel-used': {
    type: 'stat-fuel-used',
    title: w.widget_total_fuel_used(),
    description: w.widget_total_fuel_used_description(),
    component: FleetStatWidget,
    extraProps: { metric: 'fuel-used' },
    defaultColSpan: 3,
    defaultRowSpan: 2,
    icon: Fuel,
    iconColor: ACCENT.moss.gradient
  },
  'stat-total-expenses': {
    type: 'stat-total-expenses',
    title: w.widget_total_expenses(),
    description: w.widget_total_expenses_description(),
    component: FleetStatWidget,
    extraProps: { metric: 'total-expenses' },
    defaultColSpan: 3,
    defaultRowSpan: 2,
    icon: DollarSign,
    iconColor: ACCENT.ochre.gradient
  },
  'stat-cost-per-distance': {
    type: 'stat-cost-per-distance',
    title: w.widget_cost_per_distance(),
    description: w.widget_cost_per_distance_description(),
    component: FleetStatWidget,
    extraProps: { metric: 'cost-per-distance' },
    defaultColSpan: 3,
    defaultRowSpan: 2,
    icon: CircleGauge,
    iconColor: ACCENT.clay.gradient
  },
  'expense-breakdown-donut': {
    type: 'expense-breakdown-donut',
    title: w.widget_expense_breakdown(),
    description: w.widget_expense_breakdown_description(),
    component: ExpenseBreakdownWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'monthly-expense-trend': {
    type: 'monthly-expense-trend',
    title: w.widget_monthly_expense_trend(),
    description: w.widget_monthly_expense_trend_description(),
    component: MonthlyExpenseTrendWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'cost-by-vehicle-leaderboard': {
    type: 'cost-by-vehicle-leaderboard',
    title: w.widget_cost_by_vehicle(),
    description: w.widget_cost_by_vehicle_description(),
    component: VehicleLeaderboardWidget,
    extraProps: { metric: 'cost' },
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'fleet-fuel-trend': {
    type: 'fleet-fuel-trend',
    title: w.widget_fleet_fuel_trend(),
    description: w.widget_fleet_fuel_trend_description(),
    component: FleetFuelTrendWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'fuel-consumption-trend': {
    type: 'fuel-consumption-trend',
    title: w.widget_fuel_consumption_trend(),
    description: w.widget_fuel_consumption_trend_description(),
    component: FuelConsumptionTrendWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'mileage-overview-trend': {
    type: 'mileage-overview-trend',
    title: w.widget_mileage_overview(),
    description: w.widget_mileage_overview_description(),
    component: MileageOverviewWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'efficiency-leaderboard': {
    type: 'efficiency-leaderboard',
    title: w.widget_efficiency_leaderboard(),
    description: w.widget_efficiency_leaderboard_description(),
    component: VehicleLeaderboardWidget,
    extraProps: { metric: 'efficiency' },
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'pucc-status-donut': {
    type: 'pucc-status-donut',
    title: w.widget_compliance_status(),
    description: w.widget_compliance_status_description(),
    component: StatusDonutWidget,
    extraProps: { metric: 'other' },
    defaultColSpan: 6,
    defaultRowSpan: 6
  },
  'insurance-status-donut': {
    type: 'insurance-status-donut',
    title: w.widget_insurance_status(),
    description: w.widget_insurance_status_description(),
    component: StatusDonutWidget,
    extraProps: { metric: 'insurance' },
    defaultColSpan: 6,
    defaultRowSpan: 6
  },
  'vehicle-health-distribution': {
    type: 'vehicle-health-distribution',
    title: w.widget_vehicle_health(),
    description: w.widget_vehicle_health_description(),
    component: VehicleHealthWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'upcoming-reminders-list': {
    type: 'upcoming-reminders-list',
    title: w.widget_upcoming_reminders(),
    description: w.widget_upcoming_reminders_description(),
    component: UpcomingRemindersWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'vehicle-quick-list': {
    type: 'vehicle-quick-list',
    title: w.widget_vehicles_quick_list(),
    description: w.widget_vehicles_quick_list_description(),
    component: VehicleQuickListWidget,
    defaultColSpan: 9,
    defaultRowSpan: 8
  },
  'recent-activity-feed': {
    type: 'recent-activity-feed',
    title: w.widget_recent_activity(),
    description: w.widget_recent_activity_description(),
    component: RecentActivityWidget,
    defaultColSpan: 6,
    defaultRowSpan: 8
  },
  'activity-calendar': {
    type: 'activity-calendar',
    title: w.widget_activity_calendar(),
    description: w.widget_activity_calendar_description(),
    component: CalendarWidget,
    defaultColSpan: 4,
    defaultRowSpan: 10
  }
};
