/**
 * Authentication implementation with custom session management
 */

import { hash, verify } from '@node-rs/argon2';
import type { AuthCredentials, AuthResult, Session, User, UserRepository, SessionRepository } from '../types/index.ts';
import { SessionManager, type SessionConfig } from '../session/index.ts';

export interface AuthConfig extends SessionConfig {
	// Additional auth config can go here
}

/**
 * Auth service with custom session management
 */
export class AuthService {
	private userRepo: UserRepository;
	private sessionManager: SessionManager;

	constructor(userRepo: UserRepository, sessionRepo: SessionRepository, config: AuthConfig = {}) {
		this.userRepo = userRepo;
		this.sessionManager = new SessionManager(sessionRepo, config);
	}

	/**
	 * Hash a password using Argon2id
	 */
	async hashPassword(password: string): Promise<string> {
		return hash(password);
	}

	/**
	 * Verify a password against a hash
	 */
	async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
		return verify(passwordHash, password);
	}

	/**
	 * Authenticate user with username and password
	 */
	async authenticate(credentials: AuthCredentials): Promise<AuthResult & { token?: string }> {
		try {
			const user = await this.userRepo.findByUsername(credentials.username);

			if (!user) {
				return { success: false, error: 'Invalid credentials' };
			}

			if (!user.passwordHash) {
				return { success: false, error: 'Password authentication not configured' };
			}

			if (!user.isActive) {
				return { success: false, error: 'User account is not active' };
			}

			const isPasswordValid = await this.verifyPassword(user.passwordHash, credentials.password);

			if (!isPasswordValid) {
				return { success: false, error: 'Invalid credentials' };
			}

			// Create session
			const { session, token } = await this.sessionManager.createSession(user.id);

			return { success: true, user, session, token };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Authentication failed'
			};
		}
	}

	/**
	 * Create a session for a user (used for OAuth and other non-password auth)
	 */
	async createSessionForUser(userId: string): Promise<{ session: Session; token: string; user: User } | null> {
		const user = await this.userRepo.findById(userId);

		if (!user || !user.isActive) {
			return null;
		}

		const { session, token } = await this.sessionManager.createSession(user.id);

		return { session, token, user };
	}

	/**
	 * Validate a session token
	 */
	async validateSessionToken(token: string): Promise<{ session: Session; user: User } | null> {
		const result = await this.sessionManager.validateSessionToken(token);

		if (!result) {
			return null;
		}

		const user = await this.userRepo.findById(result.session.userId);

		if (!user || !user.isActive) {
			await this.sessionManager.invalidateSession(result.session.id);
			return null;
		}

		return { session: result.session, user };
	}

	/**
	 * Invalidate a session (logout)
	 */
	async invalidateSession(sessionId: string): Promise<void> {
		await this.sessionManager.invalidateSession(sessionId);
	}

	/**
	 * Invalidate all sessions for a user
	 */
	async invalidateUserSessions(userId: string): Promise<void> {
		await this.sessionManager.invalidateUserSessions(userId);
	}

	/**
	 * Create a session cookie header
	 */
	createSessionCookie(token: string): string {
		return this.sessionManager.createSessionCookie(token);
	}

	/**
	 * Create a blank session cookie for logout
	 */
	createBlankSessionCookie(): string {
		return this.sessionManager.createBlankSessionCookie();
	}

	/**
	 * Get the session cookie name
	 */
	getSessionCookieName(): string {
		return this.sessionManager.getCookieName();
	}

	/**
	 * Clean up expired sessions
	 */
	async cleanupExpiredSessions(): Promise<void> {
		await this.sessionManager.cleanupExpiredSessions();
	}
}
