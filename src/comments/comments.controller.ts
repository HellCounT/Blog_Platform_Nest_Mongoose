import { Controller, Get, Param } from '@nestjs/common';

@Controller('posts')
export class PostsController {
  constructor(protected readonly commentsQueryRepo: CommentsQuery) {}
  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    return await this.commentsQueryRepo.findCommentById(id);
  }
}
