<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<div class="container mx-auto px-4 py-16">
	<div class="max-w-md mx-auto">
		<h1 class="text-3xl font-bold mb-8 text-center">로그인</h1>

		<form method="POST" use:enhance class="space-y-4">
			{#if form?.error}
				<div class="p-4 bg-destructive/10 text-destructive rounded-md">
					{form.error}
				</div>
			{/if}

			<div>
				<label for="username" class="block text-sm font-medium mb-2">사용자명</label>
				<input
					type="text"
					id="username"
					name="username"
					required
					class="w-full px-3 py-2 border rounded-md"
				/>
			</div>

			<div>
				<label for="password" class="block text-sm font-medium mb-2">비밀번호</label>
				<input
					type="password"
					id="password"
					name="password"
					required
					class="w-full px-3 py-2 border rounded-md"
				/>
			</div>

			<button
				type="submit"
				class="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90"
			>
				로그인
			</button>
		</form>

		<p class="mt-4 text-center text-sm text-muted-foreground">
			계정이 없으신가요?
			<a href="/register" class="text-primary hover:underline">회원가입</a>
		</p>
	</div>
</div>
