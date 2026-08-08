import { describe, expect, it } from 'vitest';
import { apiDateString, dateStringForFormat } from '$lib/domain/shared';
import { maintenanceFormSchema } from '$lib/domain/maintenance';
import { complianceFormSchema } from '$lib/domain/compliance';

describe('localized date validation', () => {
  it('accepts days greater than 12 in day-first formats', () => {
    expect(dateStringForFormat('dd/MM/yyyy').safeParse('13/08/2026').success).toBe(true);
    expect(dateStringForFormat('dd/MM/yyyy').safeParse('31/12/2026').success).toBe(true);
  });

  it('validates against the configured field order', () => {
    expect(dateStringForFormat('MM/dd/yyyy').safeParse('08/13/2026').success).toBe(true);
    expect(dateStringForFormat('MM/dd/yyyy').safeParse('13/08/2026').success).toBe(false);
  });

  it('rejects impossible and partially matching dates', () => {
    const schema = dateStringForFormat('dd/MM/yyyy');
    expect(schema.safeParse('31/02/2026').success).toBe(false);
    expect(schema.safeParse('13/08/2026 trailing').success).toBe(false);
    expect(schema.safeParse('').success).toBe(false);
  });

  it('rejects calendar dates that JavaScript would silently normalize', () => {
    expect(apiDateString.safeParse('2026-02-31').success).toBe(false);
    expect(apiDateString.safeParse('2026-08-13T12:00:00.000Z').success).toBe(true);
  });

  it('uses localized validation in the maintenance form schema', () => {
    const result = maintenanceFormSchema('dd/MM/yyyy').safeParse({
      id: null,
      vehicleId: '123e4567-e89b-42d3-a456-426614174000',
      date: '13/08/2026',
      odometer: 1,
      serviceCenter: 'Garage',
      cost: 0,
      notes: null,
      attachment: null
    });

    expect(result.success).toBe(true);
  });

  it('compares localized compliance dates chronologically', () => {
    const base = {
      id: null,
      vehicleId: '123e4567-e89b-42d3-a456-426614174000',
      type: 'insurance' as const,
      otherLabel: null,
      documentNumber: 'ABC123',
      issuer: 'Insurer',
      startDate: '13/08/2026',
      recurrenceType: 'none' as const,
      recurrenceInterval: 1,
      cost: null,
      notes: null,
      attachment: null
    };

    expect(
      complianceFormSchema('dd/MM/yyyy').safeParse({ ...base, endDate: '14/08/2026' }).success
    ).toBe(true);
    expect(
      complianceFormSchema('dd/MM/yyyy').safeParse({ ...base, endDate: '12/08/2026' }).success
    ).toBe(false);
  });
});
