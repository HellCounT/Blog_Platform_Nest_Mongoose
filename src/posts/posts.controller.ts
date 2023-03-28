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
  Req,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsQuery } from './posts.query';
import { parseQueryPagination, QueryParser } from '../application/query.parser';
import { CommentsQuery } from '../comments/comments.query';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InputCommentDto } from '../comments/dto/input-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { CommentPaginatorDto } from '../comments/dto/output.comment-paginator.dto';
import { InputLikeStatusDto } from '../likes/dto/input.like-status.dto';
import { UsersQuery } from '../users/users.query';
import { InputCreatePostDto } from './dto/input.create-post.dto';
import { InputUpdatePostDto } from './dto/input.update-post.dto';
import { GuestGuard } from '../auth/guards/guest.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected readonly postsQueryRepo: PostsQuery,
    protected commentsService: CommentsService,
    protected readonly commentsQueryRepo: CommentsQuery,
    protected readonly usersQueryRepo: UsersQuery,
  ) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createPost(@Body() postCreateDto: InputCreatePostDto) {
    return await this.postsService.createPost(postCreateDto);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() postUpdateDto: InputUpdatePostDto,
  ) {
    return await this.postsService.updatePost(id, postUpdateDto);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param('id') id: string) {
    return await this.postsService.deletePost(id);
  }
  @UseGuards(GuestGuard)
  @Get()
  async getAllPosts(@Query() query: QueryParser, @Req() req) {
    const queryParams = parseQueryPagination(query);
    return await this.postsQueryRepo.viewAllPosts(queryParams, req.user.userId);
  }
  @UseGuards(GuestGuard)
  @Get(':id')
  async getPostById(@Param('id') id: string, @Req() req) {
    return await this.postsQueryRepo.findPostById(id, req.user.userId);
  }
  @UseGuards(GuestGuard)
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: QueryParser,
    @Req() req,
  ): Promise<CommentPaginatorDto> {
    const queryParams = parseQueryPagination(query);
    return await this.commentsQueryRepo.findCommentsByPostId(
      postId,
      queryParams,
      req.user.userId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  @HttpCode(201)
  async createComment(
    @Body() createCommentDto: InputCommentDto,
    @Req() req,
    @Param('postId') postId: string,
  ) {
    return await this.commentsService.createComment(
      createCommentDto.content,
      req.user.userId,
      postId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Req() req,
    @Body() likeStatusDto: InputLikeStatusDto,
    @Param('postId') postId: string,
  ) {
    const foundUser = await this.usersQueryRepo.findUserById(req.user.userId);
    return await this.postsService.updateLikeStatus(
      postId,
      req.user.userId,
      foundUser.accountData.login,
      likeStatusDto.likeStatus,
    );
  }
}
