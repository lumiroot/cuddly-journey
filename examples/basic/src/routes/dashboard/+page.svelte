<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">대시보드</h1>
			<form method="POST" action="/logout">
				<button
					type="submit"
					class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
				>
					로그아웃
				</button>
			</form>
		</div>

		<div class="bg-card border rounded-lg p-6 mb-8">
			<h2 class="text-xl font-semibold mb-4">환영합니다, {data.user.username}님!</h2>
			<div class="space-y-2 text-sm">
				<p><span class="font-medium">이메일:</span> {data.user.email}</p>
				<p><span class="font-medium">가입일:</span> {new Date(data.user.createdAt).toLocaleDateString()}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<a
				href="/boards"
				class="p-6 border rounded-lg hover:shadow-lg transition-shadow block"
			>
				<h3 class="text-xl font-semibold mb-2">게시판</h3>
				<p class="text-muted-foreground">게시판에서 글을 작성하고 소통하세요</p>
			</a>

			<div class="p-6 border rounded-lg opacity-50">
				<h3 class="text-xl font-semibold mb-2">프로필 설정</h3>
				<p class="text-muted-foreground">곧 제공될 기능입니다</p>
			</div>
		</div>
	</div>
</div>
