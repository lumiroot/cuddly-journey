/**
 * Generates Drizzle schemas from table definitions
 */

import type { Dialect, TableDefinition } from './builder.ts';

interface GeneratorContext {
	dialect: Dialect;
	tables: Record<string, TableDefinition>;
}

/**
 * Generate Drizzle schema code for the specified dialect
 */
export function generateSchema(
	dialect: Dialect,
	tables: Record<string, TableDefinition>
): string {
	const ctx: GeneratorContext = { dialect, tables };

	const imports = generateImports(dialect);
	const tableDefs = Object.values(tables)
		.map((table) => generateTable(ctx, table))
		.join('\n\n');
	const relations = Object.entries(tables)
		.map(([name, table]) => generateRelations(ctx, name, table))
		.filter(Boolean)
		.join('\n\n');

	return `${imports}\n\n${tableDefs}\n\n// Relations\n${relations}`;
}

function generateImports(dialect: Dialect): string {
	if (dialect === 'sqlite') {
		return `import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';`;
	} else {
		return `import { pgTable, uuid, varchar, timestamp, boolean, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';`;
	}
}

function generateTable(ctx: GeneratorContext, table: TableDefinition): string {
	const { dialect } = ctx;
	const tableFunc = dialect === 'sqlite' ? 'sqliteTable' : 'pgTable';
	const columns = Object.entries(table.columns)
		.map(([name, col]) => `\t${name}: ${generateColumn(ctx, name, col, table)}`)
		.join(',\n');

	return `export const ${table.name} = ${tableFunc}('${table.name}', {\n${columns}\n});`;
}

function generateColumn(
	ctx: GeneratorContext,
	name: string,
	col: any,
	table: TableDefinition
): string {
	const { dialect } = ctx;
	let code = '';

	// Column type
	if (col.type === 'uuid') {
		if (dialect === 'sqlite') {
			code = `text('${toSnakeCase(name)}')`;
		} else {
			code = `uuid('${toSnakeCase(name)}')`;
		}
	} else if (col.type === 'string') {
		if (dialect === 'sqlite') {
			code = `text('${toSnakeCase(name)}')`;
		} else {
			code = `varchar('${toSnakeCase(name)}'${col.length ? `, { length: ${col.length} }` : ''})`;
		}
	} else if (col.type === 'text') {
		code = `text('${toSnakeCase(name)}')`;
	} else if (col.type === 'integer') {
		if (dialect === 'sqlite') {
			code = `integer('${toSnakeCase(name)}')`;
		} else {
			code = `integer('${toSnakeCase(name)}')`;
		}
	} else if (col.type === 'boolean') {
		if (dialect === 'sqlite') {
			code = `integer('${toSnakeCase(name)}', { mode: 'boolean' })`;
		} else {
			code = `boolean('${toSnakeCase(name)}')`;
		}
	} else if (col.type === 'timestamp') {
		if (dialect === 'sqlite') {
			code = `integer('${toSnakeCase(name)}', { mode: 'timestamp' })`;
		} else {
			code = `timestamp('${toSnakeCase(name)}')`;
		}
	}

	// Modifiers
	if (col.primaryKey) {
		code += '.primaryKey()';
	}

	if (dialect === 'postgresql' && col.type === 'uuid' && col.primaryKey && !col.references) {
		code += '.defaultRandom()';
	}

	if (dialect === 'sqlite' && col.type === 'uuid' && col.primaryKey && !col.references) {
		code += `.$defaultFn(() => crypto.randomUUID())`;
	}

	if (col.references) {
		const refTable = col.references.table;
		code += `.references(() => ${refTable}.${col.references.column}${
			col.references.onDelete ? `, { onDelete: '${col.references.onDelete}' }` : ''
		})`;
	}

	if (!col.nullable && !col.primaryKey) {
		code += '.notNull()';
	}

	if (col.unique) {
		code += '.unique()';
	}

	if (col.default !== undefined) {
		if (typeof col.default === 'boolean') {
			code += `.default(${col.default})`;
		} else if (typeof col.default === 'number') {
			code += `.default(${col.default})`;
		} else {
			code += `.default('${col.default}')`;
		}
	}

	if (col.defaultNow) {
		if (dialect === 'sqlite') {
			code += '.$defaultFn(() => new Date())';
		} else {
			code += '.defaultNow()';
		}
	}

	if (col.defaultFn) {
		code += `.$defaultFn(() => new Date())`;
	}

	return code;
}

function generateRelations(
	ctx: GeneratorContext,
	tableName: string,
	table: TableDefinition
): string {
	if (!table.relations || Object.keys(table.relations).length === 0) {
		return '';
	}

	const relDefs = Object.entries(table.relations)
		.map(([relName, rel]) => {
			if (rel.type === 'many') {
				return `\t${relName}: many(${rel.table})`;
			} else {
				const fields = rel.fields?.join(', ') || '';
				const refs = rel.references?.join(', ') || '';
				return `\t${relName}: one(${rel.table}, {\n\t\tfields: [${tableName}.${fields}],\n\t\treferences: [${rel.table}.${refs}]\n\t})`;
			}
		})
		.join(',\n');

	return `export const ${tableName}Relations = relations(${tableName}, ({ one, many }) => ({\n${relDefs}\n}));`;
}

function toSnakeCase(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, '');
}
