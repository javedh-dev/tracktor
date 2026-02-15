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
export type { FuelLog, FuelSchema } from './fuel';
export type { Vehicle, VehicleSchema } from './vehicle';
export type { Insurance, InsuranceSchema } from './insurance';
export type { PollutionCertificate, PollutionCertificateSchema } from './pucc';
export type { MaintenanceLog, MaintenanceSchema } from './maintenance';
export type { Config } from './config';
export type { Reminder, ReminderSchema } from './reminder';
export type { Notification, NotificationSchema } from './notification';

// Re-export constants
export { INSURANCE_RECURRENCE_TYPES, insuranceSchema } from './insurance';
export { PUCC_RECURRENCE_TYPES, pollutionCertificateSchema } from './pucc';
export {
	REMINDER_TYPES,
	REMINDER_SCHEDULES,
	REMINDER_RECURRENCE_TYPES,
	reminderSchema
} from './reminder';
export { NOTIFICATION_TYPES, NOTIFICATION_SOURCES, notificationSchema } from './notification';
