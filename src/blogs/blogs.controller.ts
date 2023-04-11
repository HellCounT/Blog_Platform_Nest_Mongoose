import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { parseQueryPagination, QueryParser } from '../application/query.parser';
import { BlogsQuery } from './blogs.query';
import { PostsService } from '../posts/posts.service';
import { PostsQuery } from '../posts/posts.query';
import { InputCreatePostDto } from '../posts/dto/input.create-post.dto';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { GuestGuard } from '../auth/guards/guest.guard';
import { InputCreatePostForBlogDto } from '../blogger/blogs/dto/input.create-post-for-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    protected postsService: PostsService,
    protected readonly blogsQueryRepo: BlogsQuery,
    protected readonly postsQueryRepo: PostsQuery,
  ) {}
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  @HttpCode(201)
  async createPostForBlogId(
    @Body() postCreateForBlogDto: InputCreatePostForBlogDto,
    @Param('blogId') blogId: string,
  ) {
    const postCreateDto: InputCreatePostDto = {
      ...postCreateForBlogDto,
      blogId: blogId,
    };
    return await this.postsService.createPost(postCreateDto);
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
    const result = await this.blogsQueryRepo.findBlogById(id);
    if (!result) throw new NotFoundException();
    return result;
  }
  @UseGuards(GuestGuard)
  @Get(':id/posts')
  @HttpCode(200)
  async getPostsForBlogId(
    @Param('id') id: string,
    @Query() query: QueryParser,
    @Req() req,
  ) {
    const queryParams = parseQueryPagination(query);
    return this.postsQueryRepo.findPostsByBlogId(
      id,
      queryParams,
      req.user.userId,
    );
  }
}
