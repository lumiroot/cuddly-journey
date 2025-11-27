import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { userRepo } from '$lib/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Get full user data with roles
	const user = await userRepo.findById(locals.user.id);

	if (!user) {
		throw redirect(303, '/login');
	}

	return {
		user: {
			id: user.id,
			email: user.email,
			username: user.username,
			createdAt: user.createdAt,
			roles: user.roles
		}
	};
};
