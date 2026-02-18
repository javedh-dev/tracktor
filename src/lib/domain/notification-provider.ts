import { z } from 'zod';

export const notificationProviderTypeSchema = z.enum(['email', 'sms', 'push', 'webhook']);

export type NotificationProviderType = z.infer<typeof notificationProviderTypeSchema>;

// Email Provider Configuration
export const emailProviderConfigSchema = z.object({
	host: z.string().min(1, 'SMTP host is required'),
	port: z.number().int().min(1).max(65535),
	secure: z.boolean(),
	auth: z.object({
		user: z.string().email('Valid email is required'),
		pass: z.string().min(1, 'Password is required')
	}),
	from: z.string().email('Valid sender email is required'),
	fromName: z.string().optional(),
	replyTo: z.string().email('Valid reply-to email is required').optional()
});

export type EmailProviderConfig = z.infer<typeof emailProviderConfigSchema>;

// SMS Provider Configuration (e.g., Twilio, AWS SNS)
export const smsProviderConfigSchema = z.object({
	provider: z.enum(['twilio', 'aws-sns', 'nexmo', 'other']),
	apiKey: z.string().min(1, 'API key is required'),
	apiSecret: z.string().min(1, 'API secret is required'),
	fromNumber: z.string().min(1, 'From phone number is required'),
	endpoint: z.string().url().optional()
});

export type SmsProviderConfig = z.infer<typeof smsProviderConfigSchema>;

// Push Notification Provider Configuration (e.g., FCM, APNS)
export const pushProviderConfigSchema = z.object({
	provider: z.enum(['fcm', 'apns', 'onesignal', 'other']),
	apiKey: z.string().min(1, 'API key is required'),
	appId: z.string().optional(),
	endpoint: z.string().url().optional(),
	credentials: z.record(z.string(), z.any()).optional()
});

export type PushProviderConfig = z.infer<typeof pushProviderConfigSchema>;

// Webhook Provider Configuration
export const webhookProviderConfigSchema = z.object({
	url: z.string().url('Valid webhook URL is required'),
	method: z.enum(['POST', 'PUT', 'PATCH']).default('POST'),
	headers: z.record(z.string(), z.string()).optional(),
	authType: z.enum(['none', 'basic', 'bearer', 'api-key']).default('none'),
	authCredentials: z
		.object({
			username: z.string().optional(),
			password: z.string().optional(),
			token: z.string().optional(),
			apiKey: z.string().optional(),
			apiKeyHeader: z.string().optional()
		})
		.optional()
});

export type WebhookProviderConfig = z.infer<typeof webhookProviderConfigSchema>;

// Discriminated union for all provider configs
export const notificationProviderConfigSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('email'),
		...emailProviderConfigSchema.shape
	}),
	z.object({
		type: z.literal('sms'),
		...smsProviderConfigSchema.shape
	}),
	z.object({
		type: z.literal('push'),
		...pushProviderConfigSchema.shape
	}),
	z.object({
		type: z.literal('webhook'),
		...webhookProviderConfigSchema.shape
	})
]);

export type NotificationProviderConfig = z.infer<typeof notificationProviderConfigSchema>;

export const notificationProviderSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, 'Provider name is required').max(100),
	type: notificationProviderTypeSchema,
	config: z.string(), // JSON string stored in DB
	isEnabled: z.boolean().default(true),
	isDefault: z.boolean().default(false),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime()
});

export type NotificationProvider = z.infer<typeof notificationProviderSchema>;

export const createNotificationProviderSchema = z.object({
	name: z.string().min(1, 'Provider name is required').max(100),
	type: notificationProviderTypeSchema,
	config: notificationProviderConfigSchema,
	isEnabled: z.boolean().default(true),
	isDefault: z.boolean().default(false)
});

export type CreateNotificationProvider = z.infer<typeof createNotificationProviderSchema>;

export const updateNotificationProviderSchema = z.object({
	name: z.string().min(1, 'Provider name is required').max(100).optional(),
	config: notificationProviderConfigSchema.optional(),
	isEnabled: z.boolean().optional(),
	isDefault: z.boolean().optional()
});

export type UpdateNotificationProvider = z.infer<typeof updateNotificationProviderSchema>;

export interface NotificationProviderWithParsedConfig extends Omit<NotificationProvider, 'config'> {
	config: NotificationProviderConfig;
}
