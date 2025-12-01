/**
 * Core authentication types
 */

export interface User {
	id: string;
	email: string;
	username: string;
	passwordHash?: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
	roles: Role[];
}

export interface Role {
	id: string;
	name: string;
	description?: string;
	permissions: Permission[];
}

export interface Permission {
	id: string;
	resource: string;
	action: string;
	description?: string;
}

export interface Session {
	id: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	lastActivityAt: Date;
	fresh?: boolean;
}

export interface AuthCredentials {
	username: string;
	password: string;
}

export interface AuthResult {
	success: boolean;
	user?: User;
	session?: Session;
	error?: string;
}

// Repository interfaces
export interface UserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
	create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'roles'>): Promise<User>;
	update(id: string, user: Partial<User>): Promise<User>;
	delete(id: string): Promise<void>;
}

export interface SessionRepository {
	create(session: { id: string; userId: string; expiresAt: Date; lastActivityAt?: Date }): Promise<void>;
	findById(id: string): Promise<Session | null>;
	updateActivity(id: string, lastActivityAt: Date): Promise<void>;
	delete(id: string): Promise<void>;
	deleteByUserId(userId: string): Promise<void>;
	deleteExpired(): Promise<void>;
	deleteInactive(inactivityPeriod: number): Promise<void>;
}

export interface PermissionChecker {
	hasPermission(user: User, resource: string, action: string): boolean;
	hasRole(user: User, roleName: string): boolean;
}
