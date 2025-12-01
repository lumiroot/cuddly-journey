import type { Handle } from '@sveltejs/kit';
import { authService } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const cookieName = authService.getSessionCookieName();
	const token = event.cookies.get(cookieName);

	if (!token) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const result = await authService.validateSessionToken(token);

	if (!result) {
		// Invalid session - clear cookie
		event.cookies.delete(cookieName, { path: '/' });
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = result;

	// If session was extended (not fresh), the token remains the same
	// SvelteKit will automatically keep the cookie

	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
