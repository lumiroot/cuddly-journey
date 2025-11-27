import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GitHubAuthService } from '@brixkit/auth-github';
import { userRepo } from '$lib/server/auth';

const githubAuth = new GitHubAuthService(
	{
		clientId: process.env.GITHUB_CLIENT_ID || '',
		clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
		redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:5173/auth/github/callback'
	},
	userRepo
);

export const GET: RequestHandler = async ({ cookies }) => {
	const { url, state } = await githubAuth.createAuthorizationURL();

	cookies.set('github_oauth_state', state, {
		path: '/',
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: 'lax'
	});

	throw redirect(302, url.toString());
};
