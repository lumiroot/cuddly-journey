/**
 * PostgreSQL schema generated from board feature definitions
 */

import { pgTable, uuid, varchar, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from '@brixkit/core/schema/postgresql';

export const boards = pgTable('boards', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	createdBy: uuid('created_by')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	isActive: boolean('is_active').notNull().default(true)
});

export const posts = pgTable('posts', {
	id: uuid('id').primaryKey().defaultRandom(),
	boardId: uuid('board_id')
		.notNull()
		.references(() => boards.id, { onDelete: 'cascade' }),
	title: varchar('title', { length: 255 }).notNull(),
	content: text('content').notNull(),
	authorId: uuid('author_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
	viewCount: integer('view_count').notNull().default(0),
	isPublished: boolean('is_published').notNull().default(false)
});

export const comments = pgTable('comments', {
	id: uuid('id').primaryKey().defaultRandom(),
	postId: uuid('post_id')
		.notNull()
		.references((): any => posts.id, { onDelete: 'cascade' }),
	authorId: uuid('author_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	content: text('content').notNull(),
	parentId: uuid('parent_id').references((): any => comments.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
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
 * Board feature schema for PostgreSQL
 */
export const boardSchema = {
	boards,
	posts,
	comments,
	boardsRelations,
	postsRelations,
	commentsRelations
};
