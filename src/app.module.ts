import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { BlogsController } from './blogs/blogs.controller';
import { BlogsQuery } from './blogs/blogs.query';
import { PostsController } from './posts/posts.controller';

@Module({
  imports: [],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    UsersController,
  ],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    BlogsQuery,
    UsersService,
    UsersRepository,
  ],
})
export class AppModule {}
