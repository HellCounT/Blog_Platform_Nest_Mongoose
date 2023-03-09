import { PostDb, PostViewModelType } from './posts.types';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './posts.schema';
import { Blog, BlogDocument } from '../blogs/blogs.schema';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
  ) {}
  async createPost(newPost: PostDb): Promise<PostViewModelType | null> {
    const postInstance = new this.postModel(newPost);
    const saveResult = await postInstance.save();
    return {
      id: saveResult._id.toString(),
      title: saveResult.title,
      shortDescription: saveResult.shortDescription,
      content: saveResult.content,
      blogId: saveResult.blogId,
      blogName: saveResult.blogName,
      createdAt: saveResult.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: saveResult.likesInfo.likesCount,
        dislikesCount: saveResult.likesInfo.dislikesCount,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
  async updatePost(
    inputId: string,
    postTitle: string,
    short: string,
    text: string,
    blogId: string,
  ): Promise<boolean | null> {
    const foundBlog = await this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(blogId),
    });
    if (!foundBlog) return null;
    else {
      const postInstance = await this.postModel.findOne({
        _id: new mongoose.Types.ObjectId(inputId),
      });
      if (!postInstance) return false;
      postInstance.title = postTitle;
      postInstance.shortDescription = short;
      postInstance.content = text;
      postInstance.blogId = blogId;
      postInstance.blogName = foundBlog.name;
      await postInstance.save();
      return true;
    }
  }
  async deletePost(inputId: string): Promise<boolean> {
    const deleteResult = await this.postModel.deleteOne({
      _id: new mongoose.Types.ObjectId(inputId),
    });
    return deleteResult.deletedCount === 1;
  }
}
