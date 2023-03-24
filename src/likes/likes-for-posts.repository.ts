import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeForPost } from './likes-for-post.schema';
import { Model } from 'mongoose';
import { LikeStatus } from './likes.types';

@Injectable()
export class LikesForPostsRepository {
  constructor(
    @InjectModel(LikeForPost.name)
    private likesForPostsModel: Model<LikeForPost>,
  ) {}
  async createNewLike(newLike: LikeForPost): Promise<void> {
    const likeInPostInstance = new this.likesForPostsModel(newLike);
    await likeInPostInstance.save();
    return;
  }
  async updateLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeStatus,
  ): Promise<void> {
    const likeInPostInstance = await this.likesForPostsModel.findOne({
      postId: postId,
      userId: userId,
    });
    if (likeInPostInstance) {
      likeInPostInstance.likeStatus = likeStatus;
      await likeInPostInstance.save();
      return;
    } else return;
  }
  async deleteAllLikesWhenPostIsDeleted(postId: string): Promise<void> {
    await this.likesForPostsModel.deleteMany({ postId: postId });
    return;
  }
}