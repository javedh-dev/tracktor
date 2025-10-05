import logger from "@config/logger";
import { initializePatches } from "@db/patch";
import { clearDb, seedData } from "@db/seeders";
import { beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";

// Global test setup
beforeAll(async () => {
  try {
    // Suppress logs during testing
    logger.silent = true;

    await initializePatches();
    await seedData();
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await clearDb();

    // Clean up test uploads directory
    const testUploadsPath = path.join(process.cwd(), "uploads", "test");
    if (fs.existsSync(testUploadsPath)) {
      fs.rmSync(testUploadsPath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error("Test cleanup failed:", error);
  }
});

export const validateError = (body: any) => {
  expect(body).toHaveProperty("success", false);
  expect(body).toHaveProperty("errors");
  expect(body.errors.length).toBeGreaterThanOrEqual(1);
};
