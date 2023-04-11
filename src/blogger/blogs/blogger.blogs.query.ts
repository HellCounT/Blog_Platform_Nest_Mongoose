import { Injectable } from '@nestjs/common';
import { QueryParser } from '../../application/query.parser';
import { BlogPaginatorType } from '../../blogs/types/blogs.types';
import { BlogsQuery } from '../../blogs/blogs.query';

@Injectable()
export class BloggerBlogsQuery extends BlogsQuery {
  async getAllBlogsForBlogger(
    q: QueryParser,
    userId,
  ): Promise<BlogPaginatorType> {
    let filter = '';
    if (q.searchNameTerm) filter = '.*' + q.searchNameTerm + '.*';
    const allBlogsCount = await this.blogModel.countDocuments({
      name: { $regex: filter, $options: 'i' },
      'blogOwnerInfo.userId': userId,
    });
    const reqPageDbBlogs = await this.blogModel
      .find({
        name: { $regex: filter, $options: 'i' },
        'blogOwnerInfo.userId': userId,
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
}
