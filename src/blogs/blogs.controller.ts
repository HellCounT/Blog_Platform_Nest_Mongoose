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
  CreateBlogInputModelType,
  CreatePostForBlogModelType,
} from './blogs.types';
import { BlogsService } from './blogs.service';
import { parseQueryPagination, QueryParser } from '../application/query.parser';
import { BlogsQuery } from './blogs.query';
import { PostsService } from '../posts/posts.service';
import { PostsQuery } from '../posts/posts.query';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
    protected blogsQueryRepo: BlogsQuery,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  @Post()
  async createBlog(@Body() input: CreateBlogInputModelType) {
    return await this.blogsService.createBlog(
      input.name,
      input.description,
      input.websiteUrl,
    );
  }
  @Post(':blogId/posts')
  async createPostForBlogId(
    @Body() input: CreatePostForBlogModelType,
    @Param('blogId') blogId: string,
  ) {
    return await this.postsService.createPost(
      input.title,
      input.shortDescription,
      input.content,
      blogId,
    );
  }
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Body() input: CreateBlogInputModelType,
    @Param('id') id: string,
  ) {
    return await this.blogsService.updateBlog(
      id,
      input.name,
      input.description,
      input.websiteUrl,
    );
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
  ) {
    const queryParams = parseQueryPagination(query);
    return this.postsQueryRepo.findPostsByBlogId(id, queryParams);
  }
}
