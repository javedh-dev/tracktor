import { parseDate } from '$lib/helper/format.helper';
import { z } from 'zod';

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
}

const puccRecurrenceOptions = Object.keys(
	PUCC_RECURRENCE_TYPES
) as (keyof typeof PUCC_RECURRENCE_TYPES)[];

export const pollutionCertificateSchema = z.object({
	id: z.string().nullable(),
	vehicleId: z.uuid(),
	certificateNumber: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	issueDate: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch {
			return false;
		}
	}, 'Invalid date format'),
	expiryDate: z.string().nullable().optional(),
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
});
export type PollutionCertificateSchema = typeof pollutionCertificateSchema;
