import { db } from '$server/db';
import { sendEmail } from './emailNotificationService';
import {
	groupNotifications,
	generatePlainTextDigest,
	generateHtmlDigest
} from './emailTemplateService';
import { getAppConfigByKey } from './configService';
import logger from '$server/config/logger';
import type { Notification } from '$lib/domain/notification';

/**
 * Get the user's notification email from config
 */
async function getNotificationEmail(): Promise<string | null> {
	try {
		const result = await getAppConfigByKey('notificationEmail');
		if (result.success && result.data && result.data.value) {
			return result.data.value;
		}
		return null;
	} catch (error) {
		logger.debug('No notification email configured');
		return null;
	}
}

/**
 * Get all unread notifications from the database
 */
async function getUnreadNotifications(): Promise<Notification[]> {
	const notifications = await db.query.notificationTable.findMany({
		where: (n, { eq }) => eq(n.isRead, 0), // SQLite uses 0 for false
		orderBy: (n, { asc }) => [asc(n.dueDate), asc(n.created_at)]
	});

	// Convert database format to Notification type
	return notifications.map((n) => ({
		...n,
		isRead: n.isRead === 1
	})) as Notification[];
}

/**
 * Send a cumulated email digest of all pending notifications
 */
export async function sendNotificationDigest(): Promise<{
	success: boolean;
	notificationCount: number;
	error?: string;
}> {
	try {
		logger.info('Starting notification digest job');

		// Get the notification email
		const recipientEmail = await getNotificationEmail();

		if (!recipientEmail) {
			logger.info('No notification email configured, skipping digest');
			return {
				success: true,
				notificationCount: 0,
				error: 'No notification email configured'
			};
		}

		// Get all unread notifications
		const notifications = await getUnreadNotifications();

		if (notifications.length === 0) {
			logger.info('No unread notifications to send');
			return {
				success: true,
				notificationCount: 0
			};
		}

		logger.info(`Found ${notifications.length} unread notifications to send`);

		// Group notifications by type
		const groups = groupNotifications(notifications);

		// Generate email content
		const plainText = generatePlainTextDigest(groups, notifications.length);
		const html = generateHtmlDigest(groups, notifications.length);

		// Send the email
		const result = await sendEmail({
			to: recipientEmail,
			subject: `Tracktor: ${notifications.length} Pending Notification${notifications.length !== 1 ? 's' : ''}`,
			text: plainText,
			html
		});

		if (result.success) {
			logger.info(
				`Successfully sent notification digest to ${recipientEmail} with ${notifications.length} notifications`
			);
		} else {
			logger.error(`Failed to send notification digest: ${result.error}`);
		}

		return {
			success: result.success,
			notificationCount: notifications.length,
			error: result.error
		};
	} catch (error) {
		const err = error as Error;
		logger.error('Error in sendNotificationDigest:', err);
		return {
			success: false,
			notificationCount: 0,
			error: err.message
		};
	}
}

/**
 * Get notification summary statistics
 */
export async function getNotificationSummary(): Promise<{
	total: number;
	byType: Record<string, number>;
	urgent: number; // Due within 7 days
}> {
	const notifications = await getUnreadNotifications();

	const byType: Record<string, number> = {};
	let urgent = 0;

	const now = new Date();
	const sevenDaysFromNow = new Date();
	sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

	notifications.forEach((notification) => {
		// Count by type
		byType[notification.type] = (byType[notification.type] || 0) + 1;

		// Count urgent (due within 7 days)
		const dueDate =
			typeof notification.dueDate === 'string'
				? new Date(notification.dueDate)
				: notification.dueDate;

		if (dueDate <= sevenDaysFromNow) {
			urgent++;
		}
	});

	return {
		total: notifications.length,
		byType,
		urgent
	};
}
