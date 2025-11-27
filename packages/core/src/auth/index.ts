/**
 * Basic authentication implementation with ID/Password
 */

import bcrypt from 'bcrypt';
import type {
	AuthProvider,
	AuthCredentials,
	AuthResult,
	Session,
	UserRepository
} from '../types/index.js';

export interface BasicAuthConfig {
	saltRounds?: number;
	sessionDurationMs?: number;
}

export class BasicAuthProvider implements AuthProvider {
	private userRepo: UserRepository;
	private config: Required<BasicAuthConfig>;
	private sessions = new Map<string, Session>();

	constructor(userRepo: UserRepository, config: BasicAuthConfig = {}) {
		this.userRepo = userRepo;
		this.config = {
			saltRounds: config.saltRounds ?? 10,
			sessionDurationMs: config.sessionDurationMs ?? 24 * 60 * 60 * 1000 // 24 hours
		};
	}

	async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
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

			const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

			if (!isPasswordValid) {
				return { success: false, error: 'Invalid credentials' };
			}

			const session = this.createSession(user.id);
			this.sessions.set(session.id, session);

			return { success: true, user, session };
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Authentication failed'
			};
		}
	}

	async validateSession(sessionId: string): Promise<Session | null> {
		const session = this.sessions.get(sessionId);

		if (!session) {
			return null;
		}

		if (session.expiresAt < new Date()) {
			this.sessions.delete(sessionId);
			return null;
		}

		return session;
	}

	async destroySession(sessionId: string): Promise<void> {
		this.sessions.delete(sessionId);
	}

	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, this.config.saltRounds);
	}

	private createSession(userId: string): Session {
		return {
			id: crypto.randomUUID(),
			userId,
			createdAt: new Date(),
			expiresAt: new Date(Date.now() + this.config.sessionDurationMs)
		};
	}
}
