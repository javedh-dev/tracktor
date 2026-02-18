import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { testEmailProvider } from '$server/services/emailNotificationService';
import { getProviderById } from '$server/services/notificationProviderService';
import { AppError } from '$server/exceptions/AppError';
import { ZodError } from 'zod';
import type { EmailProviderConfig } from '$lib/domain/notification-provider';

export const POST: RequestHandler = async (event) => {
	try {
		const body = event.locals.requestBody || (await event.request.json());
		const providerId = event.params.id;

		if (!providerId) {
			throw error(400, 'Provider ID is required');
		}

		if (!body.testEmail) {
			throw error(400, 'Test email address is required');
		}

		// Get the provider
		const result = await getProviderById(providerId);
		const provider = result.data;

		if (provider.config.type !== 'email') {
			throw error(400, 'Only email providers can be tested with this endpoint');
		}

		if (!provider.isEnabled) {
			throw error(400, 'Provider is disabled');
		}

		// Send test email
		const testResult = await testEmailProvider(
			provider.config as EmailProviderConfig,
			body.testEmail
		);

		return json({
			success: testResult.success,
			message: testResult.success
				? 'Test email sent successfully'
				: `Failed to send test email: ${testResult.error}`,
			data: testResult
		});
	} catch (err) {
		console.error('Test email error:', err);

		if (err instanceof ZodError) {
			throw error(400, `Validation error: ${err.issues.map((e) => e.message).join(', ')}`);
		}

		if (err instanceof AppError) {
			throw error(err.status, err.message);
		}

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Internal server error');
	}
};
