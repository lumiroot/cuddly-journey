/**
 * Database initialization
 *
 * This example shows how to combine core schemas from @brixkit/db-sqlite
 * with feature schemas from @brixkit/feature-board
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { schema } from './schema.ts';

const sqlite = new Database(process.env.DATABASE_URL || './data/db.sqlite');
export const db = drizzle(sqlite, { schema });
