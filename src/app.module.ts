import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersRepository } from './users/users.repository';
import { BlogsService } from './blogs/blogs.service';
import { BlogsRepository } from './blogs/blogs.repository';
import { BlogsController } from './blogs/blogs.controller';

@Module({
  imports: [],
  controllers: [AppController, BlogsController, UsersController],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    UsersService,
    UsersRepository,
  ],
})
export class AppModule {}
