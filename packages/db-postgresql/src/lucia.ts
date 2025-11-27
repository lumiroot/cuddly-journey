/**
 * Lucia adapter for PostgreSQL
 */

import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

export function createLuciaAdapter(db: PostgresJsDatabase<typeof schema>) {
	return new DrizzlePostgreSQLAdapter(db, schema.sessions, schema.users);
}

export function createLucia(db: PostgresJsDatabase<typeof schema>, env: 'DEV' | 'PROD' = 'DEV') {
	const adapter = createLuciaAdapter(db);

	return new Lucia(adapter, {
		sessionCookie: {
			attributes: {
				secure: env === 'PROD'
			}
		},
		getUserAttributes: (attributes) => {
			return {
				username: attributes.username,
				email: attributes.email
			};
		}
	});
}

declare module 'lucia' {
	interface Register {
		Lucia: ReturnType<typeof createLucia>;
		DatabaseUserAttributes: {
			username: string;
			email: string;
		};
	}
}
