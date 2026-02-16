import { z } from 'zod';

export const notificationProviderTypeSchema = z.enum(['email']);

export type NotificationProviderType = z.infer<typeof notificationProviderTypeSchema>;

export const emailProviderConfigSchema = z.object({
	host: z.string().min(1, 'SMTP host is required'),
	port: z.number().int().min(1).max(65535),
	secure: z.boolean(),
	auth: z.object({
		user: z.string().email('Valid email is required'),
		pass: z.string().min(1, 'Password is required')
	}),
	from: z.string().email('Valid sender email is required'),
	fromName: z.string().optional()
});

export type EmailProviderConfig = z.infer<typeof emailProviderConfigSchema>;

export const notificationProviderConfigSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('email'),
		...emailProviderConfigSchema.shape
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
