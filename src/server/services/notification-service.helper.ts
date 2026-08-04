import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_SOURCES,
  NOTIFICATION_TYPES
} from '$lib/domain/notification';

type NotificationType = keyof typeof NOTIFICATION_TYPES;
type NotificationSource = keyof typeof NOTIFICATION_SOURCES;
type NotificationChannel = keyof typeof NOTIFICATION_CHANNELS;

export type GeneratedNotification = {
  vehicleId: string;
  type: NotificationType;
  channel: NotificationChannel;
  message: string;
  source: NotificationSource;
  dueDate: string;
  notificationKey: string;
};

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { channel: NotificationChannel; label: string; color: string }
> = {
  reminder: { channel: 'reminder', label: 'Reminders', color: '#2563eb' },
  alert: { channel: 'alert', label: 'Alerts', color: '#dc2626' },
  information: { channel: 'information', label: 'Information', color: '#0284c7' },
  maintenance: { channel: 'information', label: 'Maintenance', color: '#7c3aed' },
  compliance: { channel: 'alert', label: 'Compliance', color: '#059669' },
  registration: { channel: 'alert', label: 'Registration', color: '#ea580c' }
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

export function isReminderAvailable(dueDate: Date, remindSchedule: string): boolean {
  const today = toDateOnly(new Date());
  const notificationDate = toDateOnly(calculateReminderNotificationDate(dueDate, remindSchedule));

  return notificationDate <= today;
}

export function formatReminderMessage(type: string, note: string | null, dueDate: Date): string {
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  const dueDateFormatted = dueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return `${typeLabel} reminder${note ? `: ${note}` : ''} (Due: ${dueDateFormatted})`;
}

export function getDaysUntil(targetDate: Date): number {
  const today = toDateOnly(new Date());
  const target = toDateOnly(targetDate);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatExpiryMessage(
  label: string,
  identifier: string,
  daysUntilExpiry: number
): string {
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

export function sortNotificationsByDueDate(
  notifications: GeneratedNotification[]
): GeneratedNotification[] {
  return notifications.sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
}
