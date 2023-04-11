// Имеет свою модель просмотра, в которой есть инфа о владельце блога

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../../blogs/entity/blogs.schema';
import { Model } from 'mongoose';
import { QueryParser } from '../../application/query.parser';
import { BlogSAPaginatorType } from './types/super-admin.blogs.types';
import { OutputSuperAdminBlogDto } from './dto/output.super-admin.blog.dto';

@Injectable()
export class SuperAdminBlogsQuery {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}
  async viewAllBlogs(q: QueryParser): Promise<BlogSAPaginatorType> {
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
    const pageBlogs = reqPageDbBlogs.map((b) =>
      this._mapBlogToSuperAdminViewType(b),
    );
    return {
      pagesCount: Math.ceil(allBlogsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allBlogsCount,
      items: pageBlogs,
    };
  }
  private _mapBlogToSuperAdminViewType(
    blog: BlogDocument,
  ): OutputSuperAdminBlogDto {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.blogOwnerInfo.userId,
        userLogin: blog.blogOwnerInfo.userLogin,
      },
    };
  }
}
