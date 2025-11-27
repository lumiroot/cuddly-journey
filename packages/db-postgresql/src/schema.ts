/**
 * PostgreSQL schema using Drizzle ORM
 */

import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	username: varchar('username', { length: 100 }).notNull().unique(),
	passwordHash: varchar('password_hash', { length: 255 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	isActive: boolean('is_active').notNull().default(true)
});

export const roles = pgTable('roles', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 100 }).notNull().unique(),
	description: text('description')
});

export const permissions = pgTable('permissions', {
	id: uuid('id').primaryKey().defaultRandom(),
	resource: varchar('resource', { length: 100 }).notNull(),
	action: varchar('action', { length: 100 }).notNull(),
	description: text('description')
});

export const userRoles = pgTable('user_roles', {
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	roleId: uuid('role_id')
		.notNull()
		.references(() => roles.id, { onDelete: 'cascade' })
});

export const rolePermissions = pgTable('role_permissions', {
	roleId: uuid('role_id')
		.notNull()
		.references(() => roles.id, { onDelete: 'cascade' }),
	permissionId: uuid('permission_id')
		.notNull()
		.references(() => permissions.id, { onDelete: 'cascade' })
});

export const sessions = pgTable('sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	metadata: text('metadata')
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	userRoles: many(userRoles),
	sessions: many(sessions)
}));

export const rolesRelations = relations(roles, ({ many }) => ({
	userRoles: many(userRoles),
	rolePermissions: many(rolePermissions)
}));

export const permissionsRelations = relations(permissions, ({ many }) => ({
	rolePermissions: many(rolePermissions)
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	})
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
	role: one(roles, {
		fields: [rolePermissions.roleId],
		references: [roles.id]
	}),
	permission: one(permissions, {
		fields: [rolePermissions.permissionId],
		references: [permissions.id]
	})
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));
