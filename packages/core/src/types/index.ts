/**
 * Core type definitions for users, auth, and permissions
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

export interface AuthProvider {
	authenticate(credentials: AuthCredentials): Promise<AuthResult>;
	validateSession(sessionId: string): Promise<Session | null>;
	destroySession(sessionId: string): Promise<void>;
}

export interface UserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	findByUsername(username: string): Promise<User | null>;
	create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
	update(id: string, user: Partial<User>): Promise<User>;
	delete(id: string): Promise<void>;
}

export interface PermissionChecker {
	hasPermission(user: User, resource: string, action: string): boolean;
	hasRole(user: User, roleName: string): boolean;
}

export interface SessionRepository {
	create(session: { id: string; userId: string; expiresAt: Date }): Promise<void>;
	findById(id: string): Promise<Session | null>;
	delete(id: string): Promise<void>;
	deleteByUserId(userId: string): Promise<void>;
	deleteExpired(): Promise<void>;
}
