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
import { CommentsController } from './comments/comments.controller';
import { PostsService } from './posts/posts.service';
import { PostsRepository } from './posts/posts.repository';
import { PostsQuery } from './posts/posts.query';
import { CommentsQuery } from './comments/comments.query';
import { UsersQuery } from './users/users.query';
import { MongooseModule } from '@nestjs/mongoose';
import { settings } from './settings';
import { Blog, BlogSchema } from './blogs/blogs.schema';
import { Post, PostSchema } from './posts/posts.schema';
import { Comment, CommentSchema } from './comments/comments.schema';
import { User, UserSchema } from './users/users.schema';

@Module({
  imports: [
    MongooseModule.forRoot(settings.MONGO_URI),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    AppController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
  ],
  providers: [
    AppService,
    BlogsService,
    BlogsRepository,
    BlogsQuery,
    PostsService,
    PostsRepository,
    PostsQuery,
    CommentsQuery,
    UsersService,
    UsersRepository,
    UsersQuery,
  ],
})
export class AppModule {}
