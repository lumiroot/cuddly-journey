/**
 * User management service
 * Handles user CRUD operations
 */

import { hash } from '@node-rs/argon2';
import type { User, UserRepository } from '../types/auth.ts';

export class UserService {
	constructor(private userRepo: UserRepository) {}

	/**
	 * Create a new user
	 */
	async createUser(data: {
		email: string;
		username: string;
		password?: string;
		isActive?: boolean;
	}): Promise<User> {
		const passwordHash = data.password ? await hash(data.password) : undefined;

		return this.userRepo.create({
			email: data.email,
			username: data.username,
			passwordHash,
			isActive: data.isActive ?? true
		});
	}

	/**
	 * Get user by ID
	 */
	async getUser(userId: string): Promise<User | null> {
		return this.userRepo.findById(userId);
	}

	/**
	 * Get user by email
	 */
	async getUserByEmail(email: string): Promise<User | null> {
		return this.userRepo.findByEmail(email);
	}

	/**
	 * Get user by username
	 */
	async getUserByUsername(username: string): Promise<User | null> {
		return this.userRepo.findByUsername(username);
	}

	/**
	 * Update user
	 */
	async updateUser(userId: string, data: Partial<User>): Promise<User> {
		return this.userRepo.update(userId, data);
	}

	/**
	 * Update user password
	 */
	async updatePassword(userId: string, newPassword: string): Promise<User> {
		const passwordHash = await hash(newPassword);
		return this.userRepo.update(userId, { passwordHash });
	}

	/**
	 * Deactivate user
	 */
	async deactivateUser(userId: string): Promise<User> {
		return this.userRepo.update(userId, { isActive: false });
	}

	/**
	 * Activate user
	 */
	async activateUser(userId: string): Promise<User> {
		return this.userRepo.update(userId, { isActive: true });
	}

	/**
	 * Delete user
	 */
	async deleteUser(userId: string): Promise<void> {
		return this.userRepo.delete(userId);
	}
}
