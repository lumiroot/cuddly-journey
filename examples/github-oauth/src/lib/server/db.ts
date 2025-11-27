/**
 * Database initialization
 */

import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@brixkit/db-sqlite';

const sqlite = new Database(process.env.DATABASE_URL || './data/db.sqlite');
export const db = drizzle(sqlite, { schema });
