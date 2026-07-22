import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SOURCES,
  NOTIFICATION_TYPES
} from '$lib/domain/notification';
import { and, eq, inArray, sql } from 'drizzle-orm';

import { db } from '$server/db';
import * as schema from '$server/db/schema';
import {
  formatExpiryMessage,
  formatReminderMessage,
  getDaysUntil,
  isReminderAvailable,
  NOTIFICATION_TYPE_META,
  sortNotificationsByDueDate,
  type GeneratedNotification
} from './notification-service.helper';
import { AppError, Status } from '$server/exceptions/AppError';
import { getAppConfigByKey } from './configService';

type NotificationType = keyof typeof NOTIFICATION_TYPES;
type NotificationSource = keyof typeof NOTIFICATION_SOURCES;
type NotificationChannel = keyof typeof NOTIFICATION_CHANNELS;

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
        channel: NOTIFICATION_TYPE_META.reminder.channel,
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
        channel: NOTIFICATION_TYPE_META.insurance.channel,
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
        channel: NOTIFICATION_TYPE_META.pollution.channel,
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
  let puccEnabled = true;
  try {
    const puccConfig = await getAppConfigByKey('featurePucc');
    if (puccConfig?.value) puccEnabled = puccConfig.value !== 'false';
  } catch {
    // key not in DB yet — default to enabled
  }

  const [reminders, insurances, puccCertificates] = await Promise.all([
    buildReminderNotifications(vehicleId),
    buildInsuranceNotifications(vehicleId),
    puccEnabled ? buildPuccNotifications(vehicleId) : Promise.resolve([])
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
  const notifications = await buildAvailableNotifications(vehicleId);
  const activeKeys = new Set(notifications.map((n) => n.notificationKey));

  if (notifications.length > 0) {
    await db
      .insert(schema.notificationTable)
      .values(
        notifications.map((n) => ({
          vehicleId: n.vehicleId,
          type: n.type,
          channel: n.channel,
          message: n.message,
          source: n.source,
          dueDate: n.dueDate,
          notificationKey: n.notificationKey,
          isRead: false,
          clearedAt: null
        }))
      )
      .onConflictDoUpdate({
        target: schema.notificationTable.notificationKey,
        set: {
          type: sql.raw('excluded.type'),
          channel: sql.raw('excluded.channel'),
          message: sql.raw('excluded.message'),
          dueDate: sql.raw('excluded.due_date')
        }
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

export const getNotifications = async (vehicleId: string) => {
  const notifications = await db.query.notificationTable.findMany({
    where: (notification, { and, eq, isNull }) =>
      and(eq(notification.vehicleId, vehicleId), isNull(notification.clearedAt)),
    orderBy: (notification, { asc, desc }) => [
      asc(notification.isRead),
      asc(notification.dueDate),
      desc(notification.created_at)
    ]
  });

  return notifications;
};

export const getPendingNotificationsForChannels = async (channels: NotificationChannel[]) => {
  const notifications = await db.query.notificationTable.findMany({
    where: (notification, { and, eq, inArray, isNull }) =>
      and(
        inArray(notification.channel, channels),
        eq(notification.isRead, false),
        isNull(notification.clearedAt)
      ),
    orderBy: (notification, { asc }) => [asc(notification.dueDate), asc(notification.created_at)]
  });

  return notifications;
};

export const getActiveNotificationsForChannels = async (channels: NotificationChannel[]) => {
  const notifications = await db.query.notificationTable.findMany({
    where: (notification, { and, inArray, isNull }) =>
      and(inArray(notification.channel, channels), isNull(notification.clearedAt)),
    orderBy: (notification, { asc }) => [asc(notification.dueDate), asc(notification.created_at)]
  });

  return notifications;
};

export const clearNotification = async (notificationId: string) => {
  const existingNotification = await db.query.notificationTable.findFirst({
    where: (notification, { eq }) => eq(notification.id, notificationId)
  });

  if (!existingNotification) {
    throw new AppError('Notification not found.', Status.NOT_FOUND);
  }

  if (existingNotification.channel === 'alert') {
    throw new AppError('Alert notifications cannot be cleared.', Status.BAD_REQUEST);
  }

  const clearedNotifications = await db
    .update(schema.notificationTable)
    .set({ clearedAt: new Date().toISOString() })
    .where(eq(schema.notificationTable.id, notificationId))
    .returning();

  return clearedNotifications[0];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const updatedNotification = await db
    .update(schema.notificationTable)
    .set({ isRead: true })
    .where(eq(schema.notificationTable.id, notificationId))
    .returning();

  if (updatedNotification.length === 0) {
    throw new AppError('Notification not found.', Status.NOT_FOUND);
  }

  return updatedNotification[0];
};

export const markAllNotificationsAsRead = async (vehicleId: string) => {
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

  return updatedNotifications;
};
