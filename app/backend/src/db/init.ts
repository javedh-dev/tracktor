import { performDbMigrations, seedData } from "./index.js";

export const initializeDatabase = async () => {
  try {
    console.log("Initializing database...");

    await performDbMigrations();
    console.log("✓ Database migrations completed");

    await seedData();
    console.log("✓ Database seeding completed");

    console.log("Database initialization successful!");
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
};
