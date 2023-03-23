import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePostInputModel,
  PostDb,
  PostViewModelType,
  UpdatePostInputModel,
} from './posts.types';
import mongoose from 'mongoose';
import { BlogsQuery } from '../blogs/blogs.query';
import { PostsRepository } from './posts.repository';
import { LikeStatus } from '../likes/likes.types';
import { PostsQuery } from './posts.query';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepo: PostsRepository,
    protected likesForPostsService: LikesForPostsService,
    protected readonly blogsQueryRepo: BlogsQuery,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  async createPost(
    postCreateDto: CreatePostInputModel,
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
  async updateLikeStatus(
    postId: string,
    activeUserId: mongoose.Types.ObjectId,
    activeUserLogin: string,
    inputLikeStatus: LikeStatus,
  ): Promise<boolean> {
    const foundPost = await this.postsQueryRepo.findPostById(
      postId,
      activeUserId.toString(),
    );
    if (!foundPost) {
      throw new NotFoundException();
    } else {
      const foundUserLike = await this.postsQueryRepo.getUserLikeForPost(
        activeUserId.toString(),
        postId,
      );
      let currentLikesCount = foundPost.extendedLikesInfo.likesCount;
      let currentDislikesCount = foundPost.extendedLikesInfo.dislikesCount;
      switch (inputLikeStatus) {
        case LikeStatus.like:
          if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
            currentLikesCount++;
            break;
          }
          if (foundUserLike.likeStatus === LikeStatus.dislike) {
            currentLikesCount++;
            currentDislikesCount--;
            break;
          }
          break;
        case LikeStatus.dislike:
          if (!foundUserLike || foundUserLike.likeStatus === LikeStatus.none) {
            currentDislikesCount++;
            break;
          }
          if (foundUserLike.likeStatus === LikeStatus.like) {
            currentLikesCount--;
            currentDislikesCount++;
            break;
          }
          break;
        case LikeStatus.none:
          if (foundUserLike?.likeStatus === LikeStatus.like) {
            currentLikesCount--;
            break;
          }
          if (foundUserLike?.likeStatus === LikeStatus.dislike) {
            currentDislikesCount--;
            break;
          }
          break;
      }
      if (!foundUserLike) {
        await this.likesForPostsService.createNewLike(
          postId,
          activeUserId.toString(),
          activeUserLogin,
          inputLikeStatus,
        );
        await this.postsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          postId,
        );
        return true;
      } else {
        await this.likesForPostsService.updateLikeStatus(
          postId,
          activeUserId.toString(),
          inputLikeStatus,
        );
        await this.postsRepo.updateLikesCounters(
          currentLikesCount,
          currentDislikesCount,
          postId,
        );
        return true;
      }
    }
  }
}
