import { parseDate } from '$lib/helper/format.helper';
import { z } from 'zod';

export const REMINDER_TYPES = {
	maintenance: 'maintenance',
	insurance: 'insurance',
	pollution: 'pollution',
	registration: 'registration',
	inspection: 'inspection',
	custom: 'custom'
} as const;

export const REMINDER_SCHEDULES = {
	same_day: 'same_day',
	one_day_before: 'one_day_before',
	three_days_before: 'three_days_before',
	one_week_before: 'one_week_before',
	one_month_before: 'one_month_before'
} as const;

export const REMINDER_RECURRENCE_TYPES = {
	none: 'none',
	daily: 'daily',
	weekly: 'weekly',
	monthly: 'monthly',
	yearly: 'yearly'
} as const;

// Helper function to get localized reminder schedule label
export function getReminderScheduleLabel(schedule: string, m: any): string {
	switch (schedule) {
		case 'same_day':
			return m.reminder_schedule_same_day();
		case 'one_day_before':
			return m.reminder_schedule_one_day_before();
		case 'three_days_before':
			return m.reminder_schedule_three_days_before();
		case 'one_week_before':
			return m.reminder_schedule_one_week_before();
		case 'one_month_before':
			return m.reminder_schedule_one_month_before();
		default:
			return m.reminder_schedule_same_day();
	}
}

// Helper function to get localized recurrence type label
export function getRecurrenceTypeLabel(type: string, m: any): string {
	switch (type) {
		case 'none':
			return m.recurrence_type_none();
		case 'daily':
			return m.recurrence_type_daily();
		case 'weekly':
			return m.recurrence_type_weekly();
		case 'monthly':
			return m.recurrence_type_monthly();
		case 'yearly':
			return m.recurrence_type_yearly();
		default:
			return m.recurrence_type_none();
	}
}

// Helper function to get localized reminder type label
export function getReminderTypeLabel(type: string, m: any): string {
	switch (type) {
		case 'maintenance':
			return m.reminder_type_maintenance();
		case 'insurance':
			return m.reminder_type_insurance();
		case 'pollution':
			return m.reminder_type_pollution();
		case 'registration':
			return m.reminder_type_registration();
		case 'inspection':
			return m.reminder_type_inspection();
		case 'custom':
			return m.reminder_type_custom();
		default:
			return m.reminder_type_custom();
	}
}

export interface Reminder {
	id: string | null;
	vehicleId: string;
	type: keyof typeof REMINDER_TYPES;
	dueDate: Date;
	remindSchedule: keyof typeof REMINDER_SCHEDULES;
	recurrenceType: keyof typeof REMINDER_RECURRENCE_TYPES;
	recurrenceInterval: number;
	recurrenceEndDate: Date | null;
	note: string | null;
	isCompleted: boolean;
}

const reminderTypeOptions = Object.keys(REMINDER_TYPES) as (keyof typeof REMINDER_TYPES)[];
const reminderScheduleOptions = Object.keys(
	REMINDER_SCHEDULES
) as (keyof typeof REMINDER_SCHEDULES)[];
const reminderRecurrenceOptions = Object.keys(
	REMINDER_RECURRENCE_TYPES
) as (keyof typeof REMINDER_RECURRENCE_TYPES)[];

export const reminderSchema = z.object({
	id: z.string().nullable(),
	vehicleId: z.string().uuid(),
	type: z
		.enum(
			reminderTypeOptions as [keyof typeof REMINDER_TYPES, ...Array<keyof typeof REMINDER_TYPES>]
		)
		.default('custom'),
	dueDate: z.string().refine((val) => {
		try {
			parseDate(val);
			return true;
		} catch (err) {
			return false;
		}
	}, 'Invalid date format'),
	remindSchedule: z
		.enum(
			reminderScheduleOptions as [
				keyof typeof REMINDER_SCHEDULES,
				...Array<keyof typeof REMINDER_SCHEDULES>
			]
		)
		.default('same_day'),
	recurrenceType: z
		.enum(
			reminderRecurrenceOptions as [
				keyof typeof REMINDER_RECURRENCE_TYPES,
				...Array<keyof typeof REMINDER_RECURRENCE_TYPES>
			]
		)
		.default('none'),
	recurrenceInterval: z.number().int().positive().default(1),
	recurrenceEndDate: z
		.string()
		.refine((val) => {
			if (!val) return true;
			try {
				parseDate(val);
				return true;
			} catch (err) {
				return false;
			}
		}, 'Invalid date format')
		.nullable(),
	note: z.string().max(500, 'Notes cannot be longer than 500 characters.').nullable(),
	isCompleted: z.boolean().default(false)
});

export type ReminderSchema = typeof reminderSchema;
