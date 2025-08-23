import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from root directory
config({ path: resolve(process.cwd(), "../../.env") });

import express from "express";
import cors from "cors";
import pinRoutes from "@routes/pinRoutes.js";
import vehicleRoutes from "@routes/vehicleRoutes.js";
import configRoutes from "@routes/configRoutes.js";
import { initializeDatabase } from "@db/init.js";
import { errorHandler } from "@middleware/error-handler.js";
import env, { validateEnvironment } from "@config/env.js";

// Validate environment before starting
validateEnvironment();

const app = express();

// Configure CORS - simplified for development
const corsOptions = env.isDevelopment()
  ? {
      // In development, allow all origins for easier debugging
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-User-PIN"],
      optionsSuccessStatus: 200,
    }
  : {
      // In production, use strict origin checking
      origin: env.CORS_ORIGINS,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-User-PIN"],
      optionsSuccessStatus: 200,
    };

app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api", pinRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/config", configRoutes);

if (env.isProduction()) {
  // @ts-ignore
  const { handler } = await import("@frontend/build/handler.js");
  app.use(handler);
} else {
  // In dev, redirect to SvelteKit dev server
  app.use("/", (req, res) => {
    const clientPort = process.env.CLIENT_PORT || 5173;
    res.redirect(`http://localhost:${clientPort}${req.originalUrl}`);
  });
}

app.use(errorHandler);

initializeDatabase()
  .then(() => {
    app.listen(env.SERVER_PORT, env.SERVER_HOST, () => {
      console.log("─".repeat(75));
      console.log(
        `🚀 Server running at http://${env.SERVER_HOST}:${env.SERVER_PORT}`,
      );
      console.log(`📊 Environment: ${env.NODE_ENV}`);
      console.log(`🗄️ Database: ${env.DATABASE_PATH}`);
      console.log(`🎭 Demo Mode: ${env.DEMO_MODE ? "Enabled" : "Disabled"}`);
      console.log(
        `🌐 CORS: ${env.isDevelopment() ? "Permissive (Development)" : "Strict (Production)"}`,
      );
      if (!env.isDevelopment()) {
        console.log(`📋 Allowed origins: ${env.CORS_ORIGINS.join(", ")}`);
      }
      console.log("─".repeat(75));
    });
  })
  .catch((err) => {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  });
