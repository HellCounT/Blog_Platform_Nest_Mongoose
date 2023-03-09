import { Injectable, NotFoundException } from '@nestjs/common';
import { PostDb, PostViewModelType } from './posts.types';
import mongoose from 'mongoose';
import { BlogsQuery } from '../blogs/blogs.query';
import { PostsRepository } from './posts.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepo: PostsRepository,
    protected readonly blogsQueryRepo: BlogsQuery,
  ) {}
  async createPost(
    postTitle: string,
    short: string,
    text: string,
    blogId: string,
  ): Promise<PostViewModelType | null> {
    const foundBlog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!foundBlog) return null;
    const newPost = new PostDb(
      new mongoose.Types.ObjectId(),
      postTitle,
      short,
      text,
      blogId,
      foundBlog.name,
      new Date(),
      {
        likesCount: 0,
        dislikesCount: 0,
      },
    );
    return await this.postsRepo.createPost(newPost);
  }
  async updatePost(
    inputId: string,
    postTitle: string,
    short: string,
    text: string,
    blogId: string,
  ): Promise<boolean | null> {
    return await this.postsRepo.updatePost(
      inputId,
      postTitle,
      short,
      text,
      blogId,
    );
  }
  async deletePost(id: string): Promise<boolean | null> {
    const deleteResult = this.postsRepo.deletePost(id);
    if (!deleteResult) {
      throw new NotFoundException();
    } else return;
  }
}
