import { parseDate } from '$lib/helper/format.helper';
import { z } from 'zod';

export interface MaintenanceLog {
	id: string | null;
	vehicleId: string;
	date: Date;
	odometer: number;
	serviceCenter: string;
	cost: number;
	notes: string | null;
	attachment: string | null;
}

export const maintenanceSchema = z.object({
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
	odometer: z.number().positive(),
	serviceCenter: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	cost: z.float32().positive(),
	notes: z.string().nullable(),
	attachment: z.string().nullable()
});

export type MaintenanceSchema = typeof maintenanceSchema;
