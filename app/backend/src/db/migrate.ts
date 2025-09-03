#!/usr/bin/env node

import { config } from "dotenv";
import { performDbMigrations } from "./index.js";

config();

const command = process.argv[2];

async function runMigrations() {
  try {
    console.log("Starting database migrations...");
    await performDbMigrations();
    console.log("Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

async function seedDatabase() {
  try {
    const { seedData } = await import("./index.js");
    console.log("Starting database seeding...");
    await seedData();
    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

switch (command) {
  case "migrate":
    runMigrations();
    break;
  case "seed":
    seedDatabase();
    break;
  case "reset":
    console.log("Reset functionality should be implemented with caution");
    break;
  default:
    console.log("Usage: npm run db:migrate | npm run db:seed");
    console.log("Commands:");
    console.log("  migrate  - Run pending migrations");
    console.log("  seed     - Seed database with initial/demo data");
    process.exit(1);
}
