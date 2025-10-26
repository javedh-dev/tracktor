import { sqliteTable as table } from "drizzle-orm/sqlite-core";
import * as t from "drizzle-orm/sqlite-core";
import { vehicleTable } from "./vehicle";
import { timestamps } from "./audit";

export const pollutionCertificateTable = table("pollution_certificates", {
  id: t
    .text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vehicleId: t
    .text()
    .notNull()
    .references(() => vehicleTable.id, { onDelete: "cascade" }),
  certificateNumber: t.text().notNull(),
  issueDate: t.text().notNull(),
  expiryDate: t.text().notNull(),
  testingCenter: t.text().notNull(),
  notes: t.text(),
  ...timestamps,
});
