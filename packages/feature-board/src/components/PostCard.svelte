<script lang="ts">
	import type { PostWithAuthor } from '../schema/index.js';

	export let post: PostWithAuthor;
</script>

<article class="border rounded-lg p-6 hover:shadow-md transition-shadow">
	<a href="/board/{post.boardId}/post/{post.id}" class="block">
		<h3 class="text-xl font-semibold mb-2 hover:text-primary">{post.title}</h3>
		<p class="text-muted-foreground line-clamp-2 mb-4">
			{post.content}
		</p>
		<div class="flex items-center justify-between text-sm text-muted-foreground">
			<div class="flex items-center gap-2">
				<span class="font-medium">{post.author.username}</span>
				<span>•</span>
				<time datetime={post.createdAt.toISOString()}>
					{new Date(post.createdAt).toLocaleDateString()}
				</time>
			</div>
			<div class="flex items-center gap-4">
				<span>조회 {post.viewCount}</span>
			</div>
		</div>
	</a>
</article>
