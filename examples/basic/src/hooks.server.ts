import type { Handle } from '@sveltejs/kit';
import { authService } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(authService.getSessionCookieName());

	if (!sessionToken) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await authService.validateSessionToken(sessionToken);

	if (result) {
		event.locals.user = result.user;
		event.locals.session = result.session;

		// Refresh session cookie if needed
		if (result.session.fresh) {
			event.cookies.set(authService.getSessionCookieName(), sessionToken, {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});
		}
	} else {
		event.locals.user = null;
		event.locals.session = null;

		// Clear invalid session cookie
		event.cookies.delete(authService.getSessionCookieName(), {
			path: '/'
		});
	}

	return resolve(event);
};
