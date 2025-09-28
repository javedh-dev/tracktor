import express from "express";
import cors from "cors";
import pinRoutes from "@routes/pinRoutes.js";
import vehicleRoutes from "@routes/vehicleRoutes.js";
import configRoutes from "@routes/configRoutes.js";
import uploadRoutes from "@routes/uploadRoutes.js";
import { errorHandler } from "@middleware/error-handler.js";
import { env, validateEnvironment } from "@config/env.js";
import { seedData } from "@db/seeders/index.js";
import { initializePatches } from "@db/patch/index.js";
import logger from "@config/logger.js";

validateEnvironment();

const app = express();

const corsOptions = {
  origin: env.CORS_ORIGINS,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-PIN"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use("/api", pinRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/config", configRoutes);
app.use("/api/upload", uploadRoutes);

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

app.use(errorHandler);

// Initialize database patches first, then seed data
initializePatches()
  .then(() => seedData())
  .then(() => {
    app.listen(env.SERVER_PORT, env.SERVER_HOST, () => {
      logger.info("─".repeat(75));
      logger.info(
        `🚀 Server running at http://${env.SERVER_HOST}:${env.SERVER_PORT}`
      );
      logger.info(`Environment: ${env.ENVIRONMENT}`);
      logger.info(`Database: ${env.DATABASE_PATH}`);
      logger.info(`Log Level: ${env.LOG_LEVEL}`);
      // logger.info(`App Version: ${env.APP_VERSION}`);
      logger.info(`Demo Mode: ${env.DEMO_MODE ? "Enabled" : "Disabled"}`);
      logger.info(`CORS: Explicit origins only`);
      logger.info(`Allowed origins: [ ${env.CORS_ORIGINS.join(", ")} ]`);
      logger.info("─".repeat(75));
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database or seed data:", err);
    process.exit(1);
  });
