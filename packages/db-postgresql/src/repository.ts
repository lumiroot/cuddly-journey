/**
 * PostgreSQL UserRepository implementation
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, lt } from 'drizzle-orm';
import type { User, UserRepository, Session, SessionRepository } from '@brixkit/core';
import * as schema from './schema.js';

export class PostgresUserRepository implements UserRepository {
	private db: PostgresJsDatabase<typeof schema>;

	constructor(db: PostgresJsDatabase<typeof schema>) {
		this.db = db;
	}

	async findById(id: string): Promise<User | null> {
		const result = await this.db.query.users.findFirst({
			where: eq(schema.users.id, id),
			with: {
				userRoles: {
					with: {
						role: {
							with: {
								rolePermissions: {
									with: {
										permission: true
									}
								}
							}
						}
					}
				}
			}
		});

		return result ? this.mapToUser(result) : null;
	}

	async findByEmail(email: string): Promise<User | null> {
		const result = await this.db.query.users.findFirst({
			where: eq(schema.users.email, email),
			with: {
				userRoles: {
					with: {
						role: {
							with: {
								rolePermissions: {
									with: {
										permission: true
									}
								}
							}
						}
					}
				}
			}
		});

		return result ? this.mapToUser(result) : null;
	}

	async findByUsername(username: string): Promise<User | null> {
		const result = await this.db.query.users.findFirst({
			where: eq(schema.users.username, username),
			with: {
				userRoles: {
					with: {
						role: {
							with: {
								rolePermissions: {
									with: {
										permission: true
									}
								}
							}
						}
					}
				}
			}
		});

		return result ? this.mapToUser(result) : null;
	}

	async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
		const [newUser] = await this.db
			.insert(schema.users)
			.values({
				email: user.email,
				username: user.username,
				passwordHash: user.passwordHash,
				isActive: user.isActive
			})
			.returning();

		return this.findById(newUser.id) as Promise<User>;
	}

	async update(id: string, updates: Partial<User>): Promise<User> {
		const updateData: any = {
			updatedAt: new Date()
		};

		if (updates.email !== undefined) updateData.email = updates.email;
		if (updates.username !== undefined) updateData.username = updates.username;
		if (updates.passwordHash !== undefined) updateData.passwordHash = updates.passwordHash;
		if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

		await this.db.update(schema.users).set(updateData).where(eq(schema.users.id, id));

		return this.findById(id) as Promise<User>;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(schema.users).where(eq(schema.users.id, id));
	}

	private mapToUser(data: any): User {
		return {
			id: data.id,
			email: data.email,
			username: data.username,
			passwordHash: data.passwordHash ?? undefined,
			createdAt: data.createdAt,
			updatedAt: data.updatedAt,
			isActive: data.isActive,
			roles:
				data.userRoles?.map((ur: any) => ({
					id: ur.role.id,
					name: ur.role.name,
					description: ur.role.description ?? undefined,
					permissions: ur.role.rolePermissions?.map((rp: any) => ({
						id: rp.permission.id,
						resource: rp.permission.resource,
						action: rp.permission.action,
						description: rp.permission.description ?? undefined
					}))
				})) || []
		};
	}
}

/**
 * PostgreSQL SessionRepository implementation
 */
export class PostgresSessionRepository implements SessionRepository {
	private db: PostgresJsDatabase<typeof schema>;

	constructor(db: PostgresJsDatabase<typeof schema>) {
		this.db = db;
	}

	async create(session: { id: string; userId: string; expiresAt: Date; lastActivityAt?: Date }): Promise<void> {
		await this.db
			.insert(schema.sessions)
			.values({
				id: session.id,
				userId: session.userId,
				expiresAt: session.expiresAt,
				lastActivityAt: session.lastActivityAt ?? new Date()
			})
			.onConflictDoUpdate({
				target: schema.sessions.id,
				set: {
					expiresAt: session.expiresAt,
					lastActivityAt: session.lastActivityAt ?? new Date()
				}
			});
	}

	async findById(id: string): Promise<Session | null> {
		const result = await this.db.query.sessions.findFirst({
			where: eq(schema.sessions.id, id)
		});

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
			.update(schema.sessions)
			.set({ lastActivityAt })
			.where(eq(schema.sessions.id, id));
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(schema.sessions).where(eq(schema.sessions.id, id));
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this.db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
	}

	async deleteExpired(): Promise<void> {
		await this.db.delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
	}

	async deleteInactive(inactivityPeriod: number): Promise<void> {
		const inactivityThreshold = new Date(Date.now() - inactivityPeriod);
		await this.db.delete(schema.sessions).where(lt(schema.sessions.lastActivityAt, inactivityThreshold));
	}
}

export { drizzle };
export * from './schema.js';
