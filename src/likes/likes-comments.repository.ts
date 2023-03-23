import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LikeForComment } from './likes-comments.schema';
import { Model } from 'mongoose';

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
}
