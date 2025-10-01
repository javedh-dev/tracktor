import express from "express";
import {
  authRoutes,
  vehicleRoutes,
  configRoutes,
  uploadRoutes,
} from "@routes/index.js";
import {
  errorHandler,
  corsHandler,
  rateLimiter,
  requestLogger,
  authHandler,
} from "@middleware/index.js";
import { seedData } from "@db/seeders/index.js";
import { initializePatches } from "@db/patch/index.js";
import logger from "./src/utils/logger.js";
import { appAsciiArt, validateEnvironment, env } from "@utils/index.js";

logger.info(appAsciiArt);
validateEnvironment();

const app = express();

const frontendHandler = async () => {
  // Serve frontend using vite in development and static files in production
  if (env.ENVIRONMENT === "production") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { handler } = await import("../frontend/handler.js");
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
  logger.info(`Environment: ${env.ENVIRONMENT}`);
  logger.info(`Database: ${env.DATABASE_PATH}`);
  logger.info(`Log Level: ${env.LOG_LEVEL}`);
  // logger.info(`App Version: ${env.APP_VERSION}`);
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
  // Apply middlewares
  app.use(corsHandler);
  app.use(rateLimiter);
  app.use(express.json());
  app.use(requestLogger);
  app.use(authHandler);

  // Define API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/vehicles", vehicleRoutes);
  app.use("/api/config", configRoutes);
  app.use("/api/upload", uploadRoutes);

  // Serve frontend
  await frontendHandler();

  // Global error handler
  app.use(errorHandler);
  app.listen(env.SERVER_PORT, env.SERVER_HOST, startupCallback);
};

// Start the server
start(app);
