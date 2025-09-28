import { config } from "dotenv";
import { resolve } from "path";
import logger from "./logger.js";

// Load environment variables from root directory
config({
  path: resolve(process.cwd(), "../../.env"),
  override: true,
  quiet: true,
});

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
  ENVIRONMENT: process.env.NODE_ENV || "development",
  SERVER_HOST: process.env.SERVER_HOST || "0.0.0.0",
  AUTH_PIN: process.env.AUTH_PIN || "123456",
  SERVER_PORT: Number(process.env.SERVER_PORT) || 3000,
  DATABASE_PATH: process.env.DATABASE_PATH || "./tracktor.db",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  DEMO_MODE: process.env.PUBLIC_DEMO_MODE === "true",
  FORCE_SEED: process.env.FORCE_SEED === "true",
  CORS_ORIGINS: getOrigins(),
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_REQUESTS: process.env.LOG_REQUESTS === "true",
  LOG_DIR: process.env.LOG_DIR || "./logs",
} as const;

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  logger.info("Validating environment...");
  const required: string[] = [];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
    process.exit(1);
  }

  // Validate port numbers
  if (
    isNaN(env.SERVER_PORT) ||
    env.SERVER_PORT < 1 ||
    env.SERVER_PORT > 65535
  ) {
    logger.error(`Invalid SERVER_PORT: ${process.env.SERVER_PORT}`);
    process.exit(1);
  }

  logger.info("Environment validation passed...!!!");
}
