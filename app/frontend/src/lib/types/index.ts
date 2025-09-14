export type DataPoint = {
	x: Date | string;
	y: number | null;
};

export type MaintenanceLog = {
	id: string;
	date: string;
	odometer: number;
	serviceCenter: string;
	cost: number;
	notes?: string;
	vehicleId: string;
};
