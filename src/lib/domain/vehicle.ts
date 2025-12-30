import { z } from 'zod';

export interface Vehicle {
	id: string | null;
	make: string;
	model: string;
	year: number;
	licensePlate: string | null;
	vin: string | null;
	color: string | null;
	odometer: number | null;
	insuranceStatus?: string;
	puccStatus?: string;
	image: string | null;
	fuelType: 'diesel' | 'petrol' | 'ev';
	customFields?: Record<string, string> | null;
}

export const FUEL_TYPES = {
	diesel: 'diesel',
	petrol: 'petrol',
	ev: 'ev'
} as const;

// Helper function to get localized fuel type label
export function getFuelTypeLabel(fuelType: string, m: any): string {
	switch (fuelType) {
		case 'diesel':
			return m.fuel_type_diesel();
		case 'petrol':
			return m.fuel_type_petrol();
		case 'ev':
			return m.fuel_type_ev();
		default:
			return m.fuel_type_petrol();
	}
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
		.max(50, 'It must be less than 50 characters.')
		.nullable(),
	vin: z
		.string()
		.min(2, 'It must be more than 1 character.')
		.max(50, 'It must be less than 50 characters.')
		.nullable(),
	color: z
		.string()
		.regex(/^(#[0-9a-fA-F]{3})|(#[0-9a-fA-F]{6})$/, 'Only hex color codes allowed.')
		.nullable(),
	odometer: z.number().nonnegative().nullable(),
	image: z.string().nullable(),
	fuelType: z.enum(['diesel', 'petrol', 'ev']).default('petrol'),
	customFields: z.record(z.string(), z.string()).nullable().optional()
});

export type VehicleSchema = typeof vehicleSchema;
