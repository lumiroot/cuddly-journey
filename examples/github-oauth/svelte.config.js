import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		alias: {
			$lib: './src/lib',
			'@brixkit/core': '../../packages/core/src',
			'@brixkit/db-sqlite': '../../packages/db-sqlite/src',
			'@brixkit/db-postgresql': '../../packages/db-postgresql/src',
			'@brixkit/feature-board': '../../packages/feature-board/src',
			'@brixkit/auth-github': '../../packages/auth-github/src'
		}
	}
};

export default config;
