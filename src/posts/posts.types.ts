import { Types } from 'mongoose';

export type CreatePostInputModelType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type UpdatePostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostViewType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewType;
};

export type LikesInfoViewType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};

export type newestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoViewType = LikesInfoViewType & {
  newestLikes: newestLike[];
};

export class PostDbClass {
  constructor(
    public _id: Types.ObjectId,
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
    public createdAt: Date,
    public likesInfo: {
      likesCount: number;
      dislikesCount: number;
    },
  ) {}
}

export type PostPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: PostViewType[];
};
