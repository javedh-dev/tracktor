import * as schema from '$server/db/schema/index';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '$lib/config/env.server';

const db = drizzle({
  connection: { url: `file:${env.DB_PATH! || './tracktor.db'}` },
  casing: 'snake_case',
  schema: {
    ...schema
  }
});

export { db };

// Serialize local writes so a synchronous SQLite lock wait cannot block the
// JavaScript continuation that needs to commit the preceding transaction.
let writeQueue: Promise<unknown> = Promise.resolve();
export function writeTransaction<T>(
  work: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  const pending = writeQueue.then(() => db.transaction(work));
  writeQueue = pending.then(
    () => undefined,
    () => undefined
  );
  return pending;
}
