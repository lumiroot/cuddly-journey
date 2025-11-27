import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { authService } from '$lib/server/auth';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (!locals.session) {
		throw redirect(303, '/login');
	}

	await authService.invalidateSession(locals.session.id);

	// Clear session cookie
	cookies.delete(authService.getSessionCookieName(), {
		path: '/'
	});

	throw redirect(303, '/login');
};
