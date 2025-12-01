#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.ts';
import { addCommand } from './commands/add.ts';

const program = new Command();

program
	.name('brixkit')
	.description('CLI tool for scaffolding SvelteKit projects with Brixkit components')
	.version('0.1.0');

program
	.command('init')
	.description('Initialize a new SvelteKit project with Brixkit')
	.argument('[project-name]', 'name of the project')
	.option('-t, --template <template>', 'template to use (basic, full)', 'basic')
	.option('--skip-install', 'skip installing dependencies')
	.action(initCommand);

program
	.command('add')
	.description('Add a Brixkit component to your project')
	.argument('<components...>', 'components to add (e.g., auth, board, github-oauth)')
	.option('-y, --yes', 'skip confirmation prompts')
	.option('--overwrite', 'overwrite existing files')
	.action(addCommand);

program.parse();
