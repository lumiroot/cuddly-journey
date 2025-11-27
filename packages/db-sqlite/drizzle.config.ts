import type { Config } from 'drizzle-kit';

export default {
	schema: './src/schema.ts',
	out: './drizzle',
	driver: 'better-sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL || './data/db.sqlite'
	}
} satisfies Config;
