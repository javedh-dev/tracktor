#!/usr/bin/env node

import { config } from "dotenv";
import { db } from "./db.js";
import {
  Auth,
  Config,
  FuelLog,
  Insurance,
  MaintenanceLog,
  PollutionCertificate,
  Vehicle,
} from "@models/index.js";

config();

async function checkDatabaseStatus() {
  try {
    await db.authenticate();
    console.log("✓ Database connection successful");

    const tables = await db.getQueryInterface().showAllTables();
    console.log(`✓ Found ${tables.length} tables:`, tables.join(", "));

    const counts = await Promise.all([
      Vehicle.count(),
      Insurance.count(),
      MaintenanceLog.count(),
      FuelLog.count(),
      PollutionCertificate.count(),
      Config.count(),
      Auth.count(),
    ]);

    console.log("\n📊 Record counts:");
    console.log(`  Vehicles: ${counts[0]}`);
    console.log(`  Insurance: ${counts[1]}`);
    console.log(`  Maintenance Logs: ${counts[2]}`);
    console.log(`  Fuel Logs: ${counts[3]}`);
    console.log(`  Pollution Certificates: ${counts[4]}`);
    console.log(`  Configs: ${counts[5]}`);
    console.log(`  Auth: ${counts[6]}`);

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database status check failed:", error);
    process.exit(1);
  }
}

checkDatabaseStatus();
