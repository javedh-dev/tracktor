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
