import type { Notification } from '$lib/domain/notification';
import { env } from '$lib/config/env.server';

export interface NotificationGroup {
  type: string;
  notifications: Notification[];
  label: string;
  color: string;
}

/**
 * Group notifications by type
 */
export function groupNotifications(notifications: Notification[]): NotificationGroup[] {
  const groups: Record<string, Notification[]> = {};

  notifications.forEach((notification) => {
    if (!groups[notification.type]) {
      groups[notification.type] = [];
    }
    groups[notification.type].push(notification);
  });

  return Object.entries(groups).map(([type, notifs]) => ({
    type,
    notifications: notifs,
    ...getTypeMetadata(type)
  }));
}

/**
 * Get metadata for notification type (label, icon, colors)
 */
function getTypeMetadata(type: string): {
  label: string;
  color: string;
} {
  const metadata: Record<string, { label: string; color: string }> = {
    reminder: {
      label: 'Reminders',
      color: '#2563eb'
    },
    alert: {
      label: 'Alerts',
      color: '#dc2626'
    },
    information: {
      label: 'Information',
      color: '#0284c7'
    },
    maintenance: {
      label: 'Maintenance',
      color: '#7c3aed'
    },
    insurance: {
      label: 'Insurance',
      color: '#059669'
    },
    pollution: {
      label: 'Pollution Certificate',
      color: '#0891b2'
    },
    registration: {
      label: 'Registration',
      color: '#ea580c'
    }
  };

  return (
    metadata[type] || {
      label: type.charAt(0).toUpperCase() + type.slice(1),
      color: '#6b7280'
    }
  );
}

/**
 * Format a date in a human-readable format
 */
function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate days until due date
 */
function getDaysUntilDue(dueDate: string | Date): {
  days: number;
  label: string;
  urgent: boolean;
} {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  const now = new Date();
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: diffDays,
      label: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`,
      urgent: true
    };
  }

  if (diffDays === 0) {
    return { days: diffDays, label: 'Due today', urgent: true };
  }

  if (diffDays === 1) {
    return { days: diffDays, label: 'Due tomorrow', urgent: true };
  }

  if (diffDays <= 7) {
    return {
      days: diffDays,
      label: `${diffDays} days remaining`,
      urgent: true
    };
  }

  return { days: diffDays, label: `${diffDays} days remaining`, urgent: false };
}

/**
 * Generate plain text email content for notification digest
 */
export function generatePlainTextDigest(
  notificationGroups: NotificationGroup[],
  totalCount: number
): string {
  let text = `TRACKTOR NOTIFICATION SUMMARY\n`;
  text += `=====================================\n`;
  text += `You have ${totalCount} pending notification${totalCount !== 1 ? 's' : ''}.\n\n`;

  notificationGroups.forEach((group) => {
    text += `${group.label} (${group.notifications.length})\n`;
    text += `${'-'.repeat(40)}\n`;

    group.notifications.forEach((notification, index) => {
      const daysInfo = getDaysUntilDue(notification.dueDate);
      text += `${index + 1}. ${notification.message}\n`;
      text += `   Type: ${group.label}\n`;
      text += `   Due: ${formatDate(notification.dueDate)}\n`;
      text += `   Status: ${daysInfo.label}\n`;
      if (index < group.notifications.length - 1) {
        text += '\n';
      }
    });

    text += '\n\n';
  });

  text += `=====================================\n`;
  text += `Open Tracktor to review and manage these notifications.\n`;

  return text;
}

/**
 * Generate HTML email content for notification digest
 * Optimized for mobile email clients (Gmail, Outlook, Apple Mail, etc.)
 */
export function generateHtmlDigest(
  notificationGroups: NotificationGroup[],
  totalCount: number
): string {
  const groupsHtml = notificationGroups
    .map((group) => {
      const notificationsHtml = group.notifications
        .map((notification, index) => {
          const daysInfo = getDaysUntilDue(notification.dueDate);
          return `${index + 1}. ${escapeHtml(notification.message)}<br>Due: ${formatDate(notification.dueDate)}<br>Status: <strong>${escapeHtml(daysInfo.label)}</strong>`;
        })
        .join('<br><br>');

      return `<strong>${escapeHtml(group.label)} (${group.notifications.length})</strong><br>${notificationsHtml}`;
    })
    .join('<br><br>');

  const appUrl = env.BASE_URL || '';
  const appLinkHtml = appUrl ? `<a href="${escapeHtml(appUrl)}">Open Tracktor</a><br><br>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Tracktor Notification Summary</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #111827; line-height: 1.6;">
	<strong>Tracktor Notification Summary</strong><br>
	You have <strong>${totalCount}</strong> pending notification${totalCount !== 1 ? 's' : ''}.<br><br>
	${groupsHtml}<br><br>
	${appLinkHtml}
	This is an automated message from Tracktor.
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
