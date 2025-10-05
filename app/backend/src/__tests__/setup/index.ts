import logger from "@config/logger";
import { initializePatches } from "@db/patch";
import { clearDb, seedData } from "@db/seeders";
import { beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";

beforeAll(async () => {
  try {
    logger.transports.forEach((transport) => {
      transport.silent = true;
    });

    await initializePatches();
    await seedData();
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  await clearDb();
  fs.rmSync(path.join(process.cwd(), "uploads/test"), {
    recursive: true,
  });
});

export const validateError = (body: any) => {
  expect(body).toHaveProperty("success", false);
  expect(body).toHaveProperty("errors");
  expect(body.errors.length).toBeGreaterThanOrEqual(1);
};
