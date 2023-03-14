import { Types } from 'mongoose';
import { IsMongoId, IsOptional, Length } from 'class-validator';

export class CreatePostInputModel {
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
  @IsMongoId({ message: 'Invalid id pattern' })
  blogId: string;
}

export class UpdatePostInputModel {
  @IsOptional()
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @IsOptional()
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @IsOptional()
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
  @IsMongoId({ message: 'Invalid id pattern' })
  blogId: string;
}

export type PostViewModelType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewModelType;
};

export type LikesInfoViewModelType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
};

export type newestLike = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoViewModelType = LikesInfoViewModelType & {
  newestLikes: newestLike[];
};

export class PostDb {
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
  items: PostViewModelType[];
};
