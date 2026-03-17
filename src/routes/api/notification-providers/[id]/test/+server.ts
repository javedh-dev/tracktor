import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';

import type {
  EmailProviderConfig,
  GotifyProviderConfig,
  WebhookProviderConfig
} from '$lib/domain/notification-provider';
import { testEmailProvider } from '$server/services/emailNotificationService';
import { getProviderById } from '$server/services/notificationProviderService';
import { withRouteErrorHandling } from '$server/utils/route-handler';

async function testWebhookProvider(
  config: WebhookProviderConfig,
  testMessage: string
): Promise<{ success: boolean; error?: string }> {
  try {
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

    const response = await fetch(config.url, {
      method: config.method,
      headers,
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
): Promise<{ success: boolean; error?: string }> {
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

export const POST: RequestHandler = async (event) => {
  return withRouteErrorHandling('Notification provider test POST error:', async () => {
    const body = event.locals.requestBody || (await event.request.json());
    const providerId = event.params.id;

    if (!providerId) {
      throw error(400, 'Provider ID is required');
    }

    const result = await getProviderById(providerId);
    const provider = result.data;

    if (!provider.isEnabled) {
      throw error(400, 'Provider is disabled');
    }

    let testResult: { success: boolean; error?: string };

    if (provider.config.type === 'email') {
      testResult = await testEmailProvider(provider.config as EmailProviderConfig, body.testEmail);
    } else if (provider.config.type === 'webhook') {
      testResult = await testWebhookProvider(
        provider.config as WebhookProviderConfig,
        body.testMessage || 'This is a test notification from Tracktor'
      );
    } else if (provider.config.type === 'gotify') {
      testResult = await testGotifyProvider(
        provider.config as GotifyProviderConfig,
        body.testMessage || 'This is a test notification from Tracktor'
      );
    } else {
      throw error(400, `Provider type ${provider.config.type} is not supported for testing`);
    }

    return json({
      success: testResult.success,
      message: testResult.success
        ? 'Test notification sent successfully'
        : `Failed to send test notification: ${testResult.error}`,
      data: testResult
    });
  });
};
