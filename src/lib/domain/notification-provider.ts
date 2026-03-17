import { z } from 'zod';
import { NOTIFICATION_CHANNELS } from './notification';

export const notificationProviderTypeSchema = z.enum(['email', 'webhook', 'gotify']);

const notificationChannelOptions = Object.keys(
  NOTIFICATION_CHANNELS
) as (keyof typeof NOTIFICATION_CHANNELS)[];

export const notificationProviderChannelsSchema = z
  .array(
    z.enum(
      notificationChannelOptions as [
        keyof typeof NOTIFICATION_CHANNELS,
        ...Array<keyof typeof NOTIFICATION_CHANNELS>
      ]
    )
  )
  .min(1, 'Select at least one channel');

export type NotificationProviderType = z.infer<typeof notificationProviderTypeSchema>;
export type NotificationChannel = keyof typeof NOTIFICATION_CHANNELS;

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
  channels: notificationProviderChannelsSchema,
  isEnabled: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string()
});

export type NotificationProvider = z.infer<typeof notificationProviderSchema>;

export const createNotificationProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required').max(100),
  type: notificationProviderTypeSchema,
  config: notificationProviderConfigSchema,
  channels: notificationProviderChannelsSchema,
  isEnabled: z.boolean().default(true)
});

export type CreateNotificationProvider = z.infer<typeof createNotificationProviderSchema>;

const emailProviderConfigUpdateSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  auth: z.object({
    user: z.email('Valid email is required'),
    pass: z.string()
  }),
  from: z.email('Valid sender email is required'),
  fromName: z.string().optional(),
  recepient: z.email('Valid reply-to email is required').optional()
});

const gotifyProviderConfigUpdateSchema = z.object({
  serverUrl: z.string().url('Valid Gotify server URL is required'),
  appToken: z.string(),
  priority: z.number().int().min(0).max(10).default(5)
});

const notificationProviderConfigUpdateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    ...emailProviderConfigUpdateSchema.shape
  }),
  z.object({
    type: z.literal('webhook'),
    ...webhookProviderConfigSchema.shape
  }),
  z.object({
    type: z.literal('gotify'),
    ...gotifyProviderConfigUpdateSchema.shape
  })
]);

export const updateNotificationProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required').max(100).optional(),
  config: notificationProviderConfigUpdateSchema.optional(),
  channels: notificationProviderChannelsSchema.optional(),
  isEnabled: z.boolean().optional()
});

export type UpdateNotificationProvider = z.infer<typeof updateNotificationProviderSchema>;

export interface NotificationProviderWithParsedConfig extends Omit<NotificationProvider, 'config'> {
  config: NotificationProviderConfig;
}
