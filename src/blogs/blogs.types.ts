import { Types } from 'mongoose';

export type CreateBlogInputModelType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type CreatePostForBlogModelType = {
  title: string;
  shortDescription: string;
  content: string;
};

export type BlogViewType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
};

export class BlogDbClass {
  constructor(
    public _id: Types.ObjectId,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
  ) {}
}
