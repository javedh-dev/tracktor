import type { ApiResponse } from '$lib';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SOURCES,
  NOTIFICATION_TYPES
} from '$lib/domain/notification';
import { and, eq, inArray } from 'drizzle-orm';

import { db } from '$server/db';
import * as schema from '$server/db/schema';

type NotificationType = keyof typeof NOTIFICATION_TYPES;
type NotificationSource = keyof typeof NOTIFICATION_SOURCES;
type NotificationChannel = keyof typeof NOTIFICATION_CHANNELS;

type GeneratedNotification = {
  vehicleId: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  source: NotificationSource;
  dueDate: string;
  notificationKey: string;
};

const CHANNEL_BY_TYPE: Record<NotificationType, NotificationChannel> = {
  reminder: 'reminder',
  alert: 'alert',
  maintenance: 'information',
  insurance: 'alert',
  pollution: 'alert',
  registration: 'alert',
  information: 'information'
};

function toDateOnly(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function calculateReminderNotificationDate(dueDate: Date, remindSchedule: string): Date {
  const notificationDate = new Date(dueDate);

  switch (remindSchedule) {
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

function isReminderAvailable(dueDate: Date, remindSchedule: string): boolean {
  const today = toDateOnly(new Date());
  const notificationDate = toDateOnly(calculateReminderNotificationDate(dueDate, remindSchedule));

  return notificationDate <= today;
}

function formatReminderMessage(type: string, note: string | null, dueDate: Date): string {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return `${typeLabel} reminder${note ? `: ${note}` : ''} (Due: ${dueDateFormatted})`;
}

function getDaysUntil(targetDate: Date): number {
  const today = toDateOnly(new Date());
  const target = toDateOnly(targetDate);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatExpiryMessage(label: string, identifier: string, daysUntilExpiry: number): string {
  if (daysUntilExpiry < 0) {
    return `${label} ${identifier} expired ${Math.abs(daysUntilExpiry)} day${
      Math.abs(daysUntilExpiry) === 1 ? '' : 's'
    } ago`;
  }

  if (daysUntilExpiry === 0) {
    return `${label} ${identifier} expires today`;
  }

  if (daysUntilExpiry === 1) {
    return `${label} ${identifier} expires tomorrow`;
  }

  return `${label} ${identifier} expires in ${daysUntilExpiry} days`;
}

async function buildReminderNotifications(vehicleId: string): Promise<GeneratedNotification[]> {
  const reminders = await db.query.reminderTable.findMany({
    where: (reminder, { and, eq }) =>
      and(eq(reminder.vehicleId, vehicleId), eq(reminder.isCompleted, false))
  });

  return reminders
    .filter((reminder) => isReminderAvailable(new Date(reminder.dueDate), reminder.remindSchedule))
    .map((reminder) => {
      const dueDate = new Date(reminder.dueDate);

      return {
        vehicleId,
        type: 'reminder',
        channel: CHANNEL_BY_TYPE.reminder,
        message: formatReminderMessage(reminder.type, reminder.note, dueDate),
        source: 'system',
        dueDate: dueDate.toISOString(),
        notificationKey: `reminder:${reminder.id}:${reminder.remindSchedule}`
      };
    });
}

async function buildInsuranceNotifications(vehicleId: string): Promise<GeneratedNotification[]> {
  const policies = await db.query.insuranceTable.findMany({
    where: (insurance, { eq }) => eq(insurance.vehicleId, vehicleId)
  });

  return policies
    .filter((policy) => policy.endDate)
    .flatMap((policy) => {
      const expiryDate = new Date(policy.endDate!);
      const daysUntilExpiry = getDaysUntil(expiryDate);

      if (daysUntilExpiry > 30) {
        return [];
      }

      return {
        vehicleId,
        type: 'insurance' as const,
        channel: CHANNEL_BY_TYPE.insurance,
        message: formatExpiryMessage('Insurance policy', policy.policyNumber, daysUntilExpiry),
        source: 'system' as const,
        dueDate: expiryDate.toISOString(),
        notificationKey: `insurance:${policy.id}:${policy.endDate}`
      };
    });
}

async function buildPuccNotifications(vehicleId: string): Promise<GeneratedNotification[]> {
  const certificates = await db.query.pollutionCertificateTable.findMany({
    where: (certificate, { eq }) => eq(certificate.vehicleId, vehicleId)
  });

  return certificates
    .filter((certificate) => certificate.expiryDate)
    .flatMap((certificate) => {
      const expiryDate = new Date(certificate.expiryDate!);
      const daysUntilExpiry = getDaysUntil(expiryDate);

      if (daysUntilExpiry > 30) {
        return [];
      }

      return {
        vehicleId,
        type: 'pollution' as const,
        channel: CHANNEL_BY_TYPE.pollution,
        message: formatExpiryMessage(
          'PUCC certificate',
          certificate.certificateNumber,
          daysUntilExpiry
        ),
        source: 'system' as const,
        dueDate: expiryDate.toISOString(),
        notificationKey: `pollution:${certificate.id}:${certificate.expiryDate}`
      };
    });
}

async function buildAvailableNotifications(vehicleId: string): Promise<GeneratedNotification[]> {
  const [reminders, insurances, puccCertificates] = await Promise.all([
    buildReminderNotifications(vehicleId),
    buildInsuranceNotifications(vehicleId),
    buildPuccNotifications(vehicleId)
  ]);

  return [...reminders, ...insurances, ...puccCertificates].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}

async function removeStaleNotifications(vehicleId: string, activeKeys: Set<string>): Promise<void> {
  const existingNotifications = await db.query.notificationTable.findMany({
    where: (notification, { and, eq }) =>
      and(eq(notification.vehicleId, vehicleId), eq(notification.source, 'system'))
  });

  const staleIds = existingNotifications
    .filter(
      (notification) =>
        !notification.notificationKey || !activeKeys.has(notification.notificationKey)
    )
    .map((notification) => notification.id);

  if (staleIds.length === 0) {
    return;
  }

  await db.delete(schema.notificationTable).where(inArray(schema.notificationTable.id, staleIds));
}

export async function syncVehicleNotifications(vehicleId: string): Promise<void> {
  const availableNotifications = await buildAvailableNotifications(vehicleId);
  const activeKeys = new Set(
    availableNotifications.map((notification) => notification.notificationKey)
  );

  for (const notification of availableNotifications) {
    const existing = await db.query.notificationTable.findFirst({
      where: (record, { and, eq }) =>
        and(
          eq(record.vehicleId, vehicleId),
          eq(record.source, notification.source),
          eq(record.notificationKey, notification.notificationKey)
        )
    });

    if (existing) {
      await db
        .update(schema.notificationTable)
        .set({
          type: notification.type,
          channel: notification.channel,
          message: notification.message,
          dueDate: notification.dueDate
        })
        .where(eq(schema.notificationTable.id, existing.id));
      continue;
    }

    await db.insert(schema.notificationTable).values({
      vehicleId: notification.vehicleId,
      type: notification.type,
      channel: notification.channel,
      message: notification.message,
      source: notification.source,
      dueDate: notification.dueDate,
      notificationKey: notification.notificationKey,
      isRead: false,
      clearedAt: null
    });
  }

  await removeStaleNotifications(vehicleId, activeKeys);
}

export async function syncAllNotifications(): Promise<void> {
  const vehicles = await db.query.vehicleTable.findMany();

  for (const vehicle of vehicles) {
    await syncVehicleNotifications(vehicle.id);
  }
}

export const getNotifications = async (vehicleId: string): Promise<ApiResponse> => {
  await syncVehicleNotifications(vehicleId);

  const notifications = await db.query.notificationTable.findMany({
    where: (notification, { and, eq, isNull }) =>
      and(eq(notification.vehicleId, vehicleId), isNull(notification.clearedAt)),
    orderBy: (notification, { asc, desc }) => [
      asc(notification.isRead),
      asc(notification.dueDate),
      desc(notification.created_at)
    ]
  });

  return {
    data: notifications,
    success: true
  };
};

export const getPendingNotificationsForChannels = async (
  channels: NotificationChannel[]
): Promise<ApiResponse> => {
  await syncAllNotifications();

  const notifications = await db.query.notificationTable.findMany({
    where: (notification, { and, eq, inArray, isNull }) =>
      and(
        inArray(notification.channel, channels),
        eq(notification.isRead, false),
        isNull(notification.clearedAt)
      ),
    orderBy: (notification, { asc }) => [asc(notification.dueDate), asc(notification.created_at)]
  });

  return {
    data: notifications,
    success: true
  };
};

export const clearNotification = async (notificationId: string): Promise<ApiResponse> => {
  const existingNotification = await db.query.notificationTable.findFirst({
    where: (notification, { eq }) => eq(notification.id, notificationId)
  });

  if (!existingNotification) {
    return {
      data: null,
      success: false,
      message: 'Notification not found.'
    };
  }

  if (existingNotification.channel === 'alert') {
    return {
      data: null,
      success: false,
      message: 'Alert notifications cannot be cleared.'
    };
  }

  const clearedNotifications = await db
    .update(schema.notificationTable)
    .set({ clearedAt: new Date().toISOString() })
    .where(eq(schema.notificationTable.id, notificationId))
    .returning();

  return {
    data: clearedNotifications[0],
    success: true,
    message: 'Notification cleared successfully.'
  };
};

export const markNotificationAsRead = async (notificationId: string): Promise<ApiResponse> => {
  const updatedNotification = await db
    .update(schema.notificationTable)
    .set({ isRead: true })
    .where(eq(schema.notificationTable.id, notificationId))
    .returning();

  if (updatedNotification.length === 0) {
    return {
      data: null,
      success: false,
      message: 'Notification not found.'
    };
  }

  return {
    data: updatedNotification[0],
    success: true,
    message: 'Notification marked as read.'
  };
};

export const markAllNotificationsAsRead = async (vehicleId: string): Promise<ApiResponse> => {
  await syncVehicleNotifications(vehicleId);

  const updatedNotifications = await db
    .update(schema.notificationTable)
    .set({ isRead: true })
    .where(
      and(
        eq(schema.notificationTable.vehicleId, vehicleId),
        eq(schema.notificationTable.isRead, false)
      )
    )
    .returning();

  return {
    data: updatedNotifications,
    success: true,
    message: 'All notifications marked as read.'
  };
};
