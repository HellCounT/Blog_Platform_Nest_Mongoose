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
import { InputCommentDto } from '../comments/dto/input-comment.dto';
import { CommentsService } from '../comments/comments.service';
import { CommentPaginatorDto } from '../comments/dto/output.comment-paginator.dto';
import { RefreshJwtGuard } from '../auth/guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from '../auth/decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from '../auth/auth.types';
import { InputLikeStatusDto } from '../likes/dto/input.like-status.dto';
import { UsersQuery } from '../users/users.query';

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
  @UseGuards(RefreshJwtGuard)
  @Get()
  async getAllPosts(
    @Query() query: QueryParser,
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    const queryParams = parseQueryPagination(query);
    return await this.postsQueryRepo.viewAllPosts(
      queryParams,
      payload.userId.toString(),
    );
  }
  @UseGuards(RefreshJwtGuard)
  @Get(':id')
  async getPostById(
    @Param('id') id: string,
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    return await this.postsQueryRepo.findPostById(
      id,
      payload.userId.toString(),
    );
  }
  @Get(':postId/comments')
  async getCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: QueryParser,
  ): Promise<CommentPaginatorDto> {
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
    @Body() createCommentDto: InputCommentDto,
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
  ) {
    return await this.commentsService.createComment(
      createCommentDto.content,
      userId,
      postId,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Body() likeStatusDto: InputLikeStatusDto,
    @CurrentUser() userId: string,
    @Param('postId') postId: string,
  ) {
    const foundUser = await this.usersQueryRepo.findUserById(userId);
    return await this.postsService.updateLikeStatus(
      postId,
      userId,
      foundUser.accountData.login,
      likeStatusDto.likeStatus,
    );
  }
}
