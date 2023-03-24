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
import {
  CreateBlogInputModel,
  CreatePostForBlogModel,
  UpdateBlogInputModel,
} from './blogs.types';
import { BlogsService } from './blogs.service';
import { parseQueryPagination, QueryParser } from '../application/query.parser';
import { BlogsQuery } from './blogs.query';
import { PostsService } from '../posts/posts.service';
import { PostsQuery } from '../posts/posts.query';
import { InputCreatePostDto } from '../posts/dto/input.create-post.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { GuestGuard } from '../auth/guards/guest.guard';
import { GetRefreshTokenPayload } from '../auth/decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from '../auth/auth.types';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected readonly blogsQueryRepo: BlogsQuery,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  @HttpCode(201)
  async createBlog(@Body() blogCreateDto: CreateBlogInputModel) {
    return await this.blogsService.createBlog(blogCreateDto);
  }
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForBlogId(
    @Body() postCreateForBlogDto: CreatePostForBlogModel,
    @Param('blogId') blogId: string,
  ) {
    const postCreateDto: InputCreatePostDto = {
      ...postCreateForBlogDto,
      blogId: blogId,
    };
    return await this.postsService.createPost(postCreateDto);
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogDataDto: UpdateBlogInputModel,
    @Param('id') id: string,
  ) {
    return await this.blogsService.updateBlog(id, blogDataDto);
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    return await this.blogsService.deleteBlog(id);
  }
  @Get()
  @HttpCode(200)
  async getAllBlogs(@Query() query: QueryParser) {
    const queryParams = parseQueryPagination(query);
    return await this.blogsQueryRepo.viewAllBlogs(queryParams);
  }
  @Get(':id')
  @HttpCode(200)
  async getBlogById(@Param('id') id: string) {
    return await this.blogsQueryRepo.findBlogById(id);
  }
  @UseGuards(GuestGuard)
  @Get(':id/posts')
  @HttpCode(200)
  async getPostsForBlogId(
    @Param('id') id: string,
    @Query() query: QueryParser,
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    const queryParams = parseQueryPagination(query);
    return this.postsQueryRepo.findPostsByBlogId(
      id,
      queryParams,
      payload.userId.toString(),
    );
  }
}
