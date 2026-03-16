import cron, { type ScheduledTask } from 'node-cron';

import logger from '$server/config/logger';

import { getAppConfigByKey } from './configService';
import { dispatchScheduledNotifications } from './notificationDispatchService';

let scheduledTask: ScheduledTask | null = null;

function toCronExpression(time: string): string {
  const [hours, minutes] = time.split(':').map((value) => Number.parseInt(value, 10));

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return '0 9 * * *';
  }

  return `${minutes} ${hours} * * *`;
}

async function getNotificationProcessingTime(): Promise<string> {
  try {
    const result = await getAppConfigByKey('notificationProcessingTime');
    if (result.success && result.data?.value) {
      return result.data.value;
    }
  } catch {
    // Fallback to default below.
  }

  return '09:00';
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
  const time = await getNotificationProcessingTime();
  const schedule = toCronExpression(time);

  if (scheduledTask) {
    scheduledTask.stop();
    scheduledTask = null;
  }

  if (!cron.validate(schedule)) {
    logger.error('Invalid notification schedule expression', {
      time,
      schedule
    });
    return;
  }

  scheduledTask = cron.schedule(schedule, () => {
    processScheduledNotifications().catch((error) => {
      logger.error('Failed to process scheduled notifications', { error });
    });
  });

  logger.info('Notification scheduler initialized', { time, schedule });
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
