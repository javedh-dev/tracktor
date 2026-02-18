import { eq } from 'drizzle-orm';
import { db } from '../db/index';
import * as schema from '../db/schema/index';
import { AppError, Status } from '../exceptions/AppError';
import type { ApiResponse } from '$lib/response';
import type {
  CreateNotificationProvider,
  UpdateNotificationProvider,
  NotificationProviderWithParsedConfig
} from '$lib/domain/notification-provider';
import {
  createNotificationProviderSchema,
  updateNotificationProviderSchema,
  notificationProviderConfigSchema
} from '$lib/domain/notification-provider';
import logger from '$server/config/logger';
import { encrypt, decrypt } from '$server/utils/encryption';

const parseProviderConfig = (provider: any): NotificationProviderWithParsedConfig => {
  try {
    // Decrypt the config
    const config = decrypt(provider.config);
    return {
      ...provider,
      config
    };
  } catch (error) {
    logger.error('Failed to parse provider config', { providerId: provider.id, error });
    throw new AppError('Invalid provider configuration', Status.INTERNAL_SERVER_ERROR);
  }
};

export const getProvidersByUserId = async (): Promise<ApiResponse> => {
  const providers = await db.query.notificationProviderTable.findMany({
    orderBy: (providers, { desc }) => [desc(providers.created_at)]
  });

  const parsedProviders = providers.map(parseProviderConfig);

  return {
    success: true,
    message: 'Providers fetched successfully',
    data: parsedProviders
  };
};

export const getProviderById = async (providerId: string): Promise<ApiResponse> => {
  const provider = await db.query.notificationProviderTable.findFirst({
    where: (providers, { eq }) => eq(providers.id, providerId)
  });

  if (!provider) {
    throw new AppError('Provider not found', Status.NOT_FOUND);
  }

  const parsedProvider = parseProviderConfig(provider);

  return {
    success: true,
    message: 'Provider fetched successfully',
    data: parsedProvider
  };
};

export const addProvider = async (
  providerData: CreateNotificationProvider
): Promise<ApiResponse> => {
  const validated = createNotificationProviderSchema.parse(providerData);

  // Validate the config based on provider type
  const validatedConfig = notificationProviderConfigSchema.parse(validated.config);

  // If this is set as default, unset all other default providers
  if (validated.isDefault) {
    await db
      .update(schema.notificationProviderTable)
      .set({ isDefault: false })
      .where(eq(schema.notificationProviderTable.type, validated.type));
  }

  const [provider] = await db
    .insert(schema.notificationProviderTable)
    .values({
      name: validated.name,
      type: validated.type,
      config: encrypt(validatedConfig),
      isEnabled: validated.isEnabled,
      isDefault: validated.isDefault
    })
    .returning();

  if (!provider) {
    throw new AppError('Failed to create provider', Status.INTERNAL_SERVER_ERROR);
  }

  const parsedProvider = parseProviderConfig(provider);

  return {
    success: true,
    message: 'Provider created successfully',
    data: parsedProvider
  };
};

export const updateProvider = async (
  providerId: string,
  providerData: UpdateNotificationProvider
): Promise<ApiResponse> => {
  const validated = updateNotificationProviderSchema.parse(providerData);

  // Check if provider exists
  const existingProvider = await db.query.notificationProviderTable.findFirst({
    where: (providers, { eq }) => eq(providers.id, providerId)
  });

  if (!existingProvider) {
    throw new AppError('Provider not found', Status.NOT_FOUND);
  }

  // If this is set as default, unset all other default providers of the same type
  if (validated.isDefault) {
    await db
      .update(schema.notificationProviderTable)
      .set({ isDefault: false })
      .where(eq(schema.notificationProviderTable.type, existingProvider.type));
  }

  const updateData: any = {};
  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.isEnabled !== undefined) updateData.isEnabled = validated.isEnabled;
  if (validated.isDefault !== undefined) updateData.isDefault = validated.isDefault;

  if (validated.config !== undefined) {
    const validatedConfig = notificationProviderConfigSchema.parse(validated.config);
    updateData.config = encrypt(validatedConfig);
  }

  const [updatedProvider] = await db
    .update(schema.notificationProviderTable)
    .set(updateData)
    .where(eq(schema.notificationProviderTable.id, providerId))
    .returning();

  if (!updatedProvider) {
    throw new AppError('Failed to update provider', Status.INTERNAL_SERVER_ERROR);
  }

  const parsedProvider = parseProviderConfig(updatedProvider);

  return {
    success: true,
    message: 'Provider updated successfully',
    data: parsedProvider
  };
};

export const deleteProvider = async (providerId: string): Promise<ApiResponse> => {
  // Check if provider exists
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

export const getDefaultProvider = async (
  type: string
): Promise<NotificationProviderWithParsedConfig | null> => {
  const provider = await db.query.notificationProviderTable.findFirst({
    where: (providers, { eq, and }) =>
      and(eq(providers.type, type), eq(providers.isDefault, true), eq(providers.isEnabled, true))
  });
  console.log('Default provider:', provider);

  if (!provider) {
    return null;
  }

  return parseProviderConfig(provider);
};
