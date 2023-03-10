import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePostInputModelType,
  PostDb,
  PostViewModelType,
  UpdatePostInputModel,
} from './posts.types';
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
    postCreateDto: CreatePostInputModelType,
  ): Promise<PostViewModelType | null> {
    const foundBlog = await this.blogsQueryRepo.findBlogById(
      postCreateDto.blogId,
    );
    if (!foundBlog) throw new NotFoundException();
    const newPost = new PostDb(
      new mongoose.Types.ObjectId(),
      postCreateDto.title,
      postCreateDto.shortDescription,
      postCreateDto.content,
      postCreateDto.blogId,
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
    postUpdateDto: UpdatePostInputModel,
  ): Promise<boolean> {
    const updateResult = await this.postsRepo.updatePost(
      inputId,
      postUpdateDto.title,
      postUpdateDto.shortDescription,
      postUpdateDto.content,
      postUpdateDto.blogId,
    );
    if (updateResult === null || updateResult === false)
      throw new NotFoundException();
    else return true;
  }
  async deletePost(id: string): Promise<boolean | null> {
    const deleteResult = await this.postsRepo.deletePost(id);
    if (deleteResult === false) {
      throw new NotFoundException();
    } else return true;
  }
}
