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
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostInputModel, UpdatePostInputModel } from './posts.types';
import { PostsQuery } from './posts.query';
import { parseQueryPagination, QueryParser } from '../application/query.parser';
import { CommentsQuery } from '../comments/comments.query';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/get-decorators/current-user-id.param.decorator';
import { InputCreateCommentDto } from '../comments/dto/input.create-comment.dto';
import { CommentsService } from '../comments/comments.service';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected readonly postsQueryRepo: PostsQuery,
    protected commentsService: CommentsService,
    protected readonly commentsQueryRepo: CommentsQuery,
  ) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(200)
  async createPost(@Body() postCreateDto: CreatePostInputModel) {
    return await this.postsService.createPost(postCreateDto);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() postUpdateDto: UpdatePostInputModel,
  ) {
    return await this.postsService.updatePost(id, postUpdateDto);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }
  @Get()
  async getAllPosts(
    @Query() query: QueryParser,
    @CurrentUser() userId: string,
  ) {
    const queryParams = parseQueryPagination(query);
    return await this.postsQueryRepo.viewAllPosts(queryParams, userId);
  }
  @Get(':id')
  async getPostById(@Param('id') id: string, @CurrentUser() userId: string) {
    return await this.postsQueryRepo.findPostById(id, userId);
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
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  @HttpCode(201)
  async createComment(
    @Body() createCommentDto: InputCreateCommentDto,
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return await this.commentsService.createComment(
      createCommentDto.content,
      userId,
      postId,
    );
  }
}
