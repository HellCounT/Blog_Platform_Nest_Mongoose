import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeForComment } from './likes-comments.schema';
import { Model } from 'mongoose';
import { LikeStatus } from './likes.types';

@Injectable()
export class LikesForCommentsRepository {
  constructor(
    @InjectModel(LikeForComment.name)
    private likesForCommentsModel: Model<LikeForComment>,
  ) {}
  async createNewLike(newLike: LikeForComment): Promise<void> {
    const likeInCommentInstance = new this.likesForCommentsModel(newLike);
    await likeInCommentInstance.save();
    return;
  }
  async updateLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const likeInCommentInstance = await this.likesForCommentsModel.findOne({
      commentId: commentId,
      userId: userId,
    });
    if (likeInCommentInstance) {
      likeInCommentInstance.likeStatus = likeStatus;
      await likeInCommentInstance.save();
      return;
    } else return;
  }
  async deleteAllLikesWhenCommentIsDeleted(commentId: string): Promise<void> {
    await this.likesForCommentsModel.deleteMany({ commentId: commentId });
    return;
  }
}
