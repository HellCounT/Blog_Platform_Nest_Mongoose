import { Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { QueryParser } from '../application/query.parser';
import { PostDb, PostPaginatorType, PostViewModelType } from './posts.types';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Blog, BlogDocument } from '../blogs/blogs.schema';
import { LikeStatus } from '../likes/likes.types';
import {
  LikeForPostDocument,
  LikeForPost,
} from '../likes/likes-for-post.schema';

@Injectable()
export class PostsQuery {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(LikeForPost.name)
    private likePostModel: Model<LikeForPostDocument>,
  ) {}
  async viewAllPosts(
    q: QueryParser,
    activeUserId: string,
  ): Promise<PostPaginatorType> {
    const allPostsCount = await this.postModel.countDocuments();
    const reqPageDbPosts = await this.postModel
      .find()
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
  ): Promise<PostViewModelType | null> {
    const foundPostInstance = await this.postModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (foundPostInstance)
      return this._mapPostToViewType(foundPostInstance, activeUserId);
    else throw new NotFoundException();
  }
  async findPostsByBlogId(
    blogId: string,
    q: QueryParser,
    activeUserId: string,
  ): Promise<PostPaginatorType | null> {
    if (
      await this.blogModel
        .findOne({
          _id: new mongoose.Types.ObjectId(blogId),
        })
        .lean()
    ) {
      const foundPostsCount = await this.postModel.countDocuments({
        blogId: { $eq: blogId },
      });
      const reqPageDbPosts = await this.postModel
        .find({ blogId: { $eq: blogId } })
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
    } else throw new NotFoundException();
  }
  async getUserLikeForPost(userId: string, postId: string) {
    return this.likePostModel.findOne({
      postId: postId,
      userId: userId,
    });
  }
  private async _getNewestLikes(
    postId: string,
  ): Promise<Array<LikeForPostDocument>> {
    return this.likePostModel
      .find({
        postId: postId,
        likeStatus: LikeStatus.like,
      })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }
  async _mapPostToViewType(
    post: PostDb,
    userId: string,
  ): Promise<PostViewModelType> {
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
