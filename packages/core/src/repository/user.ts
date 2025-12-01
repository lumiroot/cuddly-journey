/**
 * Generic UserRepository implementation using Drizzle ORM
 * Works with any database dialect (SQLite, PostgreSQL, etc.)
 */

import { eq } from 'drizzle-orm';
import type { User, UserRepository } from '../types/index.ts';

/**
 * Schema interface that repositories expect
 * This allows the repository to work with any schema that matches this structure
 */
export interface CoreSchema {
	users: any;
	roles: any;
	permissions: any;
	userRoles: any;
	rolePermissions: any;
	sessions: any;
	usersRelations?: any;
	rolesRelations?: any;
	permissionsRelations?: any;
	userRolesRelations?: any;
	rolePermissionsRelations?: any;
	sessionsRelations?: any;
}

/**
 * Generic database interface
 * Accepts any Drizzle database instance with relational queries
 */
export interface DrizzleDatabase {
	query: {
		users: {
			findFirst: (args: any) => Promise<any>;
		};
	};
	insert: (table: any) => any;
	update: (table: any) => any;
	delete: (table: any) => any;
}

/**
 * Generic UserRepository implementation
 * Works with any Drizzle database and schema
 */
export class DrizzleUserRepository implements UserRepository {
	private db: DrizzleDatabase;
	private schema: CoreSchema;

	constructor(db: DrizzleDatabase, schema: CoreSchema) {
		this.db = db;
		this.schema = schema;
	}

	async findById(id: string): Promise<User | null> {
		const result = await this.db.query.users.findFirst({
			where: eq(this.schema.users.id, id),
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
			where: eq(this.schema.users.email, email),
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
			where: eq(this.schema.users.username, username),
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
			.insert(this.schema.users)
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

		await this.db.update(this.schema.users).set(updateData).where(eq(this.schema.users.id, id));

		return this.findById(id) as Promise<User>;
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(this.schema.users).where(eq(this.schema.users.id, id));
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
