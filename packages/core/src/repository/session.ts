/**
 * Generic SessionRepository implementation using Drizzle ORM
 * Works with any database dialect (SQLite, PostgreSQL, etc.)
 */

import { eq, lt } from 'drizzle-orm';
import type { Session, SessionRepository } from '../types/index.ts';
import type { CoreSchema, DrizzleDatabase } from './user.ts';

/**
 * Generic SessionRepository implementation
 * Works with any Drizzle database and schema
 */
export class DrizzleSessionRepository implements SessionRepository {
	private db: DrizzleDatabase;
	private schema: CoreSchema;

	constructor(db: DrizzleDatabase, schema: CoreSchema) {
		this.db = db;
		this.schema = schema;
	}

	async create(session: {
		id: string;
		userId: string;
		expiresAt: Date;
		lastActivityAt?: Date;
	}): Promise<void> {
		await this.db
			.insert(this.schema.sessions)
			.values({
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				lastActivityAt: session.lastActivityAt ?? new Date()
			})
			.onConflictDoUpdate({
				target: this.schema.sessions.id,
				set: {
					expiresAt: session.expiresAt,
					lastActivityAt: session.lastActivityAt ?? new Date()
				}
			});
	}

	async findById(id: string): Promise<Session | null> {
		// Note: db.query.sessions doesn't exist on DrizzleDatabase interface
		// We need to use select instead
		const results = await (this.db as any)
			.select()
			.from(this.schema.sessions)
			.where(eq(this.schema.sessions.id, id))
			.limit(1);

		const result = results[0];

		if (!result) {
			return null;
		}

		return {
			id: result.id,
			userId: result.userId,
			expiresAt: result.expiresAt,
			createdAt: result.createdAt,
			lastActivityAt: result.lastActivityAt
		};
	}

	async updateActivity(id: string, lastActivityAt: Date): Promise<void> {
		await this.db
			.update(this.schema.sessions)
			.set({ lastActivityAt })
			.where(eq(this.schema.sessions.id, id));
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(this.schema.sessions).where(eq(this.schema.sessions.id, id));
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this.db.delete(this.schema.sessions).where(eq(this.schema.sessions.userId, userId));
	}

	async deleteExpired(): Promise<void> {
		await this.db.delete(this.schema.sessions).where(lt(this.schema.sessions.expiresAt, new Date()));
	}

	async deleteInactive(inactivityPeriod: number): Promise<void> {
		const inactivityThreshold = new Date(Date.now() - inactivityPeriod);
		await this.db
			.delete(this.schema.sessions)
			.where(lt(this.schema.sessions.lastActivityAt, inactivityThreshold));
	}
}
