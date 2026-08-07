import type {
  GotifyProviderConfig,
  NotificationChannel,
  NotificationProviderWithParsedConfig,
  WebhookProviderConfig
} from '$lib/domain/notification-provider';
import type { Notification } from '$lib/domain/notification';
import logger from '$server/config/logger';

import {
  generateHtmlDigest,
  generatePlainTextDigest,
  groupNotifications
} from './emailTemplateService';
import { sendEmail } from './emailNotificationService';
import { sendGotify, sendWebhook } from './notification-provider-http.helper';
import { getEnabledProvidersForChannels } from './notificationProviderService';
import { getPendingNotificationsForChannels, syncAllNotifications } from './notificationService';

type DispatchResult = {
  providerId: string;
  providerName: string;
  providerType: string;
  success: boolean;
  error?: string;
  notificationCount: number;
};

async function send(
  provider: NotificationProviderWithParsedConfig,
  notifications: Notification[]
): Promise<{ success: boolean; error?: string }> {
  const groups = groupNotifications(notifications);
  const digest = generatePlainTextDigest(groups, notifications.length);

  switch (provider.type) {
    case 'email':
      return sendEmail({
        providerId: provider.id,
        subject: `Tracktor: ${notifications.length} pending notification${notifications.length === 1 ? '' : 's'}`,
        text: digest,
        html: generateHtmlDigest(groups, notifications.length)
      });
    case 'webhook':
      return sendWebhook(provider.config as WebhookProviderConfig, {
        title: 'Tracktor notifications',
        notificationCount: notifications.length,
        channels: provider.channels,
        notifications
      });
    case 'gotify':
      return sendGotify(
        provider.config as GotifyProviderConfig,
        'Tracktor Notification Summary',
        digest
      );
    default:
      return { success: false, error: `Unsupported provider type: ${provider.type}` };
  }
}

async function sendNotificationsToProvider(
  provider: NotificationProviderWithParsedConfig,
  notifications: Notification[]
): Promise<DispatchResult> {
  const result =
    notifications.length === 0 ? { success: true } : await send(provider, notifications);

  return {
    providerId: provider.id,
    providerName: provider.name,
    providerType: provider.type,
    notificationCount: notifications.length,
    ...result
  };
}

export async function dispatchScheduledNotifications(): Promise<{
  success: boolean;
  notificationCount: number;
  providerCount: number;
  results: DispatchResult[];
}> {
  await syncAllNotifications();

  const providers = await getEnabledProvidersForChannels([
    'reminder',
    'alert',
    'information'
  ] as NotificationChannel[]);

  if (providers.length === 0) {
    return {
      success: true,
      notificationCount: 0,
      providerCount: 0,
      results: []
    };
  }

  const channels = Array.from(new Set(providers.flatMap((provider) => provider.channels)));
  const allNotifications = (await getPendingNotificationsForChannels(channels)) as Notification[];

  const results = await Promise.all(
    providers.map((provider) => {
      const providerNotifications = allNotifications.filter((notification) =>
        provider.channels.includes(notification.channel)
      );

      return sendNotificationsToProvider(provider, providerNotifications);
    })
  );

  results.forEach((result) => {
    if (result.success) {
      logger.info('Notification dispatch completed', result);
    } else {
      logger.error('Notification dispatch failed', result);
    }
  });

  return {
    success: results.every((result) => result.success),
    notificationCount: allNotifications.length,
    providerCount: providers.length,
    results
  };
}
