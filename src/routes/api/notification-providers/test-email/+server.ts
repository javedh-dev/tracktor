import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { testEmailProvider } from '$server/services/emailNotificationService';
import { AppError } from '$server/exceptions/AppError';
import { emailProviderConfigSchema } from '$lib/domain/notification-provider';
import { ZodError } from 'zod';

export const POST: RequestHandler = async (event) => {
	try {
		const body = event.locals.requestBody || (await event.request.json());

		if (!body.config || !body.testEmail) {
			throw error(400, 'Provider config and test email are required');
		}

		// Validate the config
		const validatedConfig = emailProviderConfigSchema.parse(body.config);

		// Send test email
		const result = await testEmailProvider(validatedConfig, body.testEmail);

		return json({
			success: result.success,
			message: result.success
				? 'Test email sent successfully'
				: `Failed to send test email: ${result.error}`,
			data: result
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
