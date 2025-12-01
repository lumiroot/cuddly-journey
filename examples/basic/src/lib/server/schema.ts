/**
 * Combined schema for the application
 * Re-exports schemas from @brixkit packages
 */

// Re-export all core schemas (users, sessions, roles, permissions)
export * from '@brixkit/db-sqlite/schema';

// Re-export feature board schemas (boards, posts, comments)
export {
	boards,
	posts,
	comments,
	boardsRelations,
	postsRelations,
	commentsRelations
} from '@brixkit/feature-board/schema/sqlite';

// Combined schema object for use in drizzle() initialization
import * as coreSchema from '@brixkit/db-sqlite/schema';
import * as boardSchema from '@brixkit/feature-board/schema/sqlite';

export const schema = {
	...coreSchema,
	...boardSchema
};
