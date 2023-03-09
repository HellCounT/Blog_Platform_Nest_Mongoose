import { BlogDb, BlogViewModelType } from './blogs.types';
import mongoose from 'mongoose';
import { BlogsRepository } from './blogs.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepo: BlogsRepository) {}
  async createBlog(
    name: string,
    description: string,
    website: string,
  ): Promise<BlogViewModelType> {
    const newBlog = new BlogDb(
      new mongoose.Types.ObjectId(),
      name,
      description,
      website,
      new Date().toISOString(),
      false,
    );
    const result = await this.blogsRepo.createBlog(newBlog);
    return {
      id: result._id.toString(),
      name: result.name,
      description: result.description,
      websiteUrl: result.websiteUrl,
      createdAt: result.createdAt,
      isMembership: result.isMembership,
    };
  }
  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ) {
    return await this.blogsRepo.updateBlog(id, name, description, websiteUrl);
  }
  async deleteBlog(id: string) {
    return await this.blogsRepo.deleteBlog(id);
  }
}
