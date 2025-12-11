import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './migrations',
	migrations: {
		prefix: 'timestamp',
		table: '_migrations'
	},
	schema: './src/server/db/schema',
	dialect: 'sqlite',
	dbCredentials: {
		url: `file:${process.env.DB_PATH || './tracktor.db'}`
	},
	casing: 'snake_case',
	verbose: true
});
