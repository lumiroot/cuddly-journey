/**
 * PostgreSQL repository implementations using core generic repositories
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { DrizzleUserRepository, DrizzleSessionRepository } from '@brixkit/core/repository';
import type postgres from 'postgres';
import * as schema from './schema.js';

export { drizzle };
export * from './schema.js';

/**
 * Create a UserRepository instance for PostgreSQL
 */
export function createUserRepository(db: ReturnType<typeof drizzle<typeof schema>>) {
	return new DrizzleUserRepository(db as any, schema);
}

/**
 * Create a SessionRepository instance for PostgreSQL
 */
export function createSessionRepository(db: ReturnType<typeof drizzle<typeof schema>>) {
	return new DrizzleSessionRepository(db as any, schema);
}

// Backward compatibility exports
export const PostgresUserRepository = DrizzleUserRepository;
export const PostgresSessionRepository = DrizzleSessionRepository;
