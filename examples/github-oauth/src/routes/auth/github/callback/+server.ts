import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubAuthService } from '@brixkit/auth-github';
import { userRepo, authService } from '$lib/server/auth';

const githubAuth = new GitHubAuthService(
	{
		clientId: process.env.GITHUB_CLIENT_ID || '',
		clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
		redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/github/callback'
	},
	userRepo
);

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('github_oauth_state');

	if (!code || !state || !storedState || state !== storedState) {
		throw redirect(303, '/');
	}

	try {
		const githubUser = await githubAuth.validateCallback(code);
		const user = await githubAuth.findOrCreateUser(githubUser);

		// Create session for OAuth user
		const result = await authService.createSessionForUser(user.id);

		if (!result) {
			throw new Error('Failed to create session');
		}

		// Set session cookie
		cookies.set(authService.getSessionCookieName(), result.token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});
	} catch (error) {
		console.error('GitHub OAuth error:', error);
		throw redirect(303, '/');
	}

	throw redirect(303, '/dashboard');
};
