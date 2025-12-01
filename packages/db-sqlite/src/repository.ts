/**
 * SQLite repository implementations using core generic repositories
 */

import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DrizzleUserRepository, DrizzleSessionRepository } from '@brixkit/core/repository';
import * as schema from './schema.ts';

export { drizzle };
export * from './schema.ts';

/**
 * Create a UserRepository instance for SQLite
 */
export function createUserRepository(db: BetterSQLite3Database<typeof schema>) {
	return new DrizzleUserRepository(db as any, schema);
}

/**
 * Create a SessionRepository instance for SQLite
 */
export function createSessionRepository(db: BetterSQLite3Database<typeof schema>) {
	return new DrizzleSessionRepository(db as any, schema);
}

// Backward compatibility exports
export const SqliteUserRepository = DrizzleUserRepository;
export const SqliteSessionRepository = DrizzleSessionRepository;
