/**
 * Lucia adapter for SQLite
 */

import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';

export function createLuciaAdapter(db: BetterSQLite3Database<typeof schema>) {
	return new DrizzleSQLiteAdapter(db, schema.sessions, schema.users);
}

export function createLucia(
	db: BetterSQLite3Database<typeof schema>,
	env: 'DEV' | 'PROD' = 'DEV'
) {
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
