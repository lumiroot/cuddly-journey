import { copy, readJSON, writeJSON, pathExists } from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import chalk from 'chalk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function copyTemplate(templateName: string, targetDir: string, overwrite = false) {
	// Template source is in the CLI package's templates directory
	const templateDir = path.join(__dirname, '../../templates', templateName);

	if (!(await pathExists(templateDir))) {
		throw new Error(`Template "${templateName}" not found`);
	}

	// Read template config
	const configPath = path.join(templateDir, 'config.json');
	let config: any = {};

	if (await pathExists(configPath)) {
		config = await readJSON(configPath);
	}

	// Copy all files except config.json
	const files = await fg('**/*', {
		cwd: templateDir,
		dot: true,
		ignore: ['config.json', 'node_modules/**']
	});

	for (const file of files) {
		const sourcePath = path.join(templateDir, file);
		const targetPath = path.join(targetDir, file);

		// Check if file exists and handle overwrite
		if (!overwrite && (await pathExists(targetPath))) {
			// Special handling for certain files
			if (file === 'package.json') {
				await mergePackageJson(sourcePath, targetPath);
				continue;
			} else if (file.includes('schema')) {
				// Schema files are handled separately by mergeSchema
				continue;
			} else {
				console.log(chalk.yellow(`  Skipping ${file} (already exists)`));
				continue;
			}
		}

		await copy(sourcePath, targetPath, { overwrite });
	}

	return config;
}

async function mergePackageJson(sourcePath: string, targetPath: string) {
	const source = await readJSON(sourcePath);
	const target = await readJSON(targetPath);

	// Merge dependencies
	if (source.dependencies) {
		target.dependencies = {
			...target.dependencies,
			...source.dependencies
		};
	}

	// Merge devDependencies
	if (source.devDependencies) {
		target.devDependencies = {
			...target.devDependencies,
			...source.devDependencies
		};
	}

	// Merge scripts
	if (source.scripts) {
		target.scripts = {
			...target.scripts,
			...source.scripts
		};
	}

	await writeJSON(targetPath, target, { spaces: 2 });
	console.log(chalk.green('  Merged package.json'));
}
