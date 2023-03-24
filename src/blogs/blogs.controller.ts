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
import { CurrentUser } from '../auth/decorators/get-decorators/current-user-id.param.decorator';
import { InputCreatePostDto } from '../posts/dto/input.create-post.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected readonly blogsQueryRepo: BlogsQuery,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  @Post()
  async createBlog(@Body() blogCreateDto: CreateBlogInputModel) {
    return await this.blogsService.createBlog(blogCreateDto);
  }
  @Post(':blogId/posts')
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
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() blogDataDto: UpdateBlogInputModel,
    @Param('id') id: string,
  ) {
    return await this.blogsService.updateBlog(id, blogDataDto);
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') id: string) {
    return await this.blogsService.deleteBlog(id);
  }
  @Get()
  async getAllBlogs(@Query() query: QueryParser) {
    const queryParams = parseQueryPagination(query);
    return await this.blogsQueryRepo.viewAllBlogs(queryParams);
  }
  @Get(':id')
  async getBlogById(@Param('id') id: string) {
    return await this.blogsQueryRepo.findBlogById(id);
  }
  @Get(':id/posts')
  async getPostsForBlogId(
    @Param('id') id: string,
    @Query() query: QueryParser,
    @CurrentUser() userId: string,
  ) {
    const queryParams = parseQueryPagination(query);
    return this.postsQueryRepo.findPostsByBlogId(id, queryParams, userId);
  }
}
