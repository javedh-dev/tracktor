export type DataPoint = {
	x: Date | string;
	y: number | null;
};

export type Response<DataType> = {
	status: 'OK' | 'ERROR';
	data?: DataType;
	error?: string;
};

export enum Status {
	LOADING,
	DONE,
	ERROR
}

// Re-export types from other modules
export type { Insurance, InsuranceSchema } from './insurance';
export type { PollutionCertificate, PollutionCertificateSchema } from './pucc';
export type { MaintenanceLog, MaintenenceSchema } from './maintenance';
