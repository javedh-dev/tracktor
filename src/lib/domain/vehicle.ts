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
	fuelType: 'petrol' | 'diesel' | 'electric' | 'lpg' | 'cng';
	customFields?: Record<string, string> | null;
}

export const FUEL_TYPES = {
	petrol: 'petrol',
	diesel: 'diesel',
	electric: 'electric',
	lpg: 'lpg',
	cng: 'cng'
} as const;

// Helper function to get localized fuel type label
export function getFuelTypeLabel(fuelType: string, m: any): string {
	switch (fuelType) {
		case 'petrol':
			return m.fuel_type_petrol();
		case 'diesel':
			return m.fuel_type_diesel();
		case 'electric':
			return m.fuel_type_electric();
		case 'lpg':
			return m.fuel_type_lpg();
		case 'cng':
			return m.fuel_type_cng();
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
		.min(1900, 'It must be after 1900')
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
	fuelType: z.enum(['petrol', 'diesel', 'electric', 'lpg', 'cng']).default('petrol'),
	customFields: z.record(z.string(), z.string()).nullable().optional()
});

export type VehicleSchema = typeof vehicleSchema;
