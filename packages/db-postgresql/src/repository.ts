/**
 * PostgreSQL repository implementations using core generic repositories
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import { DrizzleUserRepository, DrizzleSessionRepository } from '@brixkit/core/repository';
import type postgres from 'postgres';
import * as schema from './schema.ts';

export { drizzle };
export * from './schema.ts';

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

// Re-export repository classes for direct instantiation if needed
export { DrizzleUserRepository as PostgresUserRepository, DrizzleSessionRepository as PostgresSessionRepository } from '@brixkit/core/repository';
