import type { FormatConfig } from './date.helper';

const UNIT_LABEL_FALLBACKS: Record<string, string> = {
  liter: 'L',
  gallon: 'gal',
  kilogram: 'kg',
  pound: 'lb',
  kilometer: 'km',
  mile: 'mi'
};

const safeUnitLabel = (unit: string, locale: string): string => {
  try {
    return (
      new Intl.NumberFormat(locale, {
        style: 'unit',
        unit
      })
        .formatToParts(0)
        .find((part) => part.type === 'unit')?.value ||
      UNIT_LABEL_FALLBACKS[unit] ||
      unit
    );
  } catch (_) {
    return UNIT_LABEL_FALLBACKS[unit] || unit;
  }
};

const safeUnitFormat = (value: number, unit: string, locale: string): string | null => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit
    }).format(value);
  } catch (_) {
    return null;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  try {
    return (
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
      })
        .formatToParts(0)
        .find((part) => part.type === 'currency')?.value || ''
    );
  } catch (e) {
    return '';
  }
};

export const formatCurrency = (amount: number, config: FormatConfig): string => {
  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency
  }).format(amount);
};

const getFuelVolumeUnit = (fuelType: string, config: FormatConfig): string => {
  switch (fuelType) {
    case 'lpg':
      return config.unitOfLpg || config.unitOfVolume;
    case 'cng':
      return config.unitOfCng || config.unitOfVolume;
    default:
      return config.unitOfVolume;
  }
};

export const getDistanceUnit = (config: FormatConfig): string => {
  return safeUnitLabel(config.unitOfDistance, config.locale);
};

export const formatDistance = (distance: number, config: FormatConfig): string => {
  return (
    safeUnitFormat(distance, config.unitOfDistance, config.locale) ||
    `${distance} ${safeUnitLabel(config.unitOfDistance, config.locale)}`
  );
};

export const getFuelUnit = (vehicleType: string, config: FormatConfig): string => {
  if (vehicleType === 'electric') {
    return 'kWh';
  }
  return safeUnitLabel(getFuelVolumeUnit(vehicleType, config), config.locale);
};

export const formatFuel = (amount: number, vehicleType: string, config: FormatConfig): string => {
  if (vehicleType === 'electric') {
    return `${amount.toFixed(3)} kWh`;
  }

  const fuelUnit = getFuelVolumeUnit(vehicleType, config);
  return (
    safeUnitFormat(amount, fuelUnit, config.locale) ||
    `${amount.toFixed(2)} ${safeUnitLabel(fuelUnit, config.locale)}`
  );
};

export const getMileageUnit = (vehicleType: string, config: FormatConfig): string => {
  if (vehicleType === 'electric') {
    return 'km/kWh';
  }
  const fuelUnit = getFuelVolumeUnit(vehicleType, config);
  const distanceUnit = safeUnitLabel(config.unitOfDistance, config.locale);
  const fuelLabel = safeUnitLabel(fuelUnit, config.locale);

  if (config.mileageUnitFormat === 'fuel-per-distance') {
    return `${fuelLabel}/100${distanceUnit}`;
  }

  if (
    config.mileageUnitFormat === 'uk-mpg' &&
    config.unitOfDistance === 'mile' &&
    fuelUnit === 'liter'
  ) {
    return 'mpg';
  }

  const mileageUnit = `${config.unitOfDistance}-per-${fuelUnit}`;
  const label = safeUnitLabel(mileageUnit, config.locale);
  return label === mileageUnit ? `${distanceUnit}/${fuelLabel}` : label;
};

export const formatMileage = (
  mileage: number,
  vehicleType: string,
  config: FormatConfig
): string => {
  if (vehicleType === 'electric') {
    return `${mileage.toFixed(3)} km/kWh`;
  }
  const fuelUnit = getFuelVolumeUnit(vehicleType, config);
  const distanceUnit = safeUnitLabel(config.unitOfDistance, config.locale);
  const fuelLabel = safeUnitLabel(fuelUnit, config.locale);

  if (config.mileageUnitFormat === 'fuel-per-distance') {
    return `${mileage.toFixed(2)} ${fuelLabel}/100${distanceUnit}`;
  }

  if (
    config.mileageUnitFormat === 'uk-mpg' &&
    config.unitOfDistance === 'mile' &&
    fuelUnit === 'liter'
  ) {
    return `${mileage.toFixed(2)} mpg`;
  }

  const mileageUnit = `${config.unitOfDistance}-per-${fuelUnit}`;
  return (
    safeUnitFormat(mileage, mileageUnit, config.locale) ||
    `${mileage.toFixed(2)} ${distanceUnit}/${fuelLabel}`
  );
};

export const roundNumber = (num: number, decimal: number = 2): number => {
  return Number(num.toFixed(decimal));
};
