<script lang="ts">
	// TODO: Import core auth when ready
</script>

<div class="container mx-auto px-4 py-16">
	<div class="max-w-4xl mx-auto text-center">
		<h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
			Brixkit
		</h1>
		<p class="text-2xl font-semibold mb-4">
			Modular SvelteKit building blocks for rapid development
		</p>
		<p class="text-lg text-muted-foreground mb-8">
			Authentication, authorization, and feature packages ready to use
		</p>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
			<div class="p-6 border rounded-lg hover:shadow-lg transition-shadow">
				<h2 class="text-2xl font-semibold mb-2">Core</h2>
				<p class="text-sm text-muted-foreground mb-3">
					Lucia auth, RBAC permissions, user management
				</p>
				<code class="text-xs bg-muted px-2 py-1 rounded">@brixkit/core</code>
			</div>

			<div class="p-6 border rounded-lg hover:shadow-lg transition-shadow">
				<h2 class="text-2xl font-semibold mb-2">DB Plugins</h2>
				<p class="text-sm text-muted-foreground mb-3">
					PostgreSQL & SQLite with Drizzle ORM
				</p>
				<code class="text-xs bg-muted px-2 py-1 rounded">@brixkit/db-*</code>
			</div>

			<div class="p-6 border rounded-lg hover:shadow-lg transition-shadow">
				<h2 class="text-2xl font-semibold mb-2">Features</h2>
				<p class="text-sm text-muted-foreground mb-3">
					Pluggable features with UI, logic, and schemas
				</p>
				<code class="text-xs bg-muted px-2 py-1 rounded">@brixkit/feature-*</code>
			</div>
		</div>

		<div class="mt-16">
			<h3 class="text-xl font-semibold mb-4">Tech Stack</h3>
			<div class="flex flex-wrap justify-center gap-3">
				<span class="px-4 py-2 bg-secondary rounded-full text-sm">SvelteKit</span>
				<span class="px-4 py-2 bg-secondary rounded-full text-sm">Lucia Auth</span>
				<span class="px-4 py-2 bg-secondary rounded-full text-sm">Drizzle ORM</span>
				<span class="px-4 py-2 bg-secondary rounded-full text-sm">TailwindCSS</span>
				<span class="px-4 py-2 bg-secondary rounded-full text-sm">TypeScript</span>
			</div>
		</div>
	</div>
</div>
