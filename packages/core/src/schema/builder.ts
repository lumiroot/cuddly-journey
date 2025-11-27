/**
 * Schema Builder DSL for vendor-agnostic schema definitions
 * Generates Drizzle schemas for SQLite and PostgreSQL
 */

export type Dialect = 'sqlite' | 'postgresql';

export interface FieldDefinition {
	type: 'string' | 'text' | 'uuid' | 'integer' | 'boolean' | 'timestamp';
	length?: number;
	nullable?: boolean;
	unique?: boolean;
	primaryKey?: boolean;
	default?: any;
	defaultNow?: boolean;
	defaultFn?: () => any;
	references?: {
		table: string;
		column: string;
		onDelete?: 'cascade' | 'set null' | 'restrict';
	};
}

export interface TableDefinition {
	name: string;
	columns: Record<string, FieldDefinition>;
	relations?: Record<string, RelationDefinition>;
}

export interface RelationDefinition {
	type: 'one' | 'many';
	table: string;
	fields?: string[];
	references?: string[];
}

class FieldBuilder {
	protected def: FieldDefinition;

	constructor(type: FieldDefinition['type']) {
		this.def = { type, nullable: false };
	}

	nullable(): this {
		this.def.nullable = true;
		return this;
	}

	notNull(): this {
		this.def.nullable = false;
		return this;
	}

	unique(): this {
		this.def.unique = true;
		return this;
	}

	primaryKey(): this {
		this.def.primaryKey = true;
		return this;
	}

	default(value: any): this {
		this.def.default = value;
		return this;
	}

	defaultNow(): this {
		this.def.defaultNow = true;
		return this;
	}

	defaultFn(fn: () => any): this {
		this.def.defaultFn = fn;
		return this;
	}

	references(
		refFn: () => { table: string; column: string },
		options?: { onDelete?: 'cascade' | 'set null' | 'restrict' }
	): this {
		const ref = refFn();
		this.def.references = {
			table: ref.table,
			column: ref.column,
			onDelete: options?.onDelete
		};
		return this;
	}

	build(): FieldDefinition {
		return this.def;
	}
}

class StringFieldBuilder extends FieldBuilder {
	constructor(length?: number) {
		super('string');
		if (length) {
			this.def.length = length;
		}
	}
}

class TextFieldBuilder extends FieldBuilder {
	constructor() {
		super('text');
	}
}

class UuidFieldBuilder extends FieldBuilder {
	constructor() {
		super('uuid');
	}
}

class IntegerFieldBuilder extends FieldBuilder {
	constructor() {
		super('integer');
	}
}

class BooleanFieldBuilder extends FieldBuilder {
	constructor() {
		super('boolean');
	}
}

class TimestampFieldBuilder extends FieldBuilder {
	constructor() {
		super('timestamp');
	}
}

export const field = {
	string: (length?: number) => new StringFieldBuilder(length),
	text: () => new TextFieldBuilder(),
	uuid: () => new UuidFieldBuilder(),
	integer: () => new IntegerFieldBuilder(),
	boolean: () => new BooleanFieldBuilder(),
	timestamp: () => new TimestampFieldBuilder()
};

export class TableBuilder {
	private tableDef: TableDefinition;

	constructor(name: string) {
		this.tableDef = {
			name,
			columns: {},
			relations: {}
		};
	}

	addColumn(name: string, builder: FieldBuilder): this {
		this.tableDef.columns[name] = (builder as any).build();
		return this;
	}

	addRelation(name: string, relation: RelationDefinition): this {
		if (!this.tableDef.relations) {
			this.tableDef.relations = {};
		}
		this.tableDef.relations[name] = relation;
		return this;
	}

	build(): TableDefinition {
		return this.tableDef;
	}
}

export function defineTable(
	name: string,
	columns: Record<string, FieldBuilder>
): TableDefinition {
	const tableDef: TableDefinition = {
		name,
		columns: {},
		relations: {}
	};

	for (const [colName, builder] of Object.entries(columns)) {
		tableDef.columns[colName] = (builder as any).build();
	}

	return tableDef;
}

export function defineRelation(
	type: 'one' | 'many',
	table: string,
	options?: { fields?: string[]; references?: string[] }
): RelationDefinition {
	return {
		type,
		table,
		fields: options?.fields,
		references: options?.references
	};
}
