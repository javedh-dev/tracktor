import { parseDate } from '$lib/helper/formatting';
import { z } from 'zod/v4';

export interface Insurance {
	id: string | null;
	vehicleId: string;
	provider: string;
	policyNumber: string;
	startDate: Date;
	endDate: Date;
	cost: number;
	notes: string | null;
}

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
	endDate: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch {
			return false;
		}
	}, 'Invalid date format'),
	cost: z.float32().positive(),
	notes: z.string().nullable()
});

export type InsuranceSchema = typeof insuranceSchema;