import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQuery } from './comments.query';

@Controller('comments')
export class CommentsController {
  constructor(protected readonly commentsQueryRepo: CommentsQuery) {}
  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    return await this.commentsQueryRepo.findCommentById(id);
  }
}
