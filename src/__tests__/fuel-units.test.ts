import { expect, it } from 'vitest';
import { formatFuelTotals } from '$lib/helper/unit.helper';
import type { FormatConfig } from '$lib/helper/date.helper';

const config: FormatConfig = {
  dateFormat: 'yyyy-MM-dd',
  timezone: 'UTC',
  locale: 'en',
  currency: 'USD',
  unitOfVolume: 'gallon',
  unitOfLpg: 'liter',
  unitOfCng: 'kilogram',
  unitOfDistance: 'mile',
  mileageUnitFormat: 'distance-per-fuel'
};

it('uses configured gallons and aggregates petrol and diesel (#241)', () => {
  expect(
    formatFuelTotals(
      [
        { fuelAmount: 10, fuelType: 'petrol' },
        { fuelAmount: 5, fuelType: 'diesel' }
      ],
      config
    )
  ).toBe('15 gal');
});

it('keeps electricity, LPG, CNG and liquid volumes separate', () => {
  expect(
    formatFuelTotals(
      [
        { fuelAmount: 10, fuelType: 'petrol' },
        { fuelAmount: 5, fuelType: 'electric' },
        { fuelAmount: 2, fuelType: 'lpg' },
        { fuelAmount: 3, fuelType: 'cng' }
      ],
      config
    )
  ).toBe('10 gal, 5.000 kWh, 2 L, 3 kg');
});

it('handles missing quantities and empty lists', () => {
  expect(formatFuelTotals([{ fuelAmount: null, fuelType: 'petrol' }], config)).toBe('');
  expect(formatFuelTotals([], config)).toBe('');
});
