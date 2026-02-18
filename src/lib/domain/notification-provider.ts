import { z } from 'zod';

export const notificationProviderTypeSchema = z.enum(['email', 'webhook', 'gotify']);

export type NotificationProviderType = z.infer<typeof notificationProviderTypeSchema>;

// Email Provider Configuration
export const emailProviderConfigSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  auth: z.object({
    user: z.email('Valid email is required'),
    pass: z.string().min(1, 'Password is required')
  }),
  from: z.email('Valid sender email is required'),
  fromName: z.string().optional(),
  recepient: z.email('Valid reply-to email is required').optional()
});

export type EmailProviderConfig = z.infer<typeof emailProviderConfigSchema>;

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

// Gotify Provider Configuration
export const gotifyProviderConfigSchema = z.object({
  serverUrl: z.string().url('Valid Gotify server URL is required'),
  appToken: z.string().min(1, 'App token is required'),
  priority: z.number().int().min(0).max(10).default(5)
});

export type GotifyProviderConfig = z.infer<typeof gotifyProviderConfigSchema>;

// Discriminated union for all provider configs
export const notificationProviderConfigSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    ...emailProviderConfigSchema.shape
  }),
  z.object({
    type: z.literal('webhook'),
    ...webhookProviderConfigSchema.shape
  }),
  z.object({
    type: z.literal('gotify'),
    ...gotifyProviderConfigSchema.shape
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
