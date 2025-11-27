/**
 * SQLite schema generated from board feature definitions
 */

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { users } from '@brixkit/core/schema/sqlite';

export const boards = sqliteTable('boards', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	description: text('description'),
	createdBy: text('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true)
});

export const posts = sqliteTable('posts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	boardId: text('board_id')
		.notNull()
		.references(() => boards.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	content: text('content').notNull(),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	viewCount: integer('view_count').notNull().default(0),
	isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false)
});

export const comments = sqliteTable('comments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	postId: text('post_id')
		.notNull()
		.references((): any => posts.id, { onDelete: 'cascade' }),
	authorId: text('author_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	parentId: text('parent_id').references((): any => comments.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Relations
export const boardsRelations = relations(boards, ({ one, many }) => ({
	creator: one(users, {
		fields: [boards.createdBy],
		references: [users.id]
	}),
	posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
	board: one(boards, {
		fields: [posts.boardId],
		references: [boards.id]
	}),
	author: one(users, {
		fields: [posts.authorId],
		references: [users.id]
	}),
	comments: many(comments)
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
	post: one(posts, {
		fields: [comments.postId],
		references: [posts.id]
	}),
	author: one(users, {
		fields: [comments.authorId],
		references: [users.id]
	}),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id]
	}),
	replies: many(comments)
}));

/**
 * Board feature schema for SQLite
 */
export const boardSchema = {
	boards,
	posts,
	comments,
	boardsRelations,
	postsRelations,
	commentsRelations
};
