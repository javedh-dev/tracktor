import type { ApiResponse } from '$lib/response';
import type {
  CreateNotificationProvider,
  NotificationChannel,
  NotificationProviderType,
  NotificationProviderWithParsedConfig,
  UpdateNotificationProvider
} from '$lib/domain/notification-provider';
import {
  createNotificationProviderSchema,
  notificationProviderConfigSchema,
  notificationProviderChannelsSchema,
  notificationProviderTypeSchema,
  updateNotificationProviderSchema
} from '$lib/domain/notification-provider';
import logger from '$server/config/logger';
import { db } from '$server/db';
import * as schema from '$server/db/schema';
import { AppError, Status } from '$server/exceptions/AppError';
import { decrypt, encrypt } from '$server/utils/encryption';
import { eq } from 'drizzle-orm';
import { resolveUpdatedConfig } from './notification-provider-service.helper';

type ProviderRecord = typeof schema.notificationProviderTable.$inferSelect;

function parseChannels(rawChannels: string): NotificationChannel[] {
  try {
    return notificationProviderChannelsSchema.parse(JSON.parse(rawChannels));
  } catch (error) {
    logger.error('Failed to parse provider channels', { rawChannels, error });
    throw new AppError('Invalid provider channels', Status.INTERNAL_SERVER_ERROR);
  }
}

function parseProvider(provider: ProviderRecord): NotificationProviderWithParsedConfig {
  try {
    const config = notificationProviderConfigSchema.parse(decrypt(provider.config));
    const channels = parseChannels(provider.channels);
    const type = notificationProviderTypeSchema.parse(provider.type) as NotificationProviderType;

    return {
      ...provider,
      type,
      config,
      channels
    };
  } catch (error) {
    logger.error('Failed to parse provider config', {
      providerId: provider.id,
      error
    });
    throw new AppError('Invalid provider configuration', Status.INTERNAL_SERVER_ERROR);
  }
}

export const getProvidersByUserId = async (): Promise<ApiResponse> => {
  const providers = await db.query.notificationProviderTable.findMany({
    orderBy: (providers, { desc }) => [desc(providers.created_at)]
  });

  return {
    success: true,
    message: 'Providers fetched successfully',
    data: providers.map(parseProvider)
  };
};

export const getProviderById = async (providerId: string): Promise<ApiResponse> => {
  const provider = await db.query.notificationProviderTable.findFirst({
    where: (providers, { eq }) => eq(providers.id, providerId)
  });

  if (!provider) {
    throw new AppError('Provider not found', Status.NOT_FOUND);
  }

  return {
    success: true,
    message: 'Provider fetched successfully',
    data: parseProvider(provider)
  };
};

export const addProvider = async (
  providerData: CreateNotificationProvider
): Promise<ApiResponse> => {
  const validated = createNotificationProviderSchema.parse(providerData);
  const validatedConfig = notificationProviderConfigSchema.parse(validated.config);

  const [provider] = await db
    .insert(schema.notificationProviderTable)
    .values({
      name: validated.name,
      type: validated.type,
      config: encrypt(validatedConfig),
      channels: JSON.stringify(validated.channels),
      isEnabled: validated.isEnabled
    })
    .returning();

  if (!provider) {
    throw new AppError('Failed to create provider', Status.INTERNAL_SERVER_ERROR);
  }

  return {
    success: true,
    message: 'Provider created successfully',
    data: parseProvider(provider)
  };
};

export const updateProvider = async (
  providerId: string,
  providerData: UpdateNotificationProvider
): Promise<ApiResponse> => {
  const validated = updateNotificationProviderSchema.parse(providerData);
  const existingProvider = await db.query.notificationProviderTable.findFirst({
    where: (providers, { eq }) => eq(providers.id, providerId)
  });

  if (!existingProvider) {
    throw new AppError('Provider not found', Status.NOT_FOUND);
  }

  const updateData: Partial<typeof schema.notificationProviderTable.$inferInsert> = {};

  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.isEnabled !== undefined) updateData.isEnabled = validated.isEnabled;
  if (validated.channels !== undefined) updateData.channels = JSON.stringify(validated.channels);

  if (validated.config !== undefined) {
    const existingConfig = notificationProviderConfigSchema.parse(decrypt(existingProvider.config));
    const mergedConfig = resolveUpdatedConfig(existingConfig, validated.config);
    updateData.config = encrypt(notificationProviderConfigSchema.parse(mergedConfig));
  }

  const [updatedProvider] = await db
    .update(schema.notificationProviderTable)
    .set(updateData)
    .where(eq(schema.notificationProviderTable.id, providerId))
    .returning();

  if (!updatedProvider) {
    throw new AppError('Failed to update provider', Status.INTERNAL_SERVER_ERROR);
  }

  return {
    success: true,
    message: 'Provider updated successfully',
    data: parseProvider(updatedProvider)
  };
};

export const deleteProvider = async (providerId: string): Promise<ApiResponse> => {
  const existingProvider = await db.query.notificationProviderTable.findFirst({
    where: (providers, { eq }) => eq(providers.id, providerId)
  });

  if (!existingProvider) {
    throw new AppError('Provider not found', Status.NOT_FOUND);
  }

  await db
    .delete(schema.notificationProviderTable)
    .where(eq(schema.notificationProviderTable.id, providerId));

  return {
    success: true,
    message: 'Provider deleted successfully',
    data: null
  };
};

export const getEnabledProvidersForChannels = async (channels: NotificationChannel[]) => {
  const providers = await db.query.notificationProviderTable.findMany({
    where: (provider, { eq }) => eq(provider.isEnabled, true)
  });

  return providers
    .map(parseProvider)
    .filter((provider) => provider.channels.some((channel) => channels.includes(channel)));
};

export const getEnabledProvidersByType = async (type: string) => {
  const providers = await db.query.notificationProviderTable.findMany({
    where: (provider, { and, eq }) => and(eq(provider.type, type), eq(provider.isEnabled, true))
  });

  return providers.map(parseProvider);
};

export const getEnabledProvidersByIds = async (providerIds: string[]) => {
  if (providerIds.length === 0) {
    return [];
  }

  const providers = await db.query.notificationProviderTable.findMany({
    where: (provider, { and, eq, inArray }) =>
      and(eq(provider.isEnabled, true), inArray(provider.id, providerIds))
  });

  return providers.map(parseProvider);
};
