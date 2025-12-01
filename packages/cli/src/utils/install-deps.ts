import { execa } from 'execa';
import { pathExists } from 'fs-extra';
import path from 'path';

export async function installDependencies(cwd: string) {
	// Detect package manager
	const packageManager = await detectPackageManager(cwd);

	// Install dependencies
	await execa(packageManager, ['install'], {
		cwd,
		stdio: 'inherit'
	});
}

async function detectPackageManager(cwd: string): Promise<string> {
	// Check for lock files
	if (await pathExists(path.join(cwd, 'pnpm-lock.yaml'))) {
		return 'pnpm';
	}
	if (await pathExists(path.join(cwd, 'yarn.lock'))) {
		return 'yarn';
	}
	if (await pathExists(path.join(cwd, 'package-lock.json'))) {
		return 'npm';
	}

	// Default to pnpm
	return 'pnpm';
}
