import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class LikesInfo {
  @Prop({ default: 0 })
  likesCount: number;

  @Prop({ default: 0 })
  dislikesCount: number;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
