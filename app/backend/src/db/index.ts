import { Umzug, SequelizeStorage } from "umzug";
import path from "path";
import { fileURLToPath } from "url";
import { db } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, "migrations/*.ts"),
    resolve: ({ name, path: migrationPath }) => {
      return {
        name,
        up: async (params) => {
          const migration = await import(migrationPath || "");
          return migration.up(params);
        },
        down: async (params) => {
          const migration = await import(migrationPath || "");
          return migration.down(params);
        },
      };
    },
  },
  context: db.getQueryInterface(),
  storage: new SequelizeStorage({
    tableName: "migrations",
    sequelize: db,
  }),
  logger: console,
});

type Migration = typeof umzug._types.migration;

const performDbMigrations = async () => {
  try {
    console.log("Running database migrations...");
    await umzug.up();
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

const seedData = async () => {
  const demoMode = process.env.DEMO_MODE === "true";

  if (demoMode) {
    console.log("Demo mode enabled - seeding with sample data");
    await insertDummyData();
  } else {
    await setupPinAndConfigs();
  }
};

const setupPinAndConfigs = async () => {
  const { seedInitialConfig, seedAuthPin } = await import("./seeders/index.js");

  await seedInitialConfig();

  const pin = process.env.AUTH_PIN;
  if (pin) {
    await seedAuthPin(pin);
  }
};

const insertDummyData = async () => {
  try {
    const { seedDemoData, seedAuthPin } = await import("./seeders/index.js");

    await setupPinAndConfigs();
    await seedAuthPin("123456");
    await seedDemoData();
  } catch (error) {
    console.error("Error populating database:", error);
    throw error;
  }
};

export { Migration, performDbMigrations, seedData, db };
