import { Injectable } from '@nestjs/common';
import { PostDbClass, PostViewType } from './posts.types';
import mongoose from 'mongoose';
import { BlogsQuery } from '../blogs/blogs.query';

@Injectable()
export class PostsService {
  constructor(
    protected readonly postsRepo: PostsRepository,
    protected readonly blogsQueryRepo: BlogsQuery,
  ) {}
  async createPost(
    postTitle: string,
    short: string,
    text: string,
    blogId: string,
  ): Promise<PostViewType | null> {
    const foundBlog = await this.blogsQueryRepo.findBlogById(blogId);
    if (!foundBlog) return null;
    const newPost = new PostDbClass(
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
  async deletePost(inputId: string): Promise<boolean | null> {
    return await this.postsRepo.deletePost(inputId);
  }
}
