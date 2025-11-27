<div class="container mx-auto px-4 py-16">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
			Brixkit Basic
		</h1>
		<p class="text-2xl font-semibold mb-4">
			ID/Password Authentication Example
		</p>
		<p class="text-lg text-muted-foreground mb-8">
			Lucia auth, Argon2id hashing, RBAC permissions
		</p>

		<div class="flex gap-4 justify-center mb-12">
			<a
				href="/login"
				class="px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-semibold"
			>
				로그인
			</a>
			<a
				href="/register"
				class="px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 font-semibold"
			>
				회원가입
			</a>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
			<div class="p-6 border rounded-lg hover:shadow-lg transition-shadow">
				<h2 class="text-2xl font-semibold mb-2">인증</h2>
				<p class="text-sm text-muted-foreground mb-3">
					Lucia + Argon2id 기반 안전한 인증
				</p>
			</div>

			<div class="p-6 border rounded-lg hover:shadow-lg transition-shadow">
				<h2 class="text-2xl font-semibold mb-2">권한 관리</h2>
				<p class="text-sm text-muted-foreground mb-3">
					역할 기반 접근 제어 (RBAC)
				</p>
			</div>

			<div class="p-6 border rounded-lg hover:shadow-lg transition-shadow">
				<h2 class="text-2xl font-semibold mb-2">게시판</h2>
				<p class="text-sm text-muted-foreground mb-3">
					완전한 CRUD 기능의 게시판
				</p>
			</div>
		</div>
	</div>
</div>
