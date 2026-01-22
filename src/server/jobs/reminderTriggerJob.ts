import { logger } from '$server/config';
import { db } from '$server/db/index';
import * as schema from '$server/db/schema/index';
import { lte, and, eq } from 'drizzle-orm';
import { calculateNextDueDate, hasRecurrenceEnded } from '$server/services/reminderService';

type Reminder = typeof schema.reminderTable.$inferSelect;

/**
 * Get today's date at midnight (00:00:00) in ISO format
 */
function getTodayAtMidnight(): string {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today.toISOString();
}

/**
 * Fetch all due reminders that need processing
 */
async function fetchDueReminders(todayISOString: string): Promise<Reminder[]> {
	return await db.query.reminderTable.findMany({
		where: and(
			lte(schema.reminderTable.dueDate, todayISOString),
			eq(schema.reminderTable.isCompleted, false)
		)
	});
}

/**
 * Send notification for a due reminder
 * TODO: Implement actual notification mechanism (email, push, webhook, etc.)
 */
async function sendReminderNotification(reminder: Reminder): Promise<void> {
	// TODO: Implement notification/alert mechanism here
	// Examples:
	// - Send email notification
	// - Create in-app notification
	// - Log to database audit trail
	// - Send webhook/API call

	// For now, just log it
	logger.info(`[ReminderJob] Reminder due: ${reminder.type} - ${reminder.note || 'No note'}`);
}

/**
 * Mark a reminder as completed in the database
 */
async function markReminderAsCompleted(reminderId: string): Promise<void> {
	await db
		.update(schema.reminderTable)
		.set({ isCompleted: true })
		.where(eq(schema.reminderTable.id, reminderId));
}

/**
 * Update a reminder to its next due date
 */
async function updateReminderToNextDueDate(reminderId: string, nextDueDate: Date): Promise<void> {
	await db
		.update(schema.reminderTable)
		.set({ dueDate: nextDueDate.toISOString() })
		.where(eq(schema.reminderTable.id, reminderId));
}

/**
 * Handle a one-time (non-recurring) reminder
 */
async function handleOneTimeReminder(reminder: Reminder): Promise<void> {
	await markReminderAsCompleted(reminder.id);
	logger.info(`[ReminderJob] One-time reminder ${reminder.id} marked as completed`);
}

/**
 * Handle a recurring reminder by calculating next due date or marking as completed
 */
async function handleRecurringReminder(reminder: Reminder): Promise<void> {
	try {
		const nextDueDate = calculateNextDueDate(
			reminder.dueDate,
			reminder.recurrenceType,
			reminder.recurrenceInterval
		);

		// Check if recurrence has ended
		if (hasRecurrenceEnded(nextDueDate, reminder.recurrenceEndDate)) {
			await markReminderAsCompleted(reminder.id);
			logger.info(`[ReminderJob] Recurring reminder ${reminder.id} completed (reached end date)`);
		} else {
			await updateReminderToNextDueDate(reminder.id, nextDueDate);
			logger.info(
				`[ReminderJob] Recurring reminder ${reminder.id} updated to next due date: ${nextDueDate.toISOString()}`
			);
		}
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
		logger.error(`[ReminderJob] Failed to calculate next due date for reminder ${reminder.id}:`, {
			error: errorMsg,
			recurrenceType: reminder.recurrenceType,
			recurrenceInterval: reminder.recurrenceInterval
		});
		throw error;
	}
}

/**
 * Process a single reminder based on its recurrence type
 */
async function processSingleReminder(reminder: Reminder): Promise<void> {
	logger.info(
		`[ReminderJob] Processing reminder: ${reminder.id} (${reminder.type}) for vehicle ID: ${reminder.vehicleId}`
	);

	// Send notification
	await sendReminderNotification(reminder);

	// Handle based on recurrence type
	if (reminder.recurrenceType === 'none') {
		await handleOneTimeReminder(reminder);
	} else {
		await handleRecurringReminder(reminder);
	}
}

/**
 * Process all due reminders
 */
async function processAllDueReminders(dueReminders: Reminder[]): Promise<void> {
	for (const reminder of dueReminders) {
		try {
			await processSingleReminder(reminder);
		} catch (error) {
			const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
			logger.error(`[ReminderJob] Failed to process reminder ${reminder.id}:`, {
				error: errorMsg,
				stack: error instanceof Error ? error.stack : undefined
			});
		}
	}
}

/**
 * Daily Reminder Trigger Job
 * Checks for reminders that are due or overdue and processes them
 * This job runs every day at the configured time
 */
export async function handleDailyReminderTrigger(): Promise<void> {
	try {
		logger.info('[ReminderJob] Processing due reminders...');

		const todayISOString = getTodayAtMidnight();
		const dueReminders = await fetchDueReminders(todayISOString);

		if (dueReminders.length === 0) {
			logger.info('[ReminderJob] No due reminders found');
			return;
		}

		logger.info(`[ReminderJob] Found ${dueReminders.length} due reminder(s)`);

		await processAllDueReminders(dueReminders);

		logger.info(`[ReminderJob] Completed processing ${dueReminders.length} reminder(s)`);
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
		logger.error('[ReminderJob] Unexpected error during reminder processing:', {
			error: errorMsg,
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}

/**
 * Example: Weekly Maintenance Status Check
 * You can create more jobs following this pattern
 */
export async function handleWeeklyMaintenanceCheck(): Promise<void> {
	try {
		logger.info('[MaintenanceCheckJob] Running weekly maintenance status check...');

		// Get all vehicles
		const vehicles = await db.query.vehicleTable.findMany();

		logger.info(`[MaintenanceCheckJob] Checking ${vehicles.length} vehicle(s)`);

		// TODO: Implement maintenance checks
		// Examples:
		// - Check if maintenance is overdue
		// - Analyze fuel efficiency trends
		// - Validate insurance expiry dates
		// - Check pollution certificate status

		logger.info('[MaintenanceCheckJob] Weekly maintenance check completed');
	} catch (error) {
		const errorMsg = error instanceof Error ? error.message : JSON.stringify(error);
		logger.error('[MaintenanceCheckJob] Unexpected error:', {
			error: errorMsg,
			stack: error instanceof Error ? error.stack : undefined
		});
		throw error;
	}
}
