import { initializePatches } from "@db/patch";
import { seedData } from "@db/seeders";
import { beforeAll, afterAll } from "@jest/globals";
import { logger } from "@config/index";
import { Console } from "winston/lib/winston/transports";

// Global test setup
beforeAll(async () => {
  try {
    // Suppress logs during testing
    logger.transports.forEach((transport) => {
      transport.silent = true;
    });
    logger.transports.push(new Console());

    // Initialize database for testing
    await initializePatches();
    await seedData();
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  //await clearDb();
});

export const validateError = (body: any) => {
  expect(body).toHaveProperty("success", false);
  expect(body).toHaveProperty("errors");
  expect(body.errors.length).toBeGreaterThanOrEqual(1);
};
