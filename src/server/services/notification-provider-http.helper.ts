import type {
  GotifyProviderConfig,
  WebhookProviderConfig
} from '$lib/domain/notification-provider';

/* global RequestInit */

export type ProviderSendResult = { success: boolean; error?: string };

export function buildWebhookHeaders(config: WebhookProviderConfig): Record<string, string> {
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

async function post(
  url: string,
  init: RequestInit,
  fallbackError: string
): Promise<ProviderSendResult> {
  try {
    const response = await fetch(url, init);

    return response.ok
      ? { success: true }
      : { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
  } catch (error) {
    return { success: false, error: (error as Error).message || fallbackError };
  }
}

export function sendWebhook(
  config: WebhookProviderConfig,
  payload: Record<string, unknown>
): Promise<ProviderSendResult> {
  return post(
    config.url,
    {
      method: config.method,
      headers: buildWebhookHeaders(config),
      body: JSON.stringify({ ...payload, timestamp: new Date().toISOString() })
    },
    'Failed to send webhook'
  );
}

export function sendGotify(
  config: GotifyProviderConfig,
  title: string,
  message: string
): Promise<ProviderSendResult> {
  return post(
    `${config.serverUrl}/message?token=${config.appToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, priority: config.priority })
    },
    'Failed to send Gotify notification'
  );
}
