import { parseDate } from '$lib/helper/formatting';
import { z } from 'zod/v4';

export interface FuelLog {
	id: string | null;
	vehicleId: string;
	date: Date;
	odometer: number;
	filled: boolean;
	missedLast: boolean;
	fuelAmount: number;
	cost: number;
	notes: string | null;
	mileage?: number;
}

export const fuelSchema = z.object({
	id: z.string().nullable(),
	vehicleId: z.uuid(),
	date: z.string().check((val) => {
		parseDate(val.value);
	}),
	odometer: z.number().positive(),
	filled: z.boolean().default(true),
	missedLast: z.boolean(),
	fuelAmount: z.float32().positive(),
	cost: z.float32().positive(),
	notes: z.string().nullable()
});

export type FuelSchema = typeof fuelSchema;
