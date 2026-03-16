import { z } from 'zod';

export const NOTIFICATION_CHANNELS = {
  reminder: 'reminder',
  alert: 'alert',
  information: 'information'
} as const;

export const NOTIFICATION_TYPES = {
  reminder: 'reminder',
  alert: 'alert',
  information: 'information',
  maintenance: 'maintenance',
  insurance: 'insurance',
  pollution: 'pollution',
  registration: 'registration'
} as const;

export const NOTIFICATION_SOURCES = {
  system: 'system',
  user: 'user'
} as const;

export interface Notification {
  id: string;
  vehicleId: string;
  channel: keyof typeof NOTIFICATION_CHANNELS;
  type: keyof typeof NOTIFICATION_TYPES;
  message: string;
  source: keyof typeof NOTIFICATION_SOURCES;
  dueDate: Date | string;
  isRead: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

const notificationChannelOptions = Object.keys(
  NOTIFICATION_CHANNELS
) as (keyof typeof NOTIFICATION_CHANNELS)[];
const notificationTypeOptions = Object.keys(
  NOTIFICATION_TYPES
) as (keyof typeof NOTIFICATION_TYPES)[];
const notificationSourceOptions = Object.keys(
  NOTIFICATION_SOURCES
) as (keyof typeof NOTIFICATION_SOURCES)[];

export const notificationSchema = z.object({
  id: z.string().min(1),
  vehicleId: z.string().uuid(),
  channel: z.enum(
    notificationChannelOptions as [
      keyof typeof NOTIFICATION_CHANNELS,
      ...Array<keyof typeof NOTIFICATION_CHANNELS>
    ]
  ),
  type: z.enum(
    notificationTypeOptions as [
      keyof typeof NOTIFICATION_TYPES,
      ...Array<keyof typeof NOTIFICATION_TYPES>
    ]
  ),
  message: z.string().min(1, 'Message is required'),
  source: z.enum(
    notificationSourceOptions as [
      keyof typeof NOTIFICATION_SOURCES,
      ...Array<keyof typeof NOTIFICATION_SOURCES>
    ]
  ),
  dueDate: z.string(),
  isRead: z.boolean().default(false),
  created_at: z.string(),
  updated_at: z.string()
});

export type NotificationSchema = typeof notificationSchema;
