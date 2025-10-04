import { Request, Response } from "express";
import {
  getAppConfigs,
  getAppConfigByKey,
  updateAppConfig,
} from "@services/configService";

export const getConfig = async (_: Request, res: Response) => {
  const configs = await getAppConfigs();
  res.status(200).json(configs);
};

export const getConfigByKey = async (req: Request, res: Response) => {
  const { key } = req.params;
  const config = await getAppConfigByKey(key as string);
  res.status(200).json(config);
};

export const updateConfig = async (req: Request, res: Response) => {
  const configs: { key: string; value: string }[] = req.body;
  const response = await updateAppConfig(configs);
  res.status(200).json(response);
};
