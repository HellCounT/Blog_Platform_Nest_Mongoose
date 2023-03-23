import mongoose, { Model } from 'mongoose';
import { QueryParser } from '../application/query.parser';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from './comments.schema';
import { CommentViewDto } from './dto/output.comment-view.dto';
import { CommentPaginatorDto } from './dto/output.comment-paginator.dto';

@Injectable()
export class CommentsQuery {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async findCommentById(id: string): Promise<CommentViewDto | null> {
    const foundCommentInstance = await this.commentModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (foundCommentInstance)
      return this._mapCommentToViewType(foundCommentInstance);
    else return null;
  }
  async findCommentsByPostId(
    postId: string,
    q: QueryParser,
  ): Promise<CommentPaginatorDto | null> {
    const foundCommentsCount = await this.commentModel.countDocuments({
      postId: { $eq: postId },
    });
    const reqPageDbComments = await this.commentModel
      .find({
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
    comment: CommentDocument,
  ): Promise<CommentViewDto> {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: 'userId', //comment.commentatorInfo.userId,
        userLogin: 'userId', //comment.commentatorInfo.userLogin,
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
