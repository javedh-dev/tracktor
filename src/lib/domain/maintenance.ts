import { z } from 'zod';
import { apiDateString } from './shared';

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
  date: apiDateString,
  odometer: z.number().positive(),
  serviceCenter: z
    .string()
    .min(2, 'It must be more than 1 character.')
    .max(50, 'It must be less than 50 characters.'),
  cost: z.float32().nonnegative(),
  notes: z.string().nullable(),
  attachment: z.string().nullable()
});

export type MaintenanceSchema = typeof maintenanceSchema;
