import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { copyTemplate } from '../utils/copy-template.ts';
import { mergeSchema } from '../utils/merge-schema.ts';
import { installDependencies } from '../utils/install-deps.ts';

interface AddOptions {
	yes: boolean;
	overwrite: boolean;
}

const AVAILABLE_COMPONENTS = {
	auth: 'Authentication (users, sessions, permissions)',
	board: 'Board feature (posts, comments)',
	'github-oauth': 'GitHub OAuth authentication',
	'db-sqlite': 'SQLite database adapter',
	'db-postgresql': 'PostgreSQL database adapter'
};

export async function addCommand(components: string[], options: AddOptions) {
	console.log(chalk.bold.cyan('\n🧱 Adding Brixkit components\n'));

	// Verify we're in a valid project directory
	const cwd = process.cwd();
	const packageJsonPath = path.join(cwd, 'package.json');

	if (!existsSync(packageJsonPath)) {
		console.log(chalk.red('Error: Not in a valid project directory'));
		console.log(chalk.yellow('Run this command from the root of your SvelteKit project'));
		process.exit(1);
	}

	// Validate components
	const invalidComponents = components.filter((c) => !(c in AVAILABLE_COMPONENTS));
	if (invalidComponents.length > 0) {
		console.log(chalk.red(`Invalid components: ${invalidComponents.join(', ')}`));
		console.log(chalk.yellow('\nAvailable components:'));
		Object.entries(AVAILABLE_COMPONENTS).forEach(([key, desc]) => {
			console.log(chalk.cyan(`  ${key}`) + ` - ${desc}`);
		});
		process.exit(1);
	}

	// Show what will be added
	console.log('The following components will be added:\n');
	components.forEach((component) => {
		console.log(chalk.cyan(`  ✓ ${component}`) + ` - ${AVAILABLE_COMPONENTS[component as keyof typeof AVAILABLE_COMPONENTS]}`);
	});
	console.log();

	// Confirm if not using --yes
	if (!options.yes) {
		const response = await prompts({
			type: 'confirm',
			name: 'confirm',
			message: 'Continue?',
			initial: true
		});

		if (!response.confirm) {
			console.log(chalk.yellow('Cancelled'));
			process.exit(0);
		}
	}

	const spinner = ora('Adding components...').start();

	try {
		// Check for database requirement
		const needsDb = components.some((c) => ['auth', 'board'].includes(c));
		const hasDb = existsSync(path.join(cwd, 'src/lib/server/schema'));

		if (needsDb && !hasDb && !components.some((c) => c.startsWith('db-'))) {
			spinner.warn('Some components require a database. Adding SQLite by default.');
			components.unshift('db-sqlite');
		}

		// Add each component
		for (const component of components) {
			spinner.text = `Adding ${component}...`;
			await copyTemplate(component, cwd, options.overwrite);

			// Merge schema if it exists
			const schemaPath = path.join(cwd, 'src/lib/server/schema');
			if (existsSync(schemaPath)) {
				await mergeSchema(cwd, component);
			}
		}

		spinner.succeed('Components added successfully!');

		// Install dependencies
		const installSpinner = ora('Installing new dependencies...').start();
		try {
			await installDependencies(cwd);
			installSpinner.succeed('Dependencies installed!');
		} catch (error) {
			installSpinner.fail('Failed to install dependencies');
			console.log(chalk.yellow('You can install them manually by running:'));
			console.log(chalk.cyan('  pnpm install'));
		}

		// Print next steps
		console.log(chalk.green('\n✨ Done! Next steps:\n'));

		if (components.some((c) => c.startsWith('db-'))) {
			console.log(chalk.cyan('  pnpm db:generate'));
			console.log(chalk.cyan('  pnpm db:migrate'));
		}

		console.log(chalk.cyan('  pnpm dev\n'));
	} catch (error) {
		spinner.fail('Failed to add components');
		console.error(error);
		process.exit(1);
	}
}
