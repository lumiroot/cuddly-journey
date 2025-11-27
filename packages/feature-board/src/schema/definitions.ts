/**
 * Board feature schema definitions (vendor-agnostic)
 */

import { defineTable, field, type TableDefinition } from '@brixkit/core/schema';

/**
 * Boards table
 */
export const boardsTable: TableDefinition = defineTable('boards', {
	id: field.uuid().primaryKey(),
	title: field.string(255).notNull(),
	description: field.text().nullable(),
	createdBy: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'users', column: 'id' }), { onDelete: 'cascade' }),
	createdAt: field.timestamp().notNull().defaultNow(),
	updatedAt: field.timestamp().notNull().defaultNow(),
	isActive: field.boolean().notNull().default(true)
});

boardsTable.relations = {
	creator: {
		type: 'one',
		table: 'users',
		fields: ['createdBy'],
		references: ['id']
	},
	posts: { type: 'many', table: 'posts' }
};

/**
 * Posts table
 */
export const postsTable: TableDefinition = defineTable('posts', {
	id: field.uuid().primaryKey(),
	boardId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'boards', column: 'id' }), { onDelete: 'cascade' }),
	title: field.string(255).notNull(),
	content: field.text().notNull(),
	authorId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'users', column: 'id' }), { onDelete: 'cascade' }),
	createdAt: field.timestamp().notNull().defaultNow(),
	updatedAt: field.timestamp().notNull().defaultNow(),
	viewCount: field.integer().notNull().default(0),
	isPublished: field.boolean().notNull().default(false)
});

postsTable.relations = {
	board: {
		type: 'one',
		table: 'boards',
		fields: ['boardId'],
		references: ['id']
	},
	author: {
		type: 'one',
		table: 'users',
		fields: ['authorId'],
		references: ['id']
	},
	comments: { type: 'many', table: 'comments' }
};

/**
 * Comments table
 */
export const commentsTable: TableDefinition = defineTable('comments', {
	id: field.uuid().primaryKey(),
	postId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'posts', column: 'id' }), { onDelete: 'cascade' }),
	authorId: field
		.uuid()
		.notNull()
		.references(() => ({ table: 'users', column: 'id' }), { onDelete: 'cascade' }),
	content: field.text().notNull(),
	parentId: field
		.uuid()
		.nullable()
		.references(() => ({ table: 'comments', column: 'id' }), { onDelete: 'cascade' }),
	createdAt: field.timestamp().notNull().defaultNow(),
	updatedAt: field.timestamp().notNull().defaultNow()
});

commentsTable.relations = {
	post: {
		type: 'one',
		table: 'posts',
		fields: ['postId'],
		references: ['id']
	},
	author: {
		type: 'one',
		table: 'users',
		fields: ['authorId'],
		references: ['id']
	},
	parent: {
		type: 'one',
		table: 'comments',
		fields: ['parentId'],
		references: ['id']
	},
	replies: { type: 'many', table: 'comments' }
};

/**
 * Board feature schema
 */
export const boardSchema = {
	boards: boardsTable,
	posts: postsTable,
	comments: commentsTable
};

// Type exports for TypeScript
export interface Board {
	id: string;
	title: string;
	description?: string;
	createdBy: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}

export interface Post {
	id: string;
	boardId: string;
	title: string;
	content: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	viewCount: number;
	isPublished: boolean;
}

export interface Comment {
	id: string;
	postId: string;
	authorId: string;
	content: string;
	parentId?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface PostWithAuthor extends Post {
	author: {
		id: string;
		username: string;
	};
}

export interface CommentWithAuthor extends Comment {
	author: {
		id: string;
		username: string;
	};
	replies?: CommentWithAuthor[];
}

// Repository interfaces
export interface BoardRepository {
	findById(id: string): Promise<Board | null>;
	findAll(): Promise<Board[]>;
	create(board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board>;
	update(id: string, board: Partial<Board>): Promise<Board>;
	delete(id: string): Promise<void>;
}

export interface PostRepository {
	findById(id: string): Promise<PostWithAuthor | null>;
	findByBoardId(boardId: string, limit?: number, offset?: number): Promise<PostWithAuthor[]>;
	create(post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<Post>;
	update(id: string, post: Partial<Post>): Promise<Post>;
	delete(id: string): Promise<void>;
	incrementViewCount(id: string): Promise<void>;
}

export interface CommentRepository {
	findById(id: string): Promise<CommentWithAuthor | null>;
	findByPostId(postId: string): Promise<CommentWithAuthor[]>;
	create(comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment>;
	update(id: string, comment: Partial<Comment>): Promise<Comment>;
	delete(id: string): Promise<void>;
}
