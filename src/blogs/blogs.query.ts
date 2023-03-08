import { QueryParser } from '../application/query.parser';
import { BlogDbClass, BlogPaginatorType, BlogViewType } from './blogs.types';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsQuery {
  async viewAllBlogs(q: QueryParser): Promise<BlogPaginatorType> {
    let filter = '';
    if (q.searchNameTerm) filter = '.*' + q.searchNameTerm + '.*';
    const allBlogsCount = await BlogModel.countDocuments({
      name: { $regex: filter, $options: 'i' },
    });
    const reqPageDbBlogs = await BlogModel.find({
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
  async findBlogById(id: string): Promise<BlogViewType | null> {
    const foundBlogInstance = await BlogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    }).lean();
    if (foundBlogInstance) return this._mapBlogToViewType(foundBlogInstance);
    else return null;
  }
  _mapBlogToViewType(blog: BlogDbClass): BlogViewType {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
    };
  }
}
