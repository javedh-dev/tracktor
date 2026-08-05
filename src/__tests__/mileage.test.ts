import { describe, expect, it } from 'vitest';
import { computeMileagePerWindow, type FuelLogInput } from '../lib/domain/fuel/mileage';

function log(overrides: Partial<FuelLogInput>): FuelLogInput {
  return { filled: true, missedLast: false, odometer: null, fuelAmount: null, ...overrides };
}

describe('computeMileagePerWindow', () => {
  it('computes a ratio for a simple two-fill window', () => {
    const logs = [log({ odometer: 100, fuelAmount: 10 }), log({ odometer: 200, fuelAmount: 10 })];
    expect(computeMileagePerWindow(logs)).toEqual([null, 10]);
  });

  it('does not crash when a fillable log has no valid preceding start (regression)', () => {
    // Index 1 passes the per-log eligibility filter (filled, not missedLast, has
    // odometer/fuelAmount) but findMileageWindows drops it anyway because the
    // backward walk never finds an earlier filled odometer to pair it with.
    // A shared index counter between the two functions used to desync here and
    // read past the end of the compacted windows array on the next real window.
    const logs = [
      log({ filled: false }),
      log({ odometer: 150, fuelAmount: 8 }),
      log({ odometer: 250, fuelAmount: 10 })
    ];
    expect(() => computeMileagePerWindow(logs)).not.toThrow();
    expect(computeMileagePerWindow(logs)).toEqual([null, null, 100 / 10]);
  });
});
