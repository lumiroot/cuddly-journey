import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authService } from '$lib/server/auth';

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!username || !password) {
			return fail(400, { error: '사용자명과 비밀번호를 입력해주세요.' });
		}

		if (typeof username !== 'string' || typeof password !== 'string') {
			return fail(400, { error: '잘못된 입력입니다.' });
		}

		const result = await authService.authenticate({ username, password });

		if (!result.success || !result.user || !result.token) {
			return fail(400, { error: result.error || '로그인에 실패했습니다.' });
		}

		// Set session cookie
		cookies.set(authService.getSessionCookieName(), result.token, {
			path: '/',
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
