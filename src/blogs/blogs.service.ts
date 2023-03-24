import { BlogDb, BlogViewModelType } from './blogs.types';
import mongoose from 'mongoose';
import { BlogsRepository } from './blogs.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InputBlogCreateDto } from './dto/input.create-blog.dto';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepo: BlogsRepository) {}
  async createBlog(
    blogCreateDto: InputBlogCreateDto,
  ): Promise<BlogViewModelType> {
    const newBlog = new BlogDb(
      new mongoose.Types.ObjectId(),
      blogCreateDto.name,
      blogCreateDto.description,
      blogCreateDto.websiteUrl,
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
  async updateBlog(id: string, blogDataDto: InputBlogCreateDto) {
    return await this.blogsRepo.updateBlog(
      id,
      blogDataDto.name,
      blogDataDto.description,
      blogDataDto.websiteUrl,
    );
  }
  async deleteBlog(id: string): Promise<boolean> {
    const deletionResult = await this.blogsRepo.deleteBlog(id);
    if (deletionResult === false) throw new NotFoundException();
    else return true;
  }
}
