import {
  formatCurrency,
  formatDate,
  formatDistance,
  formatFuel,
  getMileageUnit
} from './format.helper';

export const formatTableDate = (value: unknown): string => {
  return value ? formatDate(value as Date | string) : '-';
};

export const formatTableDistance = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  return formatDistance(value as number);
};

export const formatTableCurrency = (value: unknown): string => {
  if (typeof value !== 'number') {
    return '-';
  }

  return formatCurrency(value);
};

export const formatTableText = (value: unknown): string => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return '-';
};

export const formatTableBoolean = (value: unknown, yesLabel: string, noLabel: string): string => {
  return value ? yesLabel : noLabel;
};

export const formatTableFuelAmount = (amount: unknown, fuelType: string | undefined): string => {
  if (typeof amount !== 'number' || !fuelType) {
    return '-';
  }

  return formatFuel(amount, fuelType);
};

export const formatTableMileage = (mileage: unknown, fuelType: string | undefined): string => {
  if (typeof mileage !== 'number' || Number.isNaN(mileage) || !fuelType) {
    return '-';
  }

  return `${mileage.toFixed(2)} ${getMileageUnit(fuelType)}`;
};
