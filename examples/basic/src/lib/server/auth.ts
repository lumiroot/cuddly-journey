/**
 * Authentication setup
 */

import { AuthService } from '@brixkit/core';
import { createUserRepository, createSessionRepository } from '@brixkit/db-sqlite';
import { db } from './db';

// Create repositories using helper functions
export const userRepo = createUserRepository(db);
export const sessionRepo = createSessionRepository(db);

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
