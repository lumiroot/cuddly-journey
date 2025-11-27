/**
 * GitHub OAuth authentication plugin
 */

import { GitHub, generateState } from 'arctic';
import type { UserRepository, User } from '@brixkit/core';

export interface GitHubAuthConfig {
	clientId: string;
	clientSecret: string;
	redirectUri: string;
}

export interface GitHubUser {
	id: number;
	login: string;
	email: string;
	name: string;
	avatar_url: string;
}

export class GitHubAuthService {
	private github: GitHub;
	private userRepo: UserRepository;

	constructor(config: GitHubAuthConfig, userRepo: UserRepository) {
		this.github = new GitHub(config.clientId, config.clientSecret, config.redirectUri);
		this.userRepo = userRepo;
	}

	/**
	 * Generate OAuth authorization URL
	 */
	async createAuthorizationURL(): Promise<{ url: URL; state: string }> {
		const state = generateState();
		const url = await this.github.createAuthorizationURL(state, ['user:email']);

		return { url, state };
	}

	/**
	 * Validate OAuth callback and get GitHub user info
	 */
	async validateCallback(code: string): Promise<GitHubUser> {
		const tokens = await this.github.validateAuthorizationCode(code);

		const response = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch GitHub user');
		}

		const githubUser = (await response.json()) as GitHubUser;

		// Fetch email if not public
		if (!githubUser.email) {
			const emailResponse = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`
				}
			});

			if (emailResponse.ok) {
				const emails = (await emailResponse.json()) as Array<{
					email: string;
					primary: boolean;
					verified: boolean;
				}>;
				const primaryEmail = emails.find((email) => email.primary);
				if (primaryEmail) {
					githubUser.email = primaryEmail.email;
				}
			}
		}

		return githubUser;
	}

	/**
	 * Find or create user from GitHub data
	 */
	async findOrCreateUser(githubUser: GitHubUser): Promise<User> {
		// Try to find existing user by email
		const existingUser = await this.userRepo.findByEmail(githubUser.email);

		if (existingUser) {
			return existingUser;
		}

		// Create new user
		const username = githubUser.login || `github_${githubUser.id}`;

		return this.userRepo.create({
			email: githubUser.email,
			username,
			isActive: true,
			roles: []
		});
	}
}

export type { GitHubUser as GitHubUserInfo };
