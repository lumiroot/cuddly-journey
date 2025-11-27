/**
 * Authentication implementation with Lucia
 */

import { Lucia, type Session as LuciaSession, type User as LuciaUser } from 'lucia';
import { Argon2id } from 'oslo/password';
import type { AuthCredentials, AuthResult, Session, User, UserRepository } from '../types/index.js';

export interface AuthConfig {
	sessionExpiresIn?: {
		activePeriod: number;
		idlePeriod: number;
	};
}

/**
 * Auth service using Lucia for session management
 */
export class AuthService {
	private userRepo: UserRepository;
	private lucia: Lucia | null = null;
	private argon2id: Argon2id;

	constructor(userRepo: UserRepository, config: AuthConfig = {}) {
		this.userRepo = userRepo;
		this.argon2id = new Argon2id();
	}

	/**
	 * Initialize Lucia with an adapter
	 * Call this method with your Lucia adapter before using authentication
	 */
	initializeLucia(lucia: Lucia) {
		this.lucia = lucia;
	}

	/**
	 * Hash a password using Argon2id
	 */
	async hashPassword(password: string): Promise<string> {
		return this.argon2id.hash(password);
	}

	/**
	 * Verify a password against a hash
	 */
	async verifyPassword(hash: string, password: string): Promise<boolean> {
		return this.argon2id.verify(hash, password);
	}

	/**
	 * Authenticate user with username and password
	 */
	async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
		try {
			if (!this.lucia) {
				return { success: false, error: 'Lucia not initialized' };
			}

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

			// Create session with Lucia
			const luciaSession = await this.lucia.createSession(user.id, {});

			const session: Session = {
				id: luciaSession.id,
				userId: luciaSession.userId,
				expiresAt: luciaSession.expiresAt,
				createdAt: new Date()
			};

			return { success: true, user, session };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Authentication failed'
			};
		}
	}

	/**
	 * Validate a session
	 */
	async validateSession(sessionId: string): Promise<{ session: Session; user: User } | null> {
		if (!this.lucia) {
			return null;
		}

		const result = await this.lucia.validateSession(sessionId);

		if (!result.session || !result.user) {
			return null;
		}

		const user = await this.userRepo.findById(result.user.id);

		if (!user) {
			return null;
		}

		const session: Session = {
			id: result.session.id,
			userId: result.session.userId,
			expiresAt: result.session.expiresAt,
			createdAt: new Date()
		};

		return { session, user };
	}

	/**
	 * Invalidate a session (logout)
	 */
	async invalidateSession(sessionId: string): Promise<void> {
		if (!this.lucia) {
			return;
		}

		await this.lucia.invalidateSession(sessionId);
	}

	/**
	 * Invalidate all sessions for a user
	 */
	async invalidateUserSessions(userId: string): Promise<void> {
		if (!this.lucia) {
			return;
		}

		await this.lucia.invalidateUserSessions(userId);
	}

	/**
	 * Create a session cookie header
	 */
	createSessionCookie(sessionId: string): string {
		if (!this.lucia) {
			throw new Error('Lucia not initialized');
		}

		const sessionCookie = this.lucia.createSessionCookie(sessionId);
		return sessionCookie.serialize();
	}

	/**
	 * Create a blank session cookie for logout
	 */
	createBlankSessionCookie(): string {
		if (!this.lucia) {
			throw new Error('Lucia not initialized');
		}

		const sessionCookie = this.lucia.createBlankSessionCookie();
		return sessionCookie.serialize();
	}
}

// Re-export Lucia types for convenience
export type { LuciaSession, LuciaUser };
