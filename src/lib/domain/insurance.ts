import { parseDate } from '$lib/helper/format.helper';
import { z } from 'zod';

export const INSURANCE_RECURRENCE_TYPES = {
	none: 'Fixed end date',
	yearly: 'Renews yearly',
	monthly: 'Renews monthly',
	no_end: 'No end date'
} as const;

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

export const insuranceSchema = z.object({
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
	startDate: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch {
			return false;
		}
	}, 'Invalid date format'),
	endDate: z.string().nullable().optional(),
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
});

export type InsuranceSchema = typeof insuranceSchema;
