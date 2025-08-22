import { ConfigError } from "@exceptions/ConfigError.js";
import { Status, statusFromError } from "@exceptions/ServiceError.js";
import Config from "@models/Config.js";

export const getAppConfig = async () => {
  let config = await Config.findAll({
    attributes: ["key", "value", "description"],
  });
  if (!config) {
    config = [];
  }
  return config;
};

export const getAppConfigByKey = async (key: string) => {
  const config = await Config.findOne({ where: { key } });
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
  if (!config) {
    return await Config.create({ key, value });
  }
  config.value = value;
  await config.save();
  return config;
};
