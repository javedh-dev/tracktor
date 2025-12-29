import { parseDate } from '$lib/helper/format.helper';
import { z } from 'zod';

export const REMINDER_TYPES = {
	maintenance: 'Maintenance',
	insurance: 'Insurance Renewal',
	pollution: 'Emission / PUCC',
	registration: 'Registration / Tax',
	inspection: 'Inspection',
	custom: 'Custom'
} as const;

export const REMINDER_SCHEDULES = {
	same_day: 'On due date',
	one_day_before: '1 day before',
	three_days_before: '3 days before',
	one_week_before: '1 week before',
	one_month_before: '1 month before'
} as const;

export const REMINDER_RECURRENCE_TYPES = {
	none: 'No recurrence',
	daily: 'Daily',
	weekly: 'Weekly',
	monthly: 'Monthly',
	yearly: 'Yearly'
} as const;

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
