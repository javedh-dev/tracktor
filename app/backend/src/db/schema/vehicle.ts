import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { timestamps } from "./audit";

export const vehicleTable = table("vehicles", {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  make: t.text().notNull(),
  model: t.text().notNull(),
  year: t.integer().notNull(),
  licensePlate: t.text().notNull(),
  vin: t.text(),
  color: t.text(),
  odometer: t.integer(),
  image: t.text(),
  ...timestamps,
});
