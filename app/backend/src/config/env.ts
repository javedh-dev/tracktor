import { config } from "dotenv";
import { resolve } from "path";
import logger from "./logger";
import { accessSync, mkdirSync } from "fs";
import { constants } from "fs/promises";

// Load environment variables based on NODE_ENV
const nodeEnv = process.env.NODE_ENV || "dev";
const envPath = resolve(process.cwd(), "../../env", `.env.${nodeEnv}`);

config({ path: envPath, quiet: true, override: true });

const getOrigins = (): string[] => {
  const origins = process.env.CORS_ORIGINS;
  if (!origins) {
    return ["*"];
  }

  return origins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "dev",
  SERVER_HOST: process.env.SERVER_HOST || "0.0.0.0",
  SERVER_PORT: parseInt(process.env.SERVER_PORT || "3000"),
  DATABASE_PATH: process.env.DATABASE_PATH || "./tracktor.db",
  UPLOADS_DIR: process.env.UPLOADS_DIR || "./uploads",
  AUTH_PIN: process.env.AUTH_PIN || "123456",
  CORS_ORIGINS: getOrigins(),
  FORCE_DATA_SEED: process.env.FORCE_DATA_SEED === "true",
  DEMO_MODE: process.env.PUBLIC_DEMO_MODE === "true",
  LOG_REQUESTS: process.env.LOG_REQUESTS === "true",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_DIR: process.env.LOG_DIR || "./logs",
} as const;

export const isDevelopment = env.NODE_ENV === "dev";
export const isProduction = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  logger.info("Validating environment...");
  const required: string[] = [];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
    process.exit(1);
  }

  if (
    isNaN(env.SERVER_PORT) ||
    env.SERVER_PORT < 1 ||
    env.SERVER_PORT > 65535
  ) {
    logger.error(`Invalid SERVER_PORT: ${process.env.SERVER_PORT}`);
    process.exit(1);
  }

  if (env.CORS_ORIGINS.length === 0) {
    logger.error("CORS_ORIGINS cannot be an empty list");
    process.exit(1);
  }

  if (env.DEMO_MODE && env.FORCE_DATA_SEED) {
    logger.warn("Running in FORCE_SEED mode. All data will be reset.");
  }

  if (env.DATABASE_PATH) {
    try {
      accessSync(env.DATABASE_PATH, constants.F_OK | constants.W_OK);
    } catch (err) {
      logger.error(
        `DATABASE_PATH "${env.DATABASE_PATH}" does not exist or is not writable`,
        err,
      );
      process.exit(1);
    }
  }

  if (env.UPLOADS_DIR) {
    try {
      accessSync(env.UPLOADS_DIR, constants.F_OK | constants.W_OK);
    } catch (err) {
      logger.warn(
        `UPLOADS_DIR "${env.UPLOADS_DIR}" does not exist. Creating...`,
        err,
      );
      mkdirSync(env.UPLOADS_DIR, { recursive: true });
    }
  }

  logger.info("Environment validation passed...!!!");
}
