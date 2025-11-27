/**
 * Board feature schema definitions
 * Database-agnostic types - use with PostgreSQL or SQLite adapters
 */

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
