<script lang="ts">
	import { cn } from '$lib/utils/cn';

	export let className: string = '';
</script>

<div
	class={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
	{...$$restProps}
>
	<slot />
</div>
