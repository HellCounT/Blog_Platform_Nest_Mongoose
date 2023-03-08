import { Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { QueryParser } from '../application/query.parser';
import { PostDbClass, PostPaginatorType, PostViewType } from './posts.types';

@Injectable()
export class PostsQuery {
  async viewAllPosts(
    q: QueryParser,
    activeUserId: string,
  ): Promise<PostPaginatorType> {
    const allPostsCount = await PostModel.countDocuments();
    const reqPageDbPosts = await PostModel.find()
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    const items = [];
    for await (const p of reqPageDbPosts) {
      const post = await this._mapPostToViewType(p, activeUserId);
      items.push(post);
    }
    return {
      pagesCount: Math.ceil(allPostsCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allPostsCount,
      items: items,
    };
  }
  async findPostById(
    id: string,
    activeUserId: string,
  ): Promise<PostViewType | null> {
    const foundPostInstance = await PostModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (foundPostInstance)
      return this._mapPostToViewType(foundPostInstance, activeUserId);
    else return null;
  }
  async findPostsByBlogId(
    blogId: string,
    q: QueryParser,
    activeUserId: string,
  ): Promise<PostPaginatorType | null> {
    if (
      await BlogModel.findOne({
        _id: new mongoose.Types.ObjectId(blogId),
      }).lean()
    ) {
      const foundPostsCount = await PostModel.countDocuments({
        blogId: { $eq: blogId },
      });
      const reqPageDbPosts = await PostModel.find({ blogId: { $eq: blogId } })
        .sort({ [q.sortBy]: q.sortDirection })
        .skip((q.pageNumber - 1) * q.pageSize)
        .limit(q.pageSize)
        .lean();
      if (!reqPageDbPosts) return null;
      else {
        const items = [];
        for await (const p of reqPageDbPosts) {
          const post = await this._mapPostToViewType(p, activeUserId);
          items.push(post);
        }
        return {
          pagesCount: Math.ceil(foundPostsCount / q.pageSize),
          page: q.pageNumber,
          pageSize: q.pageSize,
          totalCount: foundPostsCount,
          items: items,
        };
      }
    } else return null;
  }
  async _mapPostToViewType(
    post: PostDbClass,
    userId: string,
  ): Promise<PostViewType> {
    const userLike = await this.getUserLikeForPost(userId, post._id.toString());
    const newestLikes = await this._getNewestLikes(post._id.toString());
    const mappedLikes = newestLikes.map((e) => {
      return {
        addedAt: new Date(e.addedAt).toISOString(),
        userId: e.userId,
        login: e.userLogin,
      };
    });
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: new Date(post.createdAt).toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesInfo?.likesCount,
        dislikesCount: post.likesInfo?.dislikesCount,
        myStatus: userLike?.likeStatus || LikeStatus.none,
        newestLikes: mappedLikes,
      },
    };
  }
}
