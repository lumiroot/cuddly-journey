<script lang="ts">
	import type { CommentWithAuthor } from '../schema/index.js';

	export let comment: CommentWithAuthor;
	export let depth: number = 0;
</script>

<div class="border-l-2 pl-4 py-2" style="margin-left: {depth * 1}rem">
	<div class="flex items-start gap-2">
		<div class="flex-1">
			<div class="flex items-center gap-2 mb-1">
				<span class="font-semibold text-sm">{comment.author.username}</span>
				<time class="text-xs text-muted-foreground" datetime={comment.createdAt.toISOString()}>
					{new Date(comment.createdAt).toLocaleDateString()}
				</time>
			</div>
			<p class="text-sm">{comment.content}</p>
		</div>
	</div>

	{#if comment.replies && comment.replies.length > 0}
		<div class="mt-2">
			{#each comment.replies as reply}
				<svelte:self comment={reply} depth={depth + 1} />
			{/each}
		</div>
	{/if}
</div>
