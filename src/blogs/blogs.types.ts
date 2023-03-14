import { Types } from 'mongoose';
import { IsUrl, Length, MaxLength } from 'class-validator';

export class CreateBlogInputModelType {
  @Length(1, 15, { message: 'Incorrect name length' })
  name: string;
  @Length(1, 500, { message: 'Incorrect description length' })
  description: string;
  @IsUrl({}, { message: 'Value is not an URL' })
  @MaxLength(100, { message: 'Max URL length exceeded' })
  websiteUrl: string;
}

export class CreatePostForBlogModelType {
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
}

export type BlogViewModelType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export class BlogDb {
  constructor(
    public _id: Types.ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isMembership: boolean,
  ) {}
}

export type BlogPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogViewModelType[];
};
