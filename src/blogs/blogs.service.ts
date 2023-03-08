import { BlogDbClass, BlogViewType } from './blogs.types';
import mongoose from 'mongoose';

export class BlogsService {
  constructor(protected readonly blogsRepo: BlogsRepository) {}
  async createBlog(
    name: string,
    description: string,
    website: string,
  ): Promise<BlogViewType> {
    const newBlog = new BlogDbClass(
      new mongoose.Types.ObjectId(),
      name,
      description,
      website,
      new Date().toISOString(),
    );
    const result = await this.blogsRepo.createBlog(newBlog);
    return {
      id: result._id.toString(),
      ...newBlog,
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
}
