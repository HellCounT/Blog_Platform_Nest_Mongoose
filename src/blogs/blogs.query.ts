import { QueryParser } from '../application/query.parser';
import { BlogDb, BlogPaginatorType, BlogViewModelType } from './blogs.types';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';

@Injectable()
export class BlogsQuery {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async viewAllBlogs(q: QueryParser): Promise<BlogPaginatorType> {
    let filter = '';
    if (q.searchNameTerm) filter = '.*' + q.searchNameTerm + '.*';
    const allBlogsCount = await this.blogModel.countDocuments({
      name: { $regex: filter, $options: 'i' },
    });
    const reqPageDbBlogs = await this.blogModel
      .find({
        name: { $regex: filter, $options: 'i' },
      })
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    const pageBlogs = reqPageDbBlogs.map((b) => this._mapBlogToViewType(b));
    return {
      pagesCount: Math.ceil(allBlogsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allBlogsCount,
      items: pageBlogs,
    };
  }
  async findBlogById(id: string): Promise<BlogViewModelType | null> {
    const foundBlogInstance = await this.blogModel
      .findOne({
        _id: new mongoose.Types.ObjectId(id),
      })
      .lean();
    if (foundBlogInstance) return this._mapBlogToViewType(foundBlogInstance);
    else return null;
  }
  _mapBlogToViewType(blog: BlogDb): BlogViewModelType {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
