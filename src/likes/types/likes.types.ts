import mongoose from 'mongoose';

export enum LikeStatus {
  none = 'None',
  like = 'Like',
  dislike = 'Dislike',
}

export class CommentLikeDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public commentId: string,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

export class PostLikeDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public postId: string,
    public userId: string,
    public userLogin: string,
    public addedAt: Date,
    public likeStatus: LikeStatus,
  ) {}
}
