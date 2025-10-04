import "dotenv/config";
import * as schema from "@db/schema/index";
import { drizzle } from "drizzle-orm/libsql";

const db = drizzle({
  connection: { url: `file:${process.env.DATABASE_PATH! || "./tracktor.db"}` },
  casing: "snake_case",
  schema: {
    ...schema,
  },
});

export { db };
