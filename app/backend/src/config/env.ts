/**
 * Environment Configuration
 * Centralized environment variable management for the backend
 */

export const env = {
  // Application Environment
  NODE_ENV: process.env.NODE_ENV || "development",

  // Server Configuration
  SERVER_HOST: process.env.SERVER_HOST || "0.0.0.0",
  SERVER_PORT: Number(process.env.SERVER_PORT) || 3000,

  // Database Configuration
  DATABASE_PATH: process.env.DATABASE_PATH || "./vehicles.db",

  // Application Features
  DEMO_MODE: process.env.DEMO_MODE === "true",

  // CORS Configuration
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(",").map((origin) =>
    origin.trim(),
  ) || [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ],

  // Logging Configuration
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  LOG_REQUESTS: process.env.LOG_REQUESTS === "true",

  // Helper methods
  isDevelopment: () => process.env.NODE_ENV === "development",
  isProduction: () => process.env.NODE_ENV === "production",
  isTest: () => process.env.NODE_ENV === "test",
} as const;

export default env;

/**
 * Validate required environment variables
 */
export function validateEnvironment(): void {
  const required = ["NODE_ENV"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      "❌ Missing required environment variables:",
      missing.join(", "),
    );
    process.exit(1);
  }

  // Validate port numbers
  if (
    isNaN(env.SERVER_PORT) ||
    env.SERVER_PORT < 1 ||
    env.SERVER_PORT > 65535
  ) {
    console.error("❌ Invalid SERVER_PORT:", process.env.SERVER_PORT);
    process.exit(1);
  }

  console.log("✅ Environment validation passed");
}
