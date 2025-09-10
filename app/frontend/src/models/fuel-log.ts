export interface NewFuelLog {
	date: string;
	odometer: number | null;
	fuelAmount: number | null;
	cost: number | null;
	notes?: string;
}

export interface FuelLog extends NewFuelLog {
	id: string;
}
