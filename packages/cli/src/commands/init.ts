import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';
import { execa } from 'execa';
import { copyTemplate } from '../utils/copy-template.ts';
import { installDependencies } from '../utils/install-deps.ts';

interface InitOptions {
	template: string;
	skipInstall: boolean;
}

export async function initCommand(projectName: string | undefined, options: InitOptions) {
	console.log(chalk.bold.cyan('\n🧱 Brixkit - SvelteKit Project Scaffolder\n'));

	// Prompt for project name if not provided
	if (!projectName) {
		const response = await prompts({
			type: 'text',
			name: 'projectName',
			message: 'What is your project named?',
			initial: 'my-app'
		});

		if (!response.projectName) {
			console.log(chalk.red('Project name is required'));
			process.exit(1);
		}

		projectName = response.projectName;
	}

	const targetDir = path.resolve(process.cwd(), projectName);

	// Check if directory exists
	if (existsSync(targetDir)) {
		const response = await prompts({
			type: 'confirm',
			name: 'overwrite',
			message: `Directory ${projectName} already exists. Overwrite?`,
			initial: false
		});

		if (!response.overwrite) {
			console.log(chalk.yellow('Cancelled'));
			process.exit(0);
		}
	}

	// Ask about database
	const dbChoice = await prompts({
		type: 'select',
		name: 'database',
		message: 'Which database would you like to use?',
		choices: [
			{ title: 'SQLite (recommended for development)', value: 'sqlite' },
			{ title: 'PostgreSQL', value: 'postgresql' },
			{ title: 'None (I will add it later)', value: 'none' }
		],
		initial: 0
	});

	// Ask about features
	const features = await prompts({
		type: 'multiselect',
		name: 'components',
		message: 'Which features would you like to include?',
		choices: [
			{ title: 'Authentication (users, sessions, permissions)', value: 'auth', selected: true },
			{ title: 'Board (posts, comments)', value: 'board' },
			{ title: 'GitHub OAuth', value: 'github-oauth' }
		]
	});

	const spinner = ora('Creating project...').start();

	try {
		// Create project directory
		await mkdir(targetDir, { recursive: true });

		// Copy base SvelteKit template
		await copyTemplate('base', targetDir);

		spinner.text = 'Adding components...';

		// Add selected components
		const components = features.components || [];

		// Always add database if selected
		if (dbChoice.database !== 'none') {
			await copyTemplate(`db-${dbChoice.database}`, targetDir);
		}

		// Add auth if selected (requires database)
		if (components.includes('auth')) {
			if (dbChoice.database === 'none') {
				spinner.warn('Auth requires a database. Adding SQLite by default.');
				await copyTemplate('db-sqlite', targetDir);
			}
			await copyTemplate('auth', targetDir);
		}

		// Add other components
		for (const component of components.filter((c: string) => c !== 'auth')) {
			await copyTemplate(component, targetDir);
		}

		spinner.succeed('Project created successfully!');

		// Install dependencies
		if (!options.skipInstall) {
			const installSpinner = ora('Installing dependencies...').start();
			try {
				await installDependencies(targetDir);
				installSpinner.succeed('Dependencies installed!');
			} catch (error) {
				installSpinner.fail('Failed to install dependencies');
				console.log(chalk.yellow('You can install them manually by running:'));
				console.log(chalk.cyan(`  cd ${projectName} && pnpm install`));
			}
		}

		// Print next steps
		console.log(chalk.green('\n✨ Done! Next steps:\n'));
		console.log(chalk.cyan(`  cd ${projectName}`));

		if (options.skipInstall) {
			console.log(chalk.cyan('  pnpm install'));
		}

		if (dbChoice.database !== 'none') {
			console.log(chalk.cyan('  pnpm db:generate'));
			console.log(chalk.cyan('  pnpm db:migrate'));
		}

		console.log(chalk.cyan('  pnpm dev\n'));
	} catch (error) {
		spinner.fail('Failed to create project');
		console.error(error);
		process.exit(1);
	}
}
