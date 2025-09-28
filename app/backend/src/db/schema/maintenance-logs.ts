import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { vehicleTable } from "./vehicle.js";
import { timestamps } from "./audit.js";

export const maintenanceLogTable = table("maintenance_logs", {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vehicleId: t
    .text()
    .notNull()
    .references(() => vehicleTable.id, { onDelete: "cascade" }),
  date: t.text().notNull(),
  odometer: t.integer().notNull(),
  serviceCenter: t.text().notNull(),
  cost: t.real().notNull(),
  notes: t.text(),
  ...timestamps,
});
