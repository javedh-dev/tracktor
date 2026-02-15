import cron from 'node-cron';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { createNotification, findExistingNotification } from './notificationService';
import logger from '$server/config/logger';
import { eq } from 'drizzle-orm';

/**
 * Calculate the notification date based on reminder schedule
 */
function calculateNotificationDate(dueDate: Date, remindSchedule: string): Date {
	const notificationDate = new Date(dueDate);

	switch (remindSchedule) {
		case 'same_day':
			// Notify on the due date itself
			break;
		case 'one_day_before':
			notificationDate.setDate(notificationDate.getDate() - 1);
			break;
		case 'three_days_before':
			notificationDate.setDate(notificationDate.getDate() - 3);
			break;
		case 'one_week_before':
			notificationDate.setDate(notificationDate.getDate() - 7);
			break;
		case 'one_month_before':
			notificationDate.setMonth(notificationDate.getMonth() - 1);
			break;
		default:
			break;
	}

	return notificationDate;
}

/**
 * Check if we should create a notification based on the notification date
 */
function shouldCreateNotification(notificationDate: Date, dueDate: Date): boolean {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const notifDay = new Date(
		notificationDate.getFullYear(),
		notificationDate.getMonth(),
		notificationDate.getDate()
	);

	// Create notification if today is the notification date or later (but before due date)
	return notifDay <= today && today <= dueDate;
}

/**
 * Generate notifications from active reminders
 */
async function processReminders() {
	try {
		logger.info('Starting reminder processing job');

		// Get all active (not completed) reminders
		const reminders = await db.query.reminderTable.findMany({
			where: (r, { eq }) => eq(r.isCompleted, false)
		});

		logger.info(`Found ${reminders.length} active reminders to process`);

		let notificationsCreated = 0;

		for (const reminder of reminders) {
			try {
				const dueDate = new Date(reminder.dueDate);
				const notificationDate = calculateNotificationDate(dueDate, reminder.remindSchedule);

				// Check if we should create a notification
				if (!shouldCreateNotification(notificationDate, dueDate)) {
					continue;
				}

				// Check if notification already exists
				const existing = await findExistingNotification(
					reminder.vehicleId,
					reminder.type,
					reminder.dueDate,
					'auto'
				);

				if (existing) {
					logger.debug(`Notification already exists for reminder ${reminder.id}`);
					continue;
				}

				// Format the message based on reminder type
				const typeLabel = reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1);
				let message = `${typeLabel} reminder`;

				if (reminder.note) {
					message += `: ${reminder.note}`;
				}

				const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric'
				});
				message += ` (Due: ${dueDateFormatted})`;

				// Create the notification
				await createNotification({
					vehicleId: reminder.vehicleId,
					type: 'reminder',
					message,
					source: 'auto',
					dueDate: reminder.dueDate,
					isRead: 0
				});

				notificationsCreated++;
				logger.info(`Created notification for reminder ${reminder.id}`);
			} catch (error) {
				logger.error(`Error processing reminder ${reminder.id}:`, error);
			}
		}

		logger.info(`Reminder processing completed. Created ${notificationsCreated} notifications`);
	} catch (error) {
		logger.error('Error in processReminders:', error);
	}
}

/**
 * Generate notifications for expiring insurance policies
 */
async function processInsuranceExpiry() {
	try {
		logger.info('Starting insurance expiry processing job');

		// Get all insurance policies
		const insurances = await db.query.insuranceTable.findMany();

		logger.info(`Found ${insurances.length} insurance policies to check`);

		let notificationsCreated = 0;
		const now = new Date();
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

		for (const insurance of insurances) {
			try {
				if (!insurance.endDate) {
					continue;
				}

				const expiryDate = new Date(insurance.endDate);

				// Skip if already expired or too far in the future
				if (expiryDate < now || expiryDate > thirtyDaysFromNow) {
					continue;
				}

				// Check if notification already exists
				const existing = await findExistingNotification(
					insurance.vehicleId,
					'insurance',
					insurance.endDate,
					'auto'
				);

				if (existing) {
					continue;
				}

				// Calculate days until expiry
				const daysUntilExpiry = Math.ceil(
					(expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
				);

				let message = '';
				if (daysUntilExpiry <= 0) {
					message = `Insurance policy ${insurance.policyNumber} has expired`;
				} else if (daysUntilExpiry === 1) {
					message = `Insurance policy ${insurance.policyNumber} expires tomorrow`;
				} else if (daysUntilExpiry <= 7) {
					message = `Insurance policy ${insurance.policyNumber} expires in ${daysUntilExpiry} days`;
				} else {
					message = `Insurance policy ${insurance.policyNumber} expires in ${daysUntilExpiry} days`;
				}

				// Create the notification
				await createNotification({
					vehicleId: insurance.vehicleId,
					type: 'insurance',
					message,
					source: 'auto',
					dueDate: insurance.endDate,
					isRead: 0
				});

				notificationsCreated++;
				logger.info(`Created notification for insurance ${insurance.id}`);
			} catch (error) {
				logger.error(`Error processing insurance ${insurance.id}:`, error);
			}
		}

		logger.info(
			`Insurance expiry processing completed. Created ${notificationsCreated} notifications`
		);
	} catch (error) {
		logger.error('Error in processInsuranceExpiry:', error);
	}
}

/**
 * Generate notifications for expiring PUCC certificates
 */
async function processPuccExpiry() {
	try {
		logger.info('Starting PUCC expiry processing job');

		// Get all PUCC certificates
		const certificates = await db.query.pollutionCertificateTable.findMany();

		logger.info(`Found ${certificates.length} PUCC certificates to check`);

		let notificationsCreated = 0;
		const now = new Date();
		const thirtyDaysFromNow = new Date();
		thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

		for (const certificate of certificates) {
			try {
				if (!certificate.expiryDate) {
					continue;
				}

				const expiryDate = new Date(certificate.expiryDate);

				// Skip if already expired or too far in the future
				if (expiryDate < now || expiryDate > thirtyDaysFromNow) {
					continue;
				}

				// Check if notification already exists
				const existing = await findExistingNotification(
					certificate.vehicleId,
					'pollution',
					certificate.expiryDate,
					'auto'
				);

				if (existing) {
					continue;
				}

				// Calculate days until expiry
				const daysUntilExpiry = Math.ceil(
					(expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
				);

				let message = '';
				if (daysUntilExpiry <= 0) {
					message = `PUCC certificate ${certificate.certificateNumber} has expired`;
				} else if (daysUntilExpiry === 1) {
					message = `PUCC certificate ${certificate.certificateNumber} expires tomorrow`;
				} else if (daysUntilExpiry <= 7) {
					message = `PUCC certificate ${certificate.certificateNumber} expires in ${daysUntilExpiry} days`;
				} else {
					message = `PUCC certificate ${certificate.certificateNumber} expires in ${daysUntilExpiry} days`;
				}

				// Create the notification
				await createNotification({
					vehicleId: certificate.vehicleId,
					type: 'pollution',
					message,
					source: 'auto',
					dueDate: certificate.expiryDate,
					isRead: 0
				});

				notificationsCreated++;
				logger.info(`Created notification for PUCC certificate ${certificate.id}`);
			} catch (error) {
				logger.error(`Error processing PUCC certificate ${certificate.id}:`, error);
			}
		}

		logger.info(`PUCC expiry processing completed. Created ${notificationsCreated} notifications`);
	} catch (error) {
		logger.error('Error in processPuccExpiry:', error);
	}
}

/**
 * Clean up old read notifications (older than 30 days)
 */
async function cleanupOldNotifications() {
	try {
		logger.info('Starting notification cleanup job');

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

		const deleted = await db
			.delete(schema.notificationTable)
			.where(
				// Delete notifications that are read AND older than 30 days
				// Using raw SQL for better compatibility
				eq(schema.notificationTable.isRead, 1)
			)
			.returning();

		// Filter in memory for date check (since we can't easily do date comparison in SQLite)
		const actuallyDeleted = deleted.filter((n) => new Date(n.created_at) < thirtyDaysAgo);

		logger.info(`Cleanup completed. Deleted ${actuallyDeleted.length} old notifications`);
	} catch (error) {
		logger.error('Error in cleanupOldNotifications:', error);
	}
}

/**
 * Initialize and start all cron jobs
 */
export function initializeCronJobs() {
	logger.info('Initializing cron jobs for notification system');

	// Process reminders every hour at minute 0
	// Runs: 00:00, 01:00, 02:00, etc.
	cron.schedule('0 * * * *', async () => {
		logger.info('Running scheduled reminder processing job');
		await processReminders();
	});

	// Process insurance expiry every day at 8:00 AM
	cron.schedule('0 8 * * *', async () => {
		logger.info('Running scheduled insurance expiry processing job');
		await processInsuranceExpiry();
	});

	// Process PUCC expiry every day at 8:30 AM
	cron.schedule('30 8 * * *', async () => {
		logger.info('Running scheduled PUCC expiry processing job');
		await processPuccExpiry();
	});

	// Clean up old notifications every day at 2:00 AM
	cron.schedule('0 2 * * *', async () => {
		logger.info('Running scheduled notification cleanup job');
		await cleanupOldNotifications();
	});

	logger.info('Cron jobs initialized successfully');
	logger.info('Schedule:');
	logger.info('  - Reminders: Every hour');
	logger.info('  - Insurance expiry: Daily at 8:00 AM');
	logger.info('  - PUCC expiry: Daily at 8:30 AM');
	logger.info('  - Cleanup: Daily at 2:00 AM');
}

// Export individual functions for testing purposes
export { processReminders, processInsuranceExpiry, processPuccExpiry, cleanupOldNotifications };
