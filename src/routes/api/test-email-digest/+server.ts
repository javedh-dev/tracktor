import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { sendNotificationDigest } from '$server/services/notificationDigestService';
import logger from '$server/config/logger';

/**
 * Test endpoint to manually trigger email digest
 * Useful for debugging and testing the email notification system
 */
export const POST: RequestHandler = async () => {
	try {
		logger.info('Manual email digest trigger via API');

		const result = await sendNotificationDigest();

		return json({
			success: result.success,
			message: result.success
				? `Email digest sent successfully with ${result.notificationCount} notifications`
				: `Failed to send email digest: ${result.error}`,
			data: {
				notificationCount: result.notificationCount,
				error: result.error
			}
		});
	} catch (error) {
		const err = error as Error;
		logger.error('Error in manual email digest trigger:', err);

		return json(
			{
				success: false,
				message: `Error triggering email digest: ${err.message}`,
				error: err.message
			},
			{ status: 500 }
		);
	}
};
