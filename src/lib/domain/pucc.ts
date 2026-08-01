import { z } from 'zod';
import { apiDateString, optionalApiDateString } from './shared';
import { getNextDueDate } from '$lib/helper/recurrence.helper';

export const PUCC_RECURRENCE_TYPES = {
  none: 'none',
  yearly: 'yearly',
  monthly: 'monthly',
  no_end: 'no_end'
} as const;

// Helper function to get localized PUCC recurrence type label
export function getPuccRecurrenceTypeLabel(type: string, m: any): string {
  switch (type) {
    case 'none':
      return m.pollution_recurrence_type_fixed();
    case 'yearly':
      return m.pollution_recurrence_type_yearly();
    case 'monthly':
      return m.pollution_recurrence_type_monthly();
    case 'no_end':
      return m.pollution_recurrence_type_no_end();
    default:
      return m.pollution_recurrence_type_fixed();
  }
}

export interface PollutionCertificate {
  id: string | null;
  vehicleId: string;
  certificateNumber: string;
  issueDate: Date;
  expiryDate: Date | null;
  recurrenceType: keyof typeof PUCC_RECURRENCE_TYPES;
  recurrenceInterval: number;
  testingCenter: string;
  notes: string | null;
  attachment: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
  vehiclePlate?: string | null;
}

type PuccStatus = 'valid' | 'expiring_soon' | 'expired';

/** Next date this certificate is due (issue/expiry + recurrence). Null when it never expires. */
export function getPuccNextDue(pucc: PollutionCertificate): Date | null {
  const baseDate = pucc.expiryDate ?? pucc.issueDate;
  if (!baseDate) return null;
  if (pucc.recurrenceType === 'no_end') return null;
  if (pucc.recurrenceType === 'none') return baseDate;
  return getNextDueDate(new Date(baseDate), pucc.recurrenceType, pucc.recurrenceInterval);
}

/** Compliance status derived from the next due date, matching the 30-day "expiring soon" window
 *  previously computed server-side in /api/pucc/status. */
export function getPuccStatus(pucc: PollutionCertificate, today: Date = new Date()): PuccStatus {
  const nextDue = getPuccNextDue(pucc);
  if (!nextDue) return 'valid';
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
  if (nextDue < today) return 'expired';
  if (nextDue <= thirtyDaysFromNow) return 'expiring_soon';
  return 'valid';
}

const puccRecurrenceOptions = Object.keys(
  PUCC_RECURRENCE_TYPES
) as (keyof typeof PUCC_RECURRENCE_TYPES)[];

export const pollutionCertificateSchema = z
  .object({
    id: z.string().nullable(),
    vehicleId: z.uuid(),
    certificateNumber: z
      .string()
      .min(2, 'It must be more than 1 character.')
      .max(50, 'It must be less than 50 characters.'),
    issueDate: apiDateString,
    expiryDate: optionalApiDateString,
    recurrenceType: z
      .enum(
        puccRecurrenceOptions as [
          keyof typeof PUCC_RECURRENCE_TYPES,
          ...Array<keyof typeof PUCC_RECURRENCE_TYPES>
        ]
      )
      .default('none'),
    recurrenceInterval: z.number().int().positive().default(1),
    testingCenter: z
      .string()
      .min(2, 'It must be more than 1 character.')
      .max(100, 'It must be less than 100 characters.'),
    notes: z.string().nullable(),
    attachment: z.string().nullable()
  })
  .refine(
    (data) => {
      if (data.recurrenceType === undefined) return true;
      if (data.recurrenceType !== 'none') return true;
      if (data.expiryDate === undefined) return true;
      if (!data.expiryDate) return false;
      if (!data.issueDate) return true;
      return new Date(data.expiryDate) > new Date(data.issueDate);
    },
    { message: 'Expiry date must be after issue date when recurrence is fixed' }
  );
export type PollutionCertificateSchema = typeof pollutionCertificateSchema;
