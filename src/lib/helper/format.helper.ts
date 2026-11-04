import configs from '$stores/config.svelte';
import type { FormatConfig } from './date.helper';
import {
  formatDate as formatDatePure,
  formatDateForCalendar as formatDateForCalendarPure,
  parseDateForCalendar as parseDateForCalendarPure,
  parseDate as parseDatePure
} from './date.helper';
export type { FormatConfig };
export { isValidFormat, parseWithFormat } from './date.helper';
export { getTimezoneOptions, isValidTimezone } from './timezone.helper';
import {
  getCurrencySymbol as getCurrencySymbolPure,
  formatCurrency as formatCurrencyPure,
  formatDistance as formatDistancePure,
  getDistanceUnit as getDistanceUnitPure,
  getFuelUnit as getFuelUnitPure,
  formatFuel as formatFuelPure,
  getMileageUnit as getMileageUnitPure,
  formatMileage as formatMileagePure
} from './unit.helper';

export const formatDate = (date: Date | string) => formatDatePure(date, configs);
export const formatDateForCalendar = (date: import('@internationalized/date').DateValue) =>
  formatDateForCalendarPure(date, configs);
export const parseDateForCalendar = (date: string | undefined) =>
  parseDateForCalendarPure(date, configs);
export const parseDate = (date: string) => parseDatePure(date, configs);
export const getCurrencySymbol = (currency?: string) =>
  getCurrencySymbolPure(currency || configs.currency);
export const formatCurrency = (amount: number) => formatCurrencyPure(amount, configs);
export const getDistanceUnit = () => getDistanceUnitPure(configs);
export const formatDistance = (distance: number) => formatDistancePure(distance, configs);
export const getFuelUnit = (vehicleType: string) => getFuelUnitPure(vehicleType, configs);
export const formatFuel = (amount: number, vehicleType: string) =>
  formatFuelPure(amount, vehicleType, configs);
export const getMileageUnit = (vehicleType: string) => getMileageUnitPure(vehicleType, configs);
export const formatMileage = (mileage: number, vehicleType: string) =>
  formatMileagePure(mileage, vehicleType, configs);
export { roundNumber } from './unit.helper';
