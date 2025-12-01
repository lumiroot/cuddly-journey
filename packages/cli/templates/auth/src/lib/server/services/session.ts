/**
 * Session management implementation
 * Based on Lucia v3 patterns with inactivity timeout support
 */

import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { sha256 } from '@oslojs/crypto/sha2';
import type { Session, SessionRepository } from '../types/auth.ts';

export interface SessionConfig {
	/**
	 * Session expiration time in milliseconds (absolute timeout)
	 * Default: 30 days
	 */
	expiresIn?: number;
	/**
	 * Inactivity timeout in milliseconds
	 * Session expires after this period of inactivity
	 * Default: 2 hours
	 */
	inactivityTimeout?: number;
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
const DEFAULT_INACTIVITY_TIMEOUT = 1000 * 60 * 60 * 2; // 2 hours
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
			inactivityTimeout: config.inactivityTimeout ?? DEFAULT_INACTIVITY_TIMEOUT,
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

		const now = new Date();
		const expiresAt = new Date(Date.now() + this.config.expiresIn);

		await this.sessionRepo.create({
			id: sessionId,
			userId,
			expiresAt,
			lastActivityAt: now
		});

		const session: Session = {
			id: sessionId,
			userId,
			expiresAt,
			createdAt: now,
			lastActivityAt: now,
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

		const now = Date.now();

		// Check if session is expired (absolute timeout)
		if (now >= session.expiresAt.getTime()) {
			await this.sessionRepo.delete(sessionId);
			return null;
		}

		// Check if session is inactive (inactivity timeout)
		const timeSinceLastActivity = now - session.lastActivityAt.getTime();
		if (timeSinceLastActivity >= this.config.inactivityTimeout) {
			await this.sessionRepo.delete(sessionId);
			return null;
		}

		// Update last activity time
		const newLastActivityAt = new Date(now);
		await this.sessionRepo.updateActivity(sessionId, newLastActivityAt);
		session.lastActivityAt = newLastActivityAt;

		// Check if session needs refresh (less than 15 days remaining on absolute expiration)
		const fifteenDaysInMs = 1000 * 60 * 60 * 24 * 15;
		const fresh = session.expiresAt.getTime() - now >= fifteenDaysInMs;

		// Extend session absolute expiration if needed
		if (!fresh) {
			session.expiresAt = new Date(now + this.config.expiresIn);
			await this.sessionRepo.create({
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				lastActivityAt: newLastActivityAt
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

	/**
	 * Clean up inactive sessions
	 */
	async cleanupInactiveSessions(): Promise<void> {
		await this.sessionRepo.deleteInactive(this.config.inactivityTimeout);
	}
}
