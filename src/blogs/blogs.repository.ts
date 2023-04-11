import { BlogDb } from './types/blogs.types';
import mongoose, { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './entity/blogs.schema';
import { Post, PostDocument } from '../posts/entity/posts.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}
  async getBlogById(id: string): Promise<BlogDocument> {
    return this.blogModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
  }
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
    if (!blogInstance) throw new NotFoundException();
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
    const result = await this.blogModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return result.deletedCount === 1;
  }
  async getByUserId(userId: string): Promise<BlogDocument[]> {
    return this.blogModel.find({ 'blogOwnerInfo.userId': userId });
  }
  async banByUserId(userId: string, isBanned: boolean): Promise<void> {
    await this.blogModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      { 'blogOwnerInfo.isBanned': isBanned },
    );
    return;
  }
  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }
}
