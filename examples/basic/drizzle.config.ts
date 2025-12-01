/**
 * Drizzle configuration for database migrations
 *
 * This example shows how to configure Drizzle to use combined schemas
 * from @brixkit/core (via @brixkit/db-sqlite) and @brixkit/feature-board
 */

import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/server/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: process.env.DATABASE_URL || './data/db.sqlite'
	}
} satisfies Config;
