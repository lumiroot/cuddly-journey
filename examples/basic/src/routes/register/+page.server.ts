import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authService, userRepo } from '$lib/server/auth';

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const username = formData.get('username');
		const password = formData.get('password');

		if (!email || !username || !password) {
			return fail(400, { error: '모든 필드를 입력해주세요.' });
		}

		if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
			return fail(400, { error: '잘못된 입력입니다.' });
		}

		if (password.length < 8) {
			return fail(400, { error: '비밀번호는 최소 8자 이상이어야 합니다.' });
		}

		try {
			// Hash password
			const passwordHash = await authService.hashPassword(password);

			// Create user
			const user = await userRepo.create({
				email,
				username,
				passwordHash,
				isActive: true,
				roles: []
			});

			// Authenticate to create session
			const result = await authService.authenticate({ username, password });

			if (!result.success || !result.token) {
				return fail(500, { error: '로그인에 실패했습니다.' });
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
			console.error(error);
			return fail(500, { error: '회원가입에 실패했습니다. 이메일이나 사용자명이 이미 사용 중일 수 있습니다.' });
		}

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
