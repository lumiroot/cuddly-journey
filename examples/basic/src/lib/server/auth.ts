/**
 * Authentication setup
 */

import { AuthService } from '@brixkit/core';
import { SqliteUserRepository, SqliteSessionRepository } from '@brixkit/db-sqlite';
import { db } from './db';

// Create repositories
export const userRepo = new SqliteUserRepository(db);
export const sessionRepo = new SqliteSessionRepository(db);

// Create auth service
export const authService = new AuthService(userRepo, sessionRepo, {
	expiresIn: 1000 * 60 * 60 * 24 * 30, // 30 days
	cookieName: 'auth_session',
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		sameSite: 'lax',
		path: '/'
	}
});
