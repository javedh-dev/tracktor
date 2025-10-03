import { ConfigError } from "@exceptions/ConfigError";
import { Status } from "@exceptions/ServiceError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";

export const getAppConfigs = async () => {
  let configs = await db.query.configTable.findMany();
  if (!configs) {
    configs = [];
  }
  return configs;
};

export const getAppConfigByKey = async (key: string) => {
  let config = await db.query.configTable.findFirst({
    where: (configs, { eq }) => eq(configs.key, key),
  });
  if (!config) {
    throw new ConfigError(`No config found for key : ${key}`, Status.NOT_FOUND);
  }
  return config;
};

export const updateAppConfig = async (key: string, value: string) => {
  if (!key || value === undefined) {
    throw new ConfigError(
      "Key and value are required for each configuration",
      Status.BAD_REQUEST
    );
  }
  const config = await getAppConfigByKey(key);
  let updatedConfig;
  if (!config) {
    updatedConfig = await db
      .insert(schema.configTable)
      .values({
        key,
        value,
      })
      .returning();
  } else {
    updatedConfig = await db
      .update(schema.configTable)
      .set({
        value: value,
      })
      .where(eq(schema.configTable.key, key))
      .returning();
  }
  return updatedConfig[0];
};
