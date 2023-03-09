import { PostDb, PostViewModelType } from './posts.types';
import mongoose from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsRepository {
  async createPost(newPost: PostDb): Promise<PostViewModelType | null> {
    const postInstance = new PostModel(newPost);
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
    const foundBlog = await BlogModel.findOne({
      _id: new mongoose.Types.ObjectId(blogId),
    });
    if (!foundBlog) return null;
    else {
      const postInstance = await PostModel.findOne({
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
    const postInstance = await PostModel.findOne({
      _id: new mongoose.Types.ObjectId(inputId),
    });
    if (!postInstance) return false;
    await postInstance.deleteOne();
    return true;
  }
}
