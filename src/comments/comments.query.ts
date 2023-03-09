import mongoose from 'mongoose';
import {
  CommentDb,
  CommentPaginatorType,
  CommentViewModelType,
} from './comments.types';
import { QueryParser } from '../application/query.parser';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsQuery {
  async findCommentById(id: string): Promise<CommentViewModelType | null> {
    const foundCommentInstance = await CommentModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (foundCommentInstance)
      return this._mapCommentToViewType(foundCommentInstance);
    else return null;
  }
  async findCommentsByPostId(
    postId: string,
    q: QueryParser,
  ): Promise<CommentPaginatorType | null> {
    const foundCommentsCount = await CommentModel.countDocuments({
      postId: { $eq: postId },
    });
    const reqPageDbComments = await CommentModel.find({
      postId: { $eq: postId },
    })
      .sort({ [q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    if (!reqPageDbComments) return null;
    else {
      const items = [];
      for await (const c of reqPageDbComments) {
        const comment = await this._mapCommentToViewType(c);
        items.push(comment);
      }
      return {
        pagesCount: Math.ceil(foundCommentsCount / q.pageSize),
        page: q.pageNumber,
        pageSize: q.pageSize,
        totalCount: foundCommentsCount,
        items: items,
      };
    }
  }
  async _mapCommentToViewType(
    comment: CommentDb,
  ): Promise<CommentViewModelType> {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: 'None',
      },
    };
  }
}
