import { z } from 'zod';
import { apiDateString, optionalApiDateString } from './shared';

export const INSURANCE_RECURRENCE_TYPES = {
  none: 'none',
  yearly: 'yearly',
  monthly: 'monthly',
  no_end: 'no_end'
} as const;

// Helper function to get localized insurance recurrence type label
export function getInsuranceRecurrenceTypeLabel(type: string, m: any): string {
  switch (type) {
    case 'none':
      return m.insurance_recurrence_type_fixed();
    case 'yearly':
      return m.insurance_recurrence_type_yearly();
    case 'monthly':
      return m.insurance_recurrence_type_monthly();
    case 'no_end':
      return m.insurance_recurrence_type_no_end();
    default:
      return m.insurance_recurrence_type_fixed();
  }
}

export interface Insurance {
  id: string | null;
  vehicleId: string;
  provider: string;
  policyNumber: string;
  startDate: Date;
  endDate: Date | null;
  recurrenceType: keyof typeof INSURANCE_RECURRENCE_TYPES;
  recurrenceInterval: number;
  cost: number;
  notes: string | null;
  attachment: string | null;
}

const insuranceRecurrenceOptions = Object.keys(
  INSURANCE_RECURRENCE_TYPES
) as (keyof typeof INSURANCE_RECURRENCE_TYPES)[];

export const insuranceSchema = z
  .object({
    id: z.string().nullable(),
    vehicleId: z.uuid(),
    provider: z
      .string()
      .min(2, 'It must be more than 1 character.')
      .max(100, 'It must be less than 100 characters.'),
    policyNumber: z
      .string()
      .min(2, 'It must be more than 1 character.')
      .max(50, 'It must be less than 50 characters.'),
    startDate: apiDateString,
    endDate: optionalApiDateString,
    recurrenceType: z
      .enum(
        insuranceRecurrenceOptions as [
          keyof typeof INSURANCE_RECURRENCE_TYPES,
          ...Array<keyof typeof INSURANCE_RECURRENCE_TYPES>
        ]
      )
      .default('no_end'),
    recurrenceInterval: z.number().int().positive().default(1),
    cost: z.float32().positive(),
    notes: z.string().nullable(),
    attachment: z.string().nullable()
  })
  .refine(
    (data) => {
      if (data.recurrenceType === undefined) return true;
      if (data.recurrenceType !== 'none') return true;
      if (data.endDate === undefined) return true;
      if (!data.endDate) return false;
      if (!data.startDate) return true;
      return new Date(data.endDate) > new Date(data.startDate);
    },
    { message: 'End date must be after start date when recurrence is fixed' }
  );

export type InsuranceSchema = typeof insuranceSchema;
