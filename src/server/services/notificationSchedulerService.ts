import cron, { type ScheduledTask } from 'node-cron';

import logger from '$server/config/logger';

import { getAppConfigByKey } from './configService';
import { dispatchScheduledNotifications } from './notificationDispatchService';

let scheduledTask: ScheduledTask | null = null;

async function getNotificationProcessingSchedule(): Promise<string> {
  try {
    const result = await getAppConfigByKey('notificationProcessingSchedule');
    if (result.success && result.data?.value) {
      return result.data.value;
    }
  } catch {
    // Fallback to default below.
  }

  return '0 9 * * *';
}

async function isNotificationProcessingEnabled(): Promise<boolean> {
  try {
    const result = await getAppConfigByKey('notificationProcessingEnabled');
    if (result.success && result.data?.value !== undefined) {
      return result.data.value === 'true';
    }
  } catch {
    // Fallback to enabled below.
  }

  return true;
}

export async function processScheduledNotifications(): Promise<void> {
  const result = await dispatchScheduledNotifications();

  if (result.success) {
    logger.info('Scheduled notification processing completed', {
      notificationCount: result.notificationCount,
      providerCount: result.providerCount
    });
    return;
  }

  logger.error('Scheduled notification processing finished with failures', {
    results: result.results
  });
}

export async function initializeNotificationScheduler(): Promise<void> {
  const enabled = await isNotificationProcessingEnabled();
  const schedule = await getNotificationProcessingSchedule();

  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }

  if (!enabled) {
    logger.info('Notification scheduler disabled');
    return;
  }

  if (!cron.validate(schedule)) {
    logger.error('Invalid notification schedule expression', {
      schedule
    });
    return;
  }

  scheduledTask = cron.schedule(schedule, () => {
    processScheduledNotifications().catch((error) => {
      logger.error('Failed to process scheduled notifications', { error });
    });
  });

  logger.info('Notification scheduler initialized', { schedule });
}

export async function reloadNotificationScheduler(): Promise<void> {
  await initializeNotificationScheduler();
}

export function stopNotificationScheduler(): void {
  if (!scheduledTask) {
    return;
  }

  scheduledTask.stop();
  scheduledTask = null;
  logger.info('Notification scheduler stopped');
}
