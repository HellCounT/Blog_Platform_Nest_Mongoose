import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostInputModel, UpdatePostInputModel } from './posts.types';
import { PostsQuery } from './posts.query';
import { parseQueryPagination, QueryParser } from '../application/query.parser';
import { CommentsQuery } from '../comments/comments.query';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected readonly postsQueryRepo: PostsQuery,
    protected readonly commentsQueryRepo: CommentsQuery,
  ) {}
  @Post()
  async createPost(@Body() postCreateDto: CreatePostInputModel) {
    return await this.postsService.createPost(postCreateDto);
  }
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() postUpdateDto: UpdatePostInputModel,
  ) {
    return await this.postsService.updatePost(id, postUpdateDto);
  }
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }
  @Get()
  async getAllPosts(@Query() query: QueryParser) {
    const queryParams = parseQueryPagination(query);
    return await this.postsQueryRepo.viewAllPosts(queryParams);
  }
  @Get(':id')
  async getPostById(@Param('id') id: string) {
    return await this.postsQueryRepo.findPostById(id);
  }
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: QueryParser,
  ) {
    const queryParams = parseQueryPagination(query);
    return await this.commentsQueryRepo.findCommentsByPostId(
      postId,
      queryParams,
    );
  }
}
