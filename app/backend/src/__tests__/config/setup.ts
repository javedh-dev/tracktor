import { initializePatches } from "@db/patch";
import { seedData } from "@db/seeders";
import { beforeAll, afterAll } from "@jest/globals";
import { logger } from "@config/index";

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = "test";
  process.env.AUTH_PIN = "123456";
  process.env.DATABASE_PATH = "./tracktor.test.db";

  try {
    // Suppress logs during testing
    logger.transports.forEach((transport) => {
      transport.silent = true;
    });

    // Initialize database for testing
    await initializePatches();
    await seedData();
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  // Cleanup if needed
});
