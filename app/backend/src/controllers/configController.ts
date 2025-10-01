import { Request, Response } from "express";
import {
  getAppConfigs,
  getAppConfigByKey,
  updateAppConfig,
} from "@services/configService.js";

export const getConfig = async (_: Request, res: Response) => {
  const config = await getAppConfigs();
  res.status(200).json(config);
};

export const getConfigByKey = async (req: Request, res: Response) => {
  const { key } = req.params;
  const config = await getAppConfigByKey(key as string);
  res.status(200).json(config);
};

export const updateConfig = async (req: Request, res: Response) => {
  const configs: { key: string; value: string }[] = req.body;
  const updatedConfigs = await Promise.all(
    configs.map(async (config) => {
      const { key, value } = config;
      return await updateAppConfig(key, value);
    })
  );
  res.status(200).json(updatedConfigs);
};
