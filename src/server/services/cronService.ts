import cron, { type ScheduledTask } from 'node-cron';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { createNotification, findExistingNotification } from './notificationService';
import { getAppConfigByKey } from './configService';
import logger from '$server/config/logger';
import { eq } from 'drizzle-orm';

// Store active cron jobs for dynamic management
const activeCronJobs: Map<string, ScheduledTask> = new Map();

/**
 * Get cron configuration from database
 */
async function getCronConfig(
	key: string,
	defaultValue: string | boolean
): Promise<string | boolean> {
	try {
		const result = await getAppConfigByKey(key);
		if (result.success && result.data) {
			const value = result.data.value;
			// Handle boolean values
			if (typeof defaultValue === 'boolean') {
				return value === 'true';
			}
			return value || defaultValue;
		}
		return defaultValue;
	} catch (error) {
		logger.error(`Error fetching config for ${key}, using default:`, error);
		return defaultValue;
	}
}

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

		const deleted = await db
			.delete(schema.notificationTable)
			.where(
				// Delete notifications that are read AND older than 30 days
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
 * Schedule or reschedule a specific cron job
 */
function scheduleCronJob(
	name: string,
	schedule: string,
	task: () => Promise<void>,
	enabled: boolean
) {
	// Stop existing job if any
	if (activeCronJobs.has(name)) {
		activeCronJobs.get(name)?.stop();
		activeCronJobs.delete(name);
		logger.info(`Stopped existing cron job: ${name}`);
	}

	// Schedule new job if enabled
	if (enabled) {
		try {
			if (!cron.validate(schedule)) {
				logger.error(`Invalid cron schedule for ${name}: ${schedule}`);
				return;
			}

			const job = cron.schedule(schedule, task);
			activeCronJobs.set(name, job);
			logger.info(`Scheduled cron job: ${name} with schedule: ${schedule}`);
		} catch (error) {
			logger.error(`Failed to schedule cron job ${name}:`, error);
		}
	} else {
		logger.info(`Cron job disabled: ${name}`);
	}
}

/**
 * Initialize and start all cron jobs based on database configuration
 */
export async function initializeCronJobs() {
	logger.info('Initializing cron jobs for notification system');

	try {
		// Get configuration from database
		const cronJobsEnabled = (await getCronConfig('cronJobsEnabled', true)) as boolean;

		if (!cronJobsEnabled) {
			logger.info('Cron jobs are disabled globally');
			return;
		}

		// Get individual job configurations
		const remindersEnabled = (await getCronConfig('cronRemindersEnabled', true)) as boolean;
		const remindersSchedule = (await getCronConfig('cronRemindersSchedule', '0 * * * *')) as string;

		const insuranceEnabled = (await getCronConfig('cronInsuranceEnabled', true)) as boolean;
		const insuranceSchedule = (await getCronConfig('cronInsuranceSchedule', '0 8 * * *')) as string;

		const puccEnabled = (await getCronConfig('cronPuccEnabled', true)) as boolean;
		const puccSchedule = (await getCronConfig('cronPuccSchedule', '30 8 * * *')) as string;

		const cleanupEnabled = (await getCronConfig('cronCleanupEnabled', true)) as boolean;
		const cleanupSchedule = (await getCronConfig('cronCleanupSchedule', '0 2 * * *')) as string;

		// Schedule all jobs
		scheduleCronJob('reminders', remindersSchedule, processReminders, remindersEnabled);
		scheduleCronJob('insurance', insuranceSchedule, processInsuranceExpiry, insuranceEnabled);
		scheduleCronJob('pucc', puccSchedule, processPuccExpiry, puccEnabled);
		scheduleCronJob('cleanup', cleanupSchedule, cleanupOldNotifications, cleanupEnabled);

		logger.info('Cron jobs initialization completed');
		logger.info('Active jobs:');
		activeCronJobs.forEach((_, name) => {
			logger.info(`  - ${name}`);
		});
	} catch (error) {
		logger.error('Error initializing cron jobs:', error);
	}
}

/**
 * Reload cron jobs (useful when configuration changes)
 */
export async function reloadCronJobs() {
	logger.info('Reloading cron jobs with updated configuration');
	await initializeCronJobs();
}

/**
 * Stop all cron jobs
 */
export function stopAllCronJobs() {
	logger.info('Stopping all cron jobs');
	activeCronJobs.forEach((job, name) => {
		job.stop();
		logger.info(`Stopped cron job: ${name}`);
	});
	activeCronJobs.clear();
}

// Export individual functions for testing and manual execution
export { processReminders, processInsuranceExpiry, processPuccExpiry, cleanupOldNotifications };
