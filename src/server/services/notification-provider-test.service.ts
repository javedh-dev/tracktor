import type {
  EmailProviderConfig,
  GotifyProviderConfig,
  NotificationProviderWithParsedConfig,
  WebhookProviderConfig
} from '$lib/domain/notification-provider';
import { AppError, Status } from '$server/exceptions/AppError';

import {
  sendGotify,
  sendWebhook,
  type ProviderSendResult
} from './notification-provider-http.helper';
import { testEmailProvider } from './emailNotificationService';

export type NotificationProviderTestOptions = {
  testEmail?: string;
  testMessage?: string;
};

const DEFAULT_TEST_MESSAGE = 'This is a test notification from Tracktor';

export async function testNotificationProvider(
  provider: NotificationProviderWithParsedConfig,
  options: NotificationProviderTestOptions = {}
): Promise<ProviderSendResult> {
  const testMessage = options.testMessage || DEFAULT_TEST_MESSAGE;

  switch (provider.config.type) {
    case 'email':
      return testEmailProvider(provider.config as EmailProviderConfig, options.testEmail);
    case 'webhook':
      return sendWebhook(provider.config as WebhookProviderConfig, {
        title: 'Tracktor test notification',
        message: testMessage,
        test: true
      });
    case 'gotify':
      return sendGotify(
        provider.config as GotifyProviderConfig,
        'Tracktor test notification',
        testMessage
      );
    default:
      throw new AppError('Provider type is not supported for testing', Status.BAD_REQUEST);
  }
}
