import type { NotificationProviderConfig } from '$lib/domain/notification-provider';

function resolveEmailConfig(
  existingConfig: NotificationProviderConfig,
  incomingConfig: NotificationProviderConfig
): NotificationProviderConfig {
  if (
    incomingConfig.type === 'email' &&
    existingConfig.type === 'email' &&
    incomingConfig.auth.pass.trim().length === 0
  ) {
    return {
      ...incomingConfig,
      auth: {
        ...incomingConfig.auth,
        pass: existingConfig.auth.pass
      }
    };
  }

  return incomingConfig;
}

function resolveGotifyConfig(
  existingConfig: NotificationProviderConfig,
  incomingConfig: NotificationProviderConfig
): NotificationProviderConfig {
  if (
    incomingConfig.type === 'gotify' &&
    existingConfig.type === 'gotify' &&
    incomingConfig.appToken.trim().length === 0
  ) {
    return {
      ...incomingConfig,
      appToken: existingConfig.appToken
    };
  }

  return incomingConfig;
}

function resolveWebhookConfig(
  existingConfig: NotificationProviderConfig,
  incomingConfig: NotificationProviderConfig
): NotificationProviderConfig {
  if (incomingConfig.type !== 'webhook' || existingConfig.type !== 'webhook') {
    return incomingConfig;
  }

  if (
    incomingConfig.authType === 'basic' &&
    existingConfig.authType === 'basic' &&
    incomingConfig.authCredentials?.username &&
    incomingConfig.authCredentials.password?.trim().length === 0
  ) {
    return {
      ...incomingConfig,
      authCredentials: {
        ...incomingConfig.authCredentials,
        password: existingConfig.authCredentials?.password
      }
    };
  }

  if (
    incomingConfig.authType === 'bearer' &&
    existingConfig.authType === 'bearer' &&
    incomingConfig.authCredentials?.token?.trim().length === 0
  ) {
    return {
      ...incomingConfig,
      authCredentials: {
        ...incomingConfig.authCredentials,
        token: existingConfig.authCredentials?.token
      }
    };
  }

  if (
    incomingConfig.authType === 'api-key' &&
    existingConfig.authType === 'api-key' &&
    incomingConfig.authCredentials?.apiKey?.trim().length === 0
  ) {
    return {
      ...incomingConfig,
      authCredentials: {
        ...incomingConfig.authCredentials,
        apiKey: existingConfig.authCredentials?.apiKey
      }
    };
  }

  return incomingConfig;
}

export function resolveUpdatedConfig(
  existingConfig: NotificationProviderConfig,
  incomingConfig: NotificationProviderConfig
): NotificationProviderConfig {
  const emailResolved = resolveEmailConfig(existingConfig, incomingConfig);
  const gotifyResolved = resolveGotifyConfig(existingConfig, emailResolved);

  return resolveWebhookConfig(existingConfig, gotifyResolved);
}
