<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<div class="container mx-auto px-4 py-8">
	<div class="max-w-4xl mx-auto">
		<div class="flex justify-between items-center mb-8">
			<h1 class="text-3xl font-bold">게시판</h1>
			<div class="flex gap-2">
				<a
					href="/dashboard"
					class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
				>
					대시보드
				</a>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
					>
						로그아웃
					</button>
				</form>
			</div>
		</div>

		<div class="mb-6">
			<p class="text-muted-foreground">
				환영합니다, <span class="font-medium">{data.user.username}</span>님
			</p>
		</div>

		<div class="bg-card border rounded-lg p-6">
			<h2 class="text-xl font-semibold mb-4">게시판 기능 데모</h2>
			<p class="text-muted-foreground mb-4">
				이 예제에서는 Brixkit의 인증 및 권한 관리 기능을 시연합니다.
				실제 게시판 기능은 @brixkit/feature-board 패키지를 사용하여 구현할 수 있습니다.
			</p>

			<div class="space-y-3">
				<div class="p-4 border rounded-md">
					<h3 class="font-semibold">📝 포스트 작성</h3>
					<p class="text-sm text-muted-foreground">권한이 있는 사용자만 포스트를 작성할 수 있습니다.</p>
				</div>

				<div class="p-4 border rounded-md">
					<h3 class="font-semibold">👥 권한 관리</h3>
					<p class="text-sm text-muted-foreground">역할 기반 접근 제어 (RBAC)로 권한을 관리합니다.</p>
				</div>

				<div class="p-4 border rounded-md">
					<h3 class="font-semibold">💬 댓글 시스템</h3>
					<p class="text-sm text-muted-foreground">대댓글을 포함한 완전한 댓글 시스템을 제공합니다.</p>
				</div>
			</div>
		</div>
	</div>
</div>
