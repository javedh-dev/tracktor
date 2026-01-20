import { parseDate } from '$lib/helper/format.helper';
import { z } from 'zod';

export interface FuelLog {
	id: string | null;
	vehicleId: string;
	date: Date;
	odometer: number | null;
	filled: boolean;
	missedLast: boolean;
	fuelAmount: number | null;
	cost: number;
	notes: string | null;
	attachment: string | null;
	mileage?: number;
}

export const fuelSchema = z.object({
	id: z.string().nullable(),
	vehicleId: z.uuid(),
	date: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch {
			return false;
		}
	}, 'Invalid date format'),
	odometer: z.number().positive().nullable(),
	filled: z.boolean().default(true),
	missedLast: z.boolean(),
	fuelAmount: z.number().positive().nullable(),
	cost: z.float32().positive(),
	notes: z.string().nullable(),
	attachment: z.string().nullable()
});

export type FuelSchema = typeof fuelSchema;
