/**
 * Database initialization
 *
 * This example shows how to combine core schemas from @brixkit/db-sqlite
 * with feature schemas from @brixkit/feature-board
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as coreSchema from '@brixkit/db-sqlite';
import { sqliteSchema as boardSchema } from '@brixkit/feature-board/schema';

// Combine core and feature schemas
const schema = {
	...coreSchema,
	...boardSchema
};

const sqlite = new Database(process.env.DATABASE_URL || './data/db.sqlite');
export const db = drizzle(sqlite, { schema });
