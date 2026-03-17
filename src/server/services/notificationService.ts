import type { ApiResponse } from '$lib';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SOURCES,
  NOTIFICATION_TYPES
} from '$lib/domain/notification';
import { and, eq, inArray } from 'drizzle-orm';

import { db } from '$server/db';
import * as schema from '$server/db/schema';
import {
  formatExpiryMessage,
  formatReminderMessage,
  getDaysUntil,
  isReminderAvailable,
  sortNotificationsByDueDate,
  type GeneratedNotification
} from './notification-service.helper';

type NotificationType = keyof typeof NOTIFICATION_TYPES;
type NotificationSource = keyof typeof NOTIFICATION_SOURCES;
type NotificationChannel = keyof typeof NOTIFICATION_CHANNELS;

const CHANNEL_BY_TYPE: Record<NotificationType, NotificationChannel> = {
  reminder: 'reminder',
  alert: 'alert',
  maintenance: 'information',
  insurance: 'alert',
  pollution: 'alert',
  registration: 'alert',
  information: 'information'
};

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

  return sortNotificationsByDueDate([...reminders, ...insurances, ...puccCertificates]);
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

export const getActiveNotificationsForChannels = async (
  channels: NotificationChannel[]
): Promise<ApiResponse> => {
  await syncAllNotifications();

  const notifications = await db.query.notificationTable.findMany({
    where: (notification, { and, inArray, isNull }) =>
      and(inArray(notification.channel, channels), isNull(notification.clearedAt)),
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
