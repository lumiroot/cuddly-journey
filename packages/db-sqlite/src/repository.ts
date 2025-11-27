/**
 * SQLite UserRepository implementation
 */

import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { eq } from 'drizzle-orm';
import type { User, UserRepository } from '@brixkit/core';
import * as schema from './schema.js';

export class SqliteUserRepository implements UserRepository {
	private db: BetterSQLite3Database<typeof schema>;

	constructor(db: BetterSQLite3Database<typeof schema>) {
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

export { drizzle };
export * from './schema.js';
