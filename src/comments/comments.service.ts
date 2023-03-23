import { Injectable } from '@nestjs/common';
import { PostsRepository } from '../posts/posts.repository';
import { PostsQuery } from '../posts/posts.query';
import { UsersQuery } from '../users/users.query';
import mongoose from 'mongoose';
import { CommentDb, CommentViewModelType } from './comments.types';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected postsRepo: PostsRepository,
    protected readonly postsQueryRepo: PostsQuery,
    protected readonly usersQueryRepo: UsersQuery,
  ) {}
  async createComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<CommentViewModelType | null> {
    const foundUser = await this.usersQueryRepo.findUserById(userId);
    const foundPost = await this.postsQueryRepo.findPostById(postId, userId);
    if (!foundUser || !foundPost) return null;
    const newComment = new CommentDb(
      new mongoose.Types.ObjectId(),
      content,
      {
        userId: userId.toString(),
        userLogin: foundUser.accountData.login,
      },
      postId,
      new Date().toISOString(),
      {
        likesCount: 0,
        dislikesCount: 0,
      },
    );
    return await this.commentsRepo.createComment(newComment);
  }
}
