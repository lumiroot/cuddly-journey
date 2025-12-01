/**
 * User management utilities
 */

import type { User, UserRepository } from '../types/index.ts';

export class UserService {
	constructor(private repo: UserRepository) {}

	async getUser(id: string): Promise<User | null> {
		return this.repo.findById(id);
	}

	async getUserByEmail(email: string): Promise<User | null> {
		return this.repo.findByEmail(email);
	}

	async getUserByUsername(username: string): Promise<User | null> {
		return this.repo.findByUsername(username);
	}

	async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
		// Validate user data
		if (!userData.email || !userData.username) {
			throw new Error('Email and username are required');
		}

		// Check for duplicates
		const existingEmail = await this.repo.findByEmail(userData.email);
		if (existingEmail) {
			throw new Error('Email already exists');
		}

		const existingUsername = await this.repo.findByUsername(userData.username);
		if (existingUsername) {
			throw new Error('Username already exists');
		}

		return this.repo.create(userData);
	}

	async updateUser(id: string, updates: Partial<User>): Promise<User> {
		const user = await this.repo.findById(id);
		if (!user) {
			throw new Error('User not found');
		}

		// Check for duplicate email if updating email
		if (updates.email && updates.email !== user.email) {
			const existingEmail = await this.repo.findByEmail(updates.email);
			if (existingEmail) {
				throw new Error('Email already exists');
			}
		}

		// Check for duplicate username if updating username
		if (updates.username && updates.username !== user.username) {
			const existingUsername = await this.repo.findByUsername(updates.username);
			if (existingUsername) {
				throw new Error('Username already exists');
			}
		}

		return this.repo.update(id, updates);
	}

	async deleteUser(id: string): Promise<void> {
		return this.repo.delete(id);
	}

	async activateUser(id: string): Promise<User> {
		return this.repo.update(id, { isActive: true });
	}

	async deactivateUser(id: string): Promise<User> {
		return this.repo.update(id, { isActive: false });
	}
}
