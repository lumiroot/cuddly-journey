/**
 * Board feature business logic
 */

import type { User, PermissionChecker } from '@brixkit/core';
import type {
	Board,
	Post,
	Comment,
	BoardRepository,
	PostRepository,
	CommentRepository,
	PostWithAuthor,
	CommentWithAuthor
} from '../schema/index.ts';

export class BoardService {
	constructor(
		private boardRepo: BoardRepository,
		private permissionChecker: PermissionChecker
	) {}

	async getBoard(id: string): Promise<Board | null> {
		return this.boardRepo.findById(id);
	}

	async getAllBoards(): Promise<Board[]> {
		return this.boardRepo.findAll();
	}

	async createBoard(user: User, board: Omit<Board, 'id' | 'createdAt' | 'updatedAt'>): Promise<Board> {
		if (!this.permissionChecker.hasPermission(user, 'board', 'create')) {
			throw new Error('Permission denied: create board');
		}

		return this.boardRepo.create(board);
	}

	async updateBoard(user: User, id: string, updates: Partial<Board>): Promise<Board> {
		if (!this.permissionChecker.hasPermission(user, 'board', 'update')) {
			throw new Error('Permission denied: update board');
		}

		return this.boardRepo.update(id, updates);
	}

	async deleteBoard(user: User, id: string): Promise<void> {
		if (!this.permissionChecker.hasPermission(user, 'board', 'delete')) {
			throw new Error('Permission denied: delete board');
		}

		return this.boardRepo.delete(id);
	}
}

export class PostService {
	constructor(
		private postRepo: PostRepository,
		private permissionChecker: PermissionChecker
	) {}

	async getPost(id: string): Promise<PostWithAuthor | null> {
		const post = await this.postRepo.findById(id);
		if (post) {
			await this.postRepo.incrementViewCount(id);
		}
		return post;
	}

	async getPostsByBoard(
		boardId: string,
		limit: number = 20,
		offset: number = 0
	): Promise<PostWithAuthor[]> {
		return this.postRepo.findByBoardId(boardId, limit, offset);
	}

	async createPost(
		user: User,
		post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>
	): Promise<Post> {
		if (!this.permissionChecker.hasPermission(user, 'post', 'create')) {
			throw new Error('Permission denied: create post');
		}

		return this.postRepo.create(post);
	}

	async updatePost(user: User, id: string, updates: Partial<Post>): Promise<Post> {
		const post = await this.postRepo.findById(id);
		if (!post) {
			throw new Error('Post not found');
		}

		// Users can update their own posts or if they have permission
		const canUpdate =
			post.authorId === user.id || this.permissionChecker.hasPermission(user, 'post', 'update');

		if (!canUpdate) {
			throw new Error('Permission denied: update post');
		}

		return this.postRepo.update(id, updates);
	}

	async deletePost(user: User, id: string): Promise<void> {
		const post = await this.postRepo.findById(id);
		if (!post) {
			throw new Error('Post not found');
		}

		// Users can delete their own posts or if they have permission
		const canDelete =
			post.authorId === user.id || this.permissionChecker.hasPermission(user, 'post', 'delete');

		if (!canDelete) {
			throw new Error('Permission denied: delete post');
		}

		return this.postRepo.delete(id);
	}
}

export class CommentService {
	constructor(
		private commentRepo: CommentRepository,
		private permissionChecker: PermissionChecker
	) {}

	async getComment(id: string): Promise<CommentWithAuthor | null> {
		return this.commentRepo.findById(id);
	}

	async getCommentsByPost(postId: string): Promise<CommentWithAuthor[]> {
		return this.commentRepo.findByPostId(postId);
	}

	async createComment(
		user: User,
		comment: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Comment> {
		if (!this.permissionChecker.hasPermission(user, 'comment', 'create')) {
			throw new Error('Permission denied: create comment');
		}

		return this.commentRepo.create(comment);
	}

	async updateComment(user: User, id: string, updates: Partial<Comment>): Promise<Comment> {
		const comment = await this.commentRepo.findById(id);
		if (!comment) {
			throw new Error('Comment not found');
		}

		const canUpdate =
			comment.authorId === user.id ||
			this.permissionChecker.hasPermission(user, 'comment', 'update');

		if (!canUpdate) {
			throw new Error('Permission denied: update comment');
		}

		return this.commentRepo.update(id, updates);
	}

	async deleteComment(user: User, id: string): Promise<void> {
		const comment = await this.commentRepo.findById(id);
		if (!comment) {
			throw new Error('Comment not found');
		}

		const canDelete =
			comment.authorId === user.id ||
			this.permissionChecker.hasPermission(user, 'comment', 'delete');

		if (!canDelete) {
			throw new Error('Permission denied: delete comment');
		}

		return this.commentRepo.delete(id);
	}
}
