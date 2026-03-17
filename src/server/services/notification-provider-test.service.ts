import type {
  EmailProviderConfig,
  GotifyProviderConfig,
  NotificationProviderWithParsedConfig,
  WebhookProviderConfig
} from '$lib/domain/notification-provider';
import { AppError, Status } from '$server/exceptions/AppError';

import { testEmailProvider } from './emailNotificationService';

export type NotificationProviderTestResult = {
  success: boolean;
  error?: string;
};

type NotificationProviderTestOptions = {
  testEmail?: string;
  testMessage?: string;
};

const DEFAULT_TEST_MESSAGE = 'This is a test notification from Tracktor';

function buildWebhookHeaders(config: WebhookProviderConfig): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers
  };

  if (config.authType === 'basic' && config.authCredentials?.username) {
    const auth = btoa(
      `${config.authCredentials.username}:${config.authCredentials.password ?? ''}`
    );
    headers['Authorization'] = `Basic ${auth}`;
  } else if (config.authType === 'bearer' && config.authCredentials?.token) {
    headers['Authorization'] = `Bearer ${config.authCredentials.token}`;
  } else if (config.authType === 'api-key' && config.authCredentials?.apiKey) {
    headers[config.authCredentials.apiKeyHeader || 'X-API-Key'] = config.authCredentials.apiKey;
  }

  return headers;
}

async function testWebhookProvider(
  config: WebhookProviderConfig,
  testMessage: string
): Promise<NotificationProviderTestResult> {
  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: buildWebhookHeaders(config),
      body: JSON.stringify({
        title: 'Tracktor test notification',
        message: testMessage,
        timestamp: new Date().toISOString(),
        test: true
      })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;

    return {
      success: false,
      error: err.message || 'Failed to send webhook'
    };
  }
}

async function testGotifyProvider(
  config: GotifyProviderConfig,
  testMessage: string
): Promise<NotificationProviderTestResult> {
  try {
    const response = await fetch(`${config.serverUrl}/message?token=${config.appToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Tracktor test notification',
        message: testMessage,
        priority: config.priority
      })
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return { success: true };
  } catch (error) {
    const err = error as Error;

    return {
      success: false,
      error: err.message || 'Failed to send Gotify notification'
    };
  }
}

export async function testNotificationProvider(
  provider: NotificationProviderWithParsedConfig,
  options: NotificationProviderTestOptions = {}
): Promise<NotificationProviderTestResult> {
  const testMessage = options.testMessage || DEFAULT_TEST_MESSAGE;

  switch (provider.config.type) {
    case 'email':
      return testEmailProvider(provider.config as EmailProviderConfig, options.testEmail);
    case 'webhook':
      return testWebhookProvider(provider.config as WebhookProviderConfig, testMessage);
    case 'gotify':
      return testGotifyProvider(provider.config as GotifyProviderConfig, testMessage);
    default:
      throw new AppError('Provider type is not supported for testing', Status.BAD_REQUEST);
  }
}
