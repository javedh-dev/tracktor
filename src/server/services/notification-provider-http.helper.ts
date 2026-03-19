import type { WebhookProviderConfig } from '$lib/domain/notification-provider';

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
