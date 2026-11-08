import { describe, expect, it } from 'vitest';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { mkdtemp, mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('LPG unit migration (#247)', () => {
  it.each(['litre', 'liter', 'gallon', 'kilogram', 'pound'])(
    'upgrades an already-migrated database with %s without replacing valid choices',
    async (unit) => {
      const folder = await mkdtemp(join(tmpdir(), 'tracktor-lpg-'));
      const client = createClient({ url: ':memory:' });
      const db = drizzle(client);
      try {
        const source = 'src/server/db/migrations';
        const journal = JSON.parse(await readFile(`${source}/meta/_journal.json`, 'utf8'));
        journal.entries = journal.entries.filter(
          (entry: { tag: string }) => !entry.tag.endsWith('_normalize-lpg-unit')
        );
        await mkdir(join(folder, 'meta'));
        await writeFile(join(folder, 'meta/_journal.json'), JSON.stringify(journal));
        for (const entry of journal.entries) {
          await copyFile(`${source}/${entry.tag}.sql`, join(folder, `${entry.tag}.sql`));
        }
        await migrate(db, { migrationsFolder: folder });
        await client.execute({
          sql: "UPDATE configs SET value = ? WHERE key = 'unitOfLpg'",
          args: [unit]
        });
        await migrate(db, { migrationsFolder: source });
        const result = await client.execute("SELECT value FROM configs WHERE key = 'unitOfLpg'");
        expect(result.rows[0].value).toBe(unit === 'litre' ? 'liter' : unit);
      } finally {
        client.close();
        await rm(folder, { recursive: true, force: true });
      }
    }
  );
  it('repairs fresh and previously migrated databases without replacing user choices', async () => {
    const client = createClient({ url: ':memory:' });
    const db = drizzle(client);
    try {
      await migrate(db, { migrationsFolder: 'src/server/db/migrations' });
      const read = async () =>
        (await client.execute("SELECT value FROM configs WHERE key = 'unitOfLpg'")).rows[0].value;
      expect(await read()).toBe('liter');
      await client.execute("UPDATE configs SET value = 'gallon' WHERE key = 'unitOfLpg'");
      await migrate(db, { migrationsFolder: 'src/server/db/migrations' });
      expect(await read()).toBe('gallon');
    } finally {
      client.close();
    }
  });
});
