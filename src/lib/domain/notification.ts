import { z } from 'zod';

export const NOTIFICATION_TYPES = {
	reminder: 'reminder',
	alert: 'alert',
	maintenance: 'maintenance',
	insurance: 'insurance',
	pollution: 'pollution',
	registration: 'registration'
} as const;

export const NOTIFICATION_SOURCES = {
	system: 'system',
	user: 'user',
	auto: 'auto'
} as const;

export interface Notification {
	id: string;
	vehicleId: string;
	type: keyof typeof NOTIFICATION_TYPES;
	message: string;
	source: keyof typeof NOTIFICATION_SOURCES;
	dueDate: Date | string;
	isRead: boolean;
	created_at: Date | string;
	updated_at: Date | string;
}

const notificationTypeOptions = Object.keys(
	NOTIFICATION_TYPES
) as (keyof typeof NOTIFICATION_TYPES)[];
const notificationSourceOptions = Object.keys(
	NOTIFICATION_SOURCES
) as (keyof typeof NOTIFICATION_SOURCES)[];

export const notificationSchema = z.object({
	id: z.string().uuid(),
	vehicleId: z.string().uuid(),
	type: z.enum(
		notificationTypeOptions as [
			keyof typeof NOTIFICATION_TYPES,
			...Array<keyof typeof NOTIFICATION_TYPES>
		]
	),
	message: z.string().min(1, 'Message is required'),
	source: z.enum(
		notificationSourceOptions as [
			keyof typeof NOTIFICATION_SOURCES,
			...Array<keyof typeof NOTIFICATION_SOURCES>
		]
	),
	dueDate: z.string(),
	isRead: z.boolean().default(false),
	created_at: z.string(),
	updated_at: z.string()
});

export type NotificationSchema = typeof notificationSchema;
