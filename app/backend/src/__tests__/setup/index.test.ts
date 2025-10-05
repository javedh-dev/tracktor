import { initializePatches } from "@db/patch";
import { clearDb, seedData } from "@db/seeders";
import { beforeAll, afterAll } from "@jest/globals";

beforeAll(async () => {
  try {
    await initializePatches();
    await seedData();
  } catch (error) {
    console.error("Test setup failed:", error);
    throw error;
  }
});

afterAll(async () => {
  await clearDb();
});

export const validateError = (body: any) => {
  expect(body).toHaveProperty("success", false);
  expect(body).toHaveProperty("errors");
  expect(body.errors.length).toBeGreaterThanOrEqual(1);
};
