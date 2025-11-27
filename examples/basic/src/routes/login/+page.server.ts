import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { authService, lucia } from '$lib/server/auth';

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

		if (!result.success || !result.user) {
			return fail(400, { error: result.error || '로그인에 실패했습니다.' });
		}

		const session = await lucia.createSession(result.user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(303, '/dashboard');
	}
} satisfies Actions;
