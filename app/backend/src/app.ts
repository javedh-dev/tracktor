import express from "express";
import {
  authRoutes,
  vehicleRoutes,
  configRoutes,
  fileRoutes,
} from "@routes/index";
import {
  errorHandler,
  corsHandler,
  rateLimiter,
  requestLogger,
  authHandler,
  jsonHandler,
} from "@middlewares/index";
import { seedData } from "@db/seeders";
import { initializePatches } from "@db/patch";
import { validateEnvironment, env, logger } from "@config/index";
import { isProduction, isTest } from "@config/env";

validateEnvironment();

const app = express();

const frontendHandler = async () => {
  // Serve frontend using vite in development and static files in production
  if (isProduction) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { handler } = await import("../../frontend/handler.js");
    app.use(handler);
  } else {
    app.get("/", (_, res) => {
      res.redirect("http://localhost:5173");
    });
  }
};

const startupCallback = () => {
  logger.info("─".repeat(75));
  logger.info(`Server running at http://${env.SERVER_HOST}:${env.SERVER_PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
  logger.info(`Database: ${env.DB_PATH}`);
  logger.info(`Log Level: ${env.LOG_LEVEL}`);
  if (env.APP_VERSION) logger.info(`App Version: ${env.APP_VERSION}`);
  logger.info(`Demo Mode: ${env.DEMO_MODE ? "Enabled" : "Disabled"}`);
  logger.info(`CORS: Explicit origins only`);
  logger.info(`Allowed origins: [ ${env.CORS_ORIGINS.join(", ")} ]`);
  logger.info("─".repeat(75));
};

const start = async (app: express.Express) => {
  try {
    logger.info("Initializing database and applying patches...");
    await initializePatches();
    await seedData();
    logger.info("Database ready.");
  } catch (err) {
    logger.error("Failed to initialize database or seed data:", err);
    process.exit(1);
  }
  // Serve frontend
  await frontendHandler();

  app.listen(env.SERVER_PORT, env.SERVER_HOST, startupCallback);
};

// Apply middlewares
app.use(jsonHandler);
app.use(requestLogger);

if (!isTest) {
  app.use(authHandler);
  app.use(corsHandler);
  app.use(rateLimiter);
}

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/config", configRoutes);
app.use("/api/files", fileRoutes);

// Global error handler
app.use(errorHandler);

export { start };
export default app;
