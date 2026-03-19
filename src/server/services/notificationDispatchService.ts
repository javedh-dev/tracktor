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
import { buildWebhookHeaders } from './notification-provider-http.helper';
import { getEnabledProvidersForChannels } from './notificationProviderService';
import {
  getActiveNotificationsForChannels,
  getPendingNotificationsForChannels
} from './notificationService';

type DispatchResult = {
  providerId: string;
  providerName: string;
  providerType: string;
  success: boolean;
  error?: string;
  notificationCount: number;
};

async function sendWebhookNotification(
  provider: NotificationProviderWithParsedConfig,
  notifications: Notification[]
): Promise<DispatchResult> {
  const config = provider.config as WebhookProviderConfig;

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: buildWebhookHeaders(config),
      body: JSON.stringify({
        title: 'Tracktor notifications',
        notificationCount: notifications.length,
        channels: provider.channels,
        notifications,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      return {
        providerId: provider.id,
        providerName: provider.name,
        providerType: provider.type,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        notificationCount: notifications.length
      };
    }

    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      success: true,
      notificationCount: notifications.length
    };
  } catch (error) {
    const err = error as Error;
    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      success: false,
      error: err.message,
      notificationCount: notifications.length
    };
  }
}

async function sendGotifyNotification(
  provider: NotificationProviderWithParsedConfig,
  notifications: Notification[]
): Promise<DispatchResult> {
  const config = provider.config as GotifyProviderConfig;
  const groups = groupNotifications(notifications);

  try {
    const response = await fetch(`${config.serverUrl}/message?token=${config.appToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: `Tracktor Notification Summary`,
        message: generatePlainTextDigest(groups, notifications.length),
        priority: config.priority
      })
    });

    if (!response.ok) {
      return {
        providerId: provider.id,
        providerName: provider.name,
        providerType: provider.type,
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        notificationCount: notifications.length
      };
    }

    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      success: true,
      notificationCount: notifications.length
    };
  } catch (error) {
    const err = error as Error;
    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      success: false,
      error: err.message,
      notificationCount: notifications.length
    };
  }
}

async function sendNotificationsToProvider(
  provider: NotificationProviderWithParsedConfig,
  notifications: Notification[]
): Promise<DispatchResult> {
  if (notifications.length === 0) {
    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      success: true,
      notificationCount: 0
    };
  }

  if (provider.type === 'email') {
    const groups = groupNotifications(notifications);
    const result = await sendEmail({
      providerId: provider.id,
      subject: `Tracktor: ${notifications.length} pending notification${notifications.length === 1 ? '' : 's'}`,
      text: generatePlainTextDigest(groups, notifications.length),
      html: generateHtmlDigest(groups, notifications.length)
    });

    return {
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      success: result.success,
      error: result.error,
      notificationCount: notifications.length
    };
  }

  if (provider.type === 'webhook') {
    return sendWebhookNotification(provider, notifications);
  }

  if (provider.type === 'gotify') {
    return sendGotifyNotification(provider, notifications);
  }

  return {
    providerId: provider.id,
    providerName: provider.name,
    providerType: provider.type,
    success: false,
    error: `Unsupported provider type: ${provider.type}`,
    notificationCount: notifications.length
  };
}

async function dispatchNotifications(useAllNotifications: boolean): Promise<{
  success: boolean;
  notificationCount: number;
  providerCount: number;
  results: DispatchResult[];
}> {
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
  const notificationResult = useAllNotifications
    ? await getActiveNotificationsForChannels(channels)
    : await getPendingNotificationsForChannels(channels);
  const allNotifications = (notificationResult.data ?? []) as Notification[];

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

export async function dispatchScheduledNotifications(): Promise<{
  success: boolean;
  notificationCount: number;
  providerCount: number;
  results: DispatchResult[];
}> {
  return dispatchNotifications(false);
}

export async function dispatchAllNotificationsToEnabledProviders(): Promise<{
  success: boolean;
  notificationCount: number;
  providerCount: number;
  results: DispatchResult[];
}> {
  return dispatchNotifications(true);
}
