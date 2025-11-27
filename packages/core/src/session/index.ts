/**
 * Custom session management implementation
 * Based on Lucia v3 patterns but implemented from scratch
 */

import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { Session, SessionRepository } from '../types/index.js';

export interface SessionConfig {
	/**
	 * Session expiration time in milliseconds
	 * Default: 30 days
	 */
	expiresIn?: number;
	/**
	 * Cookie name for the session
	 * Default: 'auth_session'
	 */
	cookieName?: string;
	/**
	 * Cookie options
	 */
	cookie?: {
		secure?: boolean;
		httpOnly?: boolean;
		sameSite?: 'lax' | 'strict' | 'none';
		path?: string;
		domain?: string;
	};
}

const DEFAULT_SESSION_EXPIRES_IN = 1000 * 60 * 60 * 24 * 30; // 30 days
const DEFAULT_COOKIE_NAME = 'auth_session';

/**
 * Session manager for handling session creation, validation, and cookies
 */
export class SessionManager {
	private sessionRepo: SessionRepository;
	private config: Required<SessionConfig>;

	constructor(sessionRepo: SessionRepository, config: SessionConfig = {}) {
		this.sessionRepo = sessionRepo;
		this.config = {
			expiresIn: config.expiresIn ?? DEFAULT_SESSION_EXPIRES_IN,
			cookieName: config.cookieName ?? DEFAULT_COOKIE_NAME,
			cookie: {
				secure: config.cookie?.secure ?? true,
				httpOnly: config.cookie?.httpOnly ?? true,
				sameSite: config.cookie?.sameSite ?? 'lax',
				path: config.cookie?.path ?? '/',
				domain: config.cookie?.domain
			}
		};
	}

	/**
	 * Generate a new session token
	 */
	private generateSessionToken(): string {
		const bytes = new Uint8Array(20);
		crypto.getRandomValues(bytes);
		return encodeBase32LowerCaseNoPadding(bytes);
	}

	/**
	 * Create a session ID from a token
	 */
	private createSessionId(token: string): string {
		return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	}

	/**
	 * Create a new session for a user
	 */
	async createSession(userId: string): Promise<{ session: Session; token: string }> {
		const token = this.generateSessionToken();
		const sessionId = this.createSessionId(token);

		const expiresAt = new Date(Date.now() + this.config.expiresIn);

		await this.sessionRepo.create({
			id: sessionId,
			userId,
			expiresAt
		});

		const session: Session = {
			id: sessionId,
			userId,
			expiresAt,
			createdAt: new Date(),
			fresh: true
		};

		return { session, token };
	}

	/**
	 * Validate a session token
	 * Returns the session if valid, null otherwise
	 */
	async validateSessionToken(token: string): Promise<{ session: Session; fresh: boolean } | null> {
		const sessionId = this.createSessionId(token);
		const session = await this.sessionRepo.findById(sessionId);

		if (!session) {
			return null;
		}

		// Check if session is expired
		if (Date.now() >= session.expiresAt.getTime()) {
			await this.sessionRepo.delete(sessionId);
			return null;
		}

		// Check if session needs refresh (less than 15 days remaining)
		const fifteenDaysInMs = 1000 * 60 * 60 * 24 * 15;
		const fresh = session.expiresAt.getTime() - Date.now() >= fifteenDaysInMs;

		// Extend session if needed
		if (!fresh) {
			session.expiresAt = new Date(Date.now() + this.config.expiresIn);
			await this.sessionRepo.create({
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt
			});
		}

		return { session: { ...session, fresh }, fresh };
	}

	/**
	 * Invalidate a session
	 */
	async invalidateSession(sessionId: string): Promise<void> {
		await this.sessionRepo.delete(sessionId);
	}

	/**
	 * Invalidate all sessions for a user
	 */
	async invalidateUserSessions(userId: string): Promise<void> {
		await this.sessionRepo.deleteByUserId(userId);
	}

	/**
	 * Create a session cookie string
	 */
	createSessionCookie(token: string): string {
		const attributes: string[] = [
			`${this.config.cookieName}=${token}`,
			`Path=${this.config.cookie.path}`,
			`Max-Age=${Math.floor(this.config.expiresIn / 1000)}`,
			`HttpOnly`
		];

		if (this.config.cookie.secure) {
			attributes.push('Secure');
		}

		if (this.config.cookie.sameSite) {
			attributes.push(`SameSite=${this.config.cookie.sameSite}`);
		}

		if (this.config.cookie.domain) {
			attributes.push(`Domain=${this.config.cookie.domain}`);
		}

		return attributes.join('; ');
	}

	/**
	 * Create a blank session cookie for logout
	 */
	createBlankSessionCookie(): string {
		const attributes: string[] = [
			`${this.config.cookieName}=`,
			`Path=${this.config.cookie.path}`,
			`Max-Age=0`,
			`HttpOnly`
		];

		if (this.config.cookie.secure) {
			attributes.push('Secure');
		}

		if (this.config.cookie.sameSite) {
			attributes.push(`SameSite=${this.config.cookie.sameSite}`);
		}

		if (this.config.cookie.domain) {
			attributes.push(`Domain=${this.config.cookie.domain}`);
		}

		return attributes.join('; ');
	}

	/**
	 * Get the cookie name
	 */
	getCookieName(): string {
		return this.config.cookieName;
	}

	/**
	 * Clean up expired sessions
	 */
	async cleanupExpiredSessions(): Promise<void> {
		await this.sessionRepo.deleteExpired();
	}
}
