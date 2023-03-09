import { LikesInfoViewModelType } from '../posts/posts.types';
import mongoose from 'mongoose';

export type CommentViewModelType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: LikesInfoViewModelType;
};

export type CommentPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: CommentViewModelType[];
};

export class CommentDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public content: string,
    public commentatorInfo: {
      userId: string;
      userLogin: string;
    },
    public postId: string,
    public createdAt: string,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
    },
  ) {}
}
