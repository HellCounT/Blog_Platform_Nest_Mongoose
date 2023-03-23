import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostsQuery } from '../posts/posts.query';
import { UsersQuery } from '../users/users.query';
import mongoose from 'mongoose';
import { CommentDb } from './comments.types';
import { CommentsRepository } from './comments.repository';
import { CommentViewDto } from './dto/output.comment-view.dto';
import { LikeStatus } from '../likes/likes.types';
import { CommentsQuery } from './comments.query';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsRepo: CommentsRepository,
    protected readonly postsQueryRepo: PostsQuery,
    protected commentsQueryRepo: CommentsQuery,
    protected readonly usersQueryRepo: UsersQuery,
    protected likesForCommentsService: LikesForCommentsService,
  ) {}
  async createComment(
    postId: string,
    userId: string,
    content: string,
  ): Promise<CommentViewDto | null> {
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
  async updateComment(
    commentId: string,
    userId: mongoose.Types.ObjectId,
    content: string,
  ): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      userId.toString(),
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.commentatorInfo.userId === userId.toString()) {
      await this.commentsRepo.updateComment(commentId, content);
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to edit other user's comment",
      ]);
  }
  async deleteComment(
    commentId: string,
    userId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      userId.toString(),
    );
    if (!foundComment) throw new NotFoundException();
    if (foundComment.commentatorInfo.userId === userId.toString()) {
      await this.commentsRepo.deleteComment(commentId);
      await this.likesForCommentsService.deleteAllLikesWhenCommentIsDeleted(
        commentId,
      );
      return true;
    } else
      throw new ForbiddenException([
        "User is not allowed to delete other user's comment",
      ]);
  }
  async updateLikeStatus(
    commentId: string,
    activeUserId: mongoose.Types.ObjectId,
    inputLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const foundComment = await this.commentsQueryRepo.findCommentById(
      commentId,
      activeUserId.toString(),
    );
    if (!foundComment) {
      throw new NotFoundException();
    } else {
      const foundUserLike = await this.commentsQueryRepo.getUserLikeForComment(
        activeUserId.toString(),
        commentId,
      );
      let currentLikesCount = foundComment.likesInfo.likesCount;
      let currentDislikesCount = foundComment.likesInfo.dislikesCount;
      switch (inputLikeStatus) {
        case LikeStatus.like:
          if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
            currentLikesCount++;
            break;
          }
          if (foundUserLike.likeStatus === LikeStatus.dislike) {
            currentLikesCount++;
            currentDislikesCount--;
            break;
          }
          break;
        case LikeStatus.dislike:
          if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
            currentDislikesCount++;
            break;
          }
          if (foundUserLike.likeStatus === LikeStatus.like) {
            currentLikesCount--;
            currentDislikesCount++;
            break;
          }
          break;
        case LikeStatus.none:
          if (foundUserLike?.likeStatus === LikeStatus.like) {
            currentLikesCount--;
            break;
          }
          if (foundUserLike?.likeStatus === LikeStatus.dislike) {
            currentDislikesCount--;
            break;
          }
          break;
      }
      if (!foundUserLike) {
        await this.likesForCommentsService.createNewLike(
          commentId,
          activeUserId.toString(),
          inputLikeStatus,
        );
        await this.commentsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          commentId,
        );
        return true;
      } else {
        await this.likesForCommentsService.updateLikeStatus(
          commentId,
          activeUserId.toString(),
          inputLikeStatus,
        );
        await this.commentsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          commentId,
        );
        return true;
      }
    }
  }
}
