import { BlogDb } from './blogs.types';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './blogs.schema';
import { Post, PostDocument } from '../posts/posts.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}
  async createBlog(newBlog: BlogDb): Promise<BlogDb> {
    const blogInstance = new this.blogModel(newBlog);
    await blogInstance.save();
    return newBlog;
  }
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    const blogInstance = await this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!blogInstance) return false;
    if (name) {
      blogInstance.name = name;
      await this.postModel.updateMany(
        { blogId: id },
        {
          $set: {
            blogName: name,
          },
        },
      );
    }
    if (description) blogInstance.description = description;
    if (websiteUrl) blogInstance.websiteUrl = websiteUrl;
    await blogInstance.save();
    return true;
  }
  async deleteBlog(id: string): Promise<boolean> {
    const blogInstance = await this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!blogInstance) return false;
    await blogInstance.deleteOne();
    return true;
  }
}
