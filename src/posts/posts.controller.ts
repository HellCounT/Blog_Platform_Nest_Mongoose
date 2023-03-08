import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostInputModelType, UpdatePostInputModel } from './posts.types';
import { PostsQuery } from './posts.query';

@Controller('posts')
export class PostsController {
  constructor(
    protected readonly postsService: PostsService,
    protected readonly commentsService: CommentsService,
    protected readonly postsQueryRepo: PostsQuery,
    protected readonly commentsQueryRepo: CommentsQuery,
  ) {}
  @Post()
  async createPost(@Body() input: CreatePostInputModelType) {
    return await this.postsService.createPost(
      input.title,
      input.shortDescription,
      input.content,
      input.blogId,
    );
  }
  @Put(':id')
  async updatePost(
    @Param(':id') id: string,
    @Body() input: UpdatePostInputModel,
  ) {
    return await this.postsService.updatePost(
      id,
      input.title,
      input.shortDescription,
      input.content,
      input.blogId,
    );
  }
}
