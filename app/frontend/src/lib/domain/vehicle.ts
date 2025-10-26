import { z } from 'zod/v4';

export interface Vehicle {
	id: string | null;
	make: string;
	model: string;
	year: number;
	licensePlate: string;
	vin: string;
	color: string;
	odometer: number | null;
	insuranceStatus?: string;
	puccStatus?: string;
	image: string | null;
}

export const vehicleSchema = z.object({
	id: z.string().nullable(),
	make: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),

	model: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	year: z
		.number()
		.min(1970, 'It must be after 1970')
		.max(2100, 'It must be before current year.')
		.default(2025),
	licensePlate: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	vin: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.'),
	color: z
		.string()
		.regex(/^(#[0-9a-fA-F]{3})|(#[0-9a-fA-F]{6})$/, 'Only hex color codes allowed.')
		.default('#A1A1A1'),
	odometer: z.number().nonnegative().nullable(),
	image: z.string().nullable()
});

export type VehicleSchema = typeof vehicleSchema;
