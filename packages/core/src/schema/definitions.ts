/**
 * Core schema definitions (vendor-agnostic)
 */

import { defineTable, field, type TableDefinition } from './builder.ts';

/**
 * Users table
 */
export const usersTable: TableDefinition = defineTable('users', {
	id: field.uuid().primaryKey(),
	email: field.string(255).notNull().unique(),
	username: field.string(100).notNull().unique(),
	passwordHash: field.string(255).nullable(),
	createdAt: field.timestamp().notNull().defaultNow(),
	updatedAt: field.timestamp().notNull().defaultNow(),
	isActive: field.boolean().notNull().default(true)
});

usersTable.relations = {
	userRoles: { type: 'many', table: 'userRoles' },
	sessions: { type: 'many', table: 'sessions' }
};

/**
 * Roles table
 */
export const rolesTable: TableDefinition = defineTable('roles', {
	id: field.uuid().primaryKey(),
	name: field.string(100).notNull().unique(),
	description: field.text().nullable()
});

rolesTable.relations = {
	userRoles: { type: 'many', table: 'userRoles' },
	rolePermissions: { type: 'many', table: 'rolePermissions' }
};

/**
 * Permissions table
 */
export const permissionsTable: TableDefinition = defineTable('permissions', {
	id: field.uuid().primaryKey(),
	resource: field.string(100).notNull(),
	action: field.string(100).notNull(),
	description: field.text().nullable()
});

permissionsTable.relations = {
	rolePermissions: { type: 'many', table: 'rolePermissions' }
};

/**
 * User Roles junction table
 */
export const userRolesTable: TableDefinition = defineTable('user_roles', {
	userId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'users', column: 'id' }), { onDelete: 'cascade' }),
	roleId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'roles', column: 'id' }), { onDelete: 'cascade' })
});

userRolesTable.relations = {
	user: {
		type: 'one',
		table: 'users',
		fields: ['userId'],
		references: ['id']
	},
	role: {
		type: 'one',
		table: 'roles',
		fields: ['roleId'],
		references: ['id']
	}
};

/**
 * Role Permissions junction table
 */
export const rolePermissionsTable: TableDefinition = defineTable('role_permissions', {
	roleId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'roles', column: 'id' }), { onDelete: 'cascade' }),
	permissionId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'permissions', column: 'id' }), { onDelete: 'cascade' })
});

rolePermissionsTable.relations = {
	role: {
		type: 'one',
		table: 'roles',
		fields: ['roleId'],
		references: ['id']
	},
	permission: {
		type: 'one',
		table: 'permissions',
		fields: ['permissionId'],
		references: ['id']
	}
};

/**
 * Sessions table
 */
export const sessionsTable: TableDefinition = defineTable('sessions', {
	id: field.string(255).primaryKey(),
	userId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'users', column: 'id' }), { onDelete: 'cascade' }),
	expiresAt: field.timestamp().notNull(),
	createdAt: field.timestamp().notNull().defaultNow(),
	lastActivityAt: field.timestamp().notNull().defaultNow()
});

sessionsTable.relations = {
	user: {
		type: 'one',
		table: 'users',
		fields: ['userId'],
		references: ['id']
	}
};

/**
 * All core tables
 */
export const coreSchema = {
	users: usersTable,
	roles: rolesTable,
	permissions: permissionsTable,
	userRoles: userRolesTable,
	rolePermissions: rolePermissionsTable,
	sessions: sessionsTable
};
