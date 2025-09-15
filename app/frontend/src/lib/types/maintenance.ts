import { parseDate } from '$lib/helper/formatting';
import { z } from 'zod/v4';

export interface MaintenanceLog {
	id: string | null;
	vehicleId: string;
	date: Date;
	odometer: number;
	serviceCenter: string;
	cost: number;
	notes: string | null;
}

export const maintenenceSchema = z.object({
	id: z.string().nullable(),
	vehicleId: z.uuid(),
	date: z.string().check((val) => {
		parseDate(val.value);
	}),
	odometer: z.number().positive(),
	serviceCenter: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	cost: z.float32().positive(),
	notes: z.string().nullable()
});

export type MaintenenceSchema = typeof maintenenceSchema;
