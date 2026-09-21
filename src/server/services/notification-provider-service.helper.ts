import type {
  NotificationProviderConfig,
  NotificationProviderWithParsedConfig
} from '$lib/domain/notification-provider';

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

/**
 * Blanks out provider secrets before a config is sent back to the client. Only the actual
 * secret values are masked (email `auth.pass`, gotify `appToken`, webhook
 * `authCredentials.password`/`.token`/`.apiKey`) — non-secret identifiers such as
 * `auth.user`, `authCredentials.username` and `authCredentials.apiKeyHeader` are left
 * untouched, because the settings forms pre-populate those fields from the fetched config on
 * edit (see EmailProviderForm/WebhookProviderForm.svelte) and have no "keep existing" fallback
 * for them the way resolveUpdatedConfig() above has for secrets.
 *
 * Masking to an empty string (not a placeholder like "********") is deliberate: it's exactly
 * the value the edit forms already start secret fields at, and resolveUpdatedConfig() already
 * treats an empty incoming secret as "keep the existing one" on save. A non-empty placeholder
 * would instead get submitted verbatim and overwrite the real secret the first time someone
 * saves the form without touching that field.
 */
function maskProviderConfig(config: NotificationProviderConfig): NotificationProviderConfig {
  if (config.type === 'email') {
    return {
      ...config,
      auth: {
        ...config.auth,
        pass: ''
      }
    };
  }

  if (config.type === 'gotify') {
    return {
      ...config,
      appToken: ''
    };
  }

  if (config.type === 'webhook') {
    if (!config.authCredentials) {
      return config;
    }

    const maskedCredentials = { ...config.authCredentials };

    if (maskedCredentials.password !== undefined) maskedCredentials.password = '';
    if (maskedCredentials.token !== undefined) maskedCredentials.token = '';
    if (maskedCredentials.apiKey !== undefined) maskedCredentials.apiKey = '';

    return {
      ...config,
      authCredentials: maskedCredentials
    };
  }

  return config;
}

export function maskProviderSecrets(
  provider: NotificationProviderWithParsedConfig
): NotificationProviderWithParsedConfig {
  return {
    ...provider,
    config: maskProviderConfig(provider.config)
  };
}

export function maskProvidersSecrets(
  providers: NotificationProviderWithParsedConfig[]
): NotificationProviderWithParsedConfig[] {
  return providers.map(maskProviderSecrets);
}
