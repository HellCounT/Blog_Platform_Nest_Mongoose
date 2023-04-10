import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { LikeStatus } from './likes.types';

export type LikeForCommentDocument = HydratedDocument<LikeForComment>;

@Schema()
export class LikeForComment {
  @Prop({ required: true })
  _id: mongoose.Types.ObjectId;
  @Prop({ required: true })
  commentId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ required: true })
  likeStatus: LikeStatus;
}

export const LikesForCommentsSchema =
  SchemaFactory.createForClass(LikeForComment);
