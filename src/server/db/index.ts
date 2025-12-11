import * as schema from '@db/schema/index';
import { drizzle } from 'drizzle-orm/libsql';
import { env } from '@config/env';

const db = drizzle({
	connection: { url: `file:${env.DB_PATH! || './tracktor.db'}` },
	casing: 'snake_case',
	schema: {
		...schema
	}
});

export { db };
