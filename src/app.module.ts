import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration/configuration';
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
import { Blog, BlogSchema } from './blogs/blogs.schema';
import { Post, PostSchema } from './posts/posts.schema';
import { Comment, CommentSchema } from './comments/comments.schema';
import { User, UserSchema } from './users/users.schema';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthController } from './auth/auth.controller';
import { Device, DeviceSchema } from './security/devices/devices.schema';
import {
  ExpiredToken,
  ExpiredTokenSchema,
} from './security/tokens/expiredTokenSchema';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './security/devices/devices.controller';
import {
  LikeForPost,
  LikesForPostsSchema,
} from './likes/likes-for-post.schema';
import {
  LikeForComment,
  LikesForCommentsSchema,
} from './likes/likes-for-comments.schema';
import { LikesForCommentsRepository } from './likes/likes-for-comments.repository';
import { LikesForPostsRepository } from './likes/likes-for-posts.repository';
import { JwtAdapter } from './auth/jwt.adapter';
import { LikesForPostsService } from './likes/likes-for-posts.service';
import { LikesForCommentsService } from './likes/likes-for-comments.service';
import { EmailManager } from './email/email-manager';
import { JwtService } from '@nestjs/jwt';
import { DevicesRepository } from './security/devices/devices.repository';
import { ExpiredTokensRepository } from './security/tokens/expired.tokens.repository';
import { DevicesService } from './security/devices/devices.service';
import { CommentsService } from './comments/comments.service';
import { CommentsRepository } from './comments/comments.repository';
import { IsUniqueEmailConstraint } from './auth/decorators/validation-decorators/is-unique-email.decorator';
import { IsNewLoginConstraint } from './auth/decorators/validation-decorators/is-new-login.decorator';
import { EmailIsNotConfirmedConstraint } from './auth/decorators/validation-decorators/email-is-not-confirmed.decorator';
import { EmailConfirmationCodeIsCorrectConstraint } from './auth/decorators/validation-decorators/confirmation-code-is-correct.decorator';
import { EmailService } from './email/email.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: LikeForPost.name, schema: LikesForPostsSchema },
      { name: LikeForComment.name, schema: LikesForCommentsSchema },
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: ExpiredToken.name, schema: ExpiredTokenSchema },
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    AuthModule,
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.THROTTLE_TTL, 10),
      limit: parseInt(process.env.THROTTLE_LIMIT, 10),
    }),
  ],
  controllers: [
    AppController,
    AuthController,
    BlogsController,
    PostsController,
    CommentsController,
    UsersController,
    DevicesController,
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
    CommentsService,
    UsersService,
    UsersRepository,
    UsersQuery,
    LikesForPostsService,
    LikesForCommentsService,
    LikesForCommentsRepository,
    LikesForPostsRepository,
    JwtAdapter,
    EmailManager,
    EmailService,
    JwtService,
    DevicesService,
    CommentsRepository,
    DevicesRepository,
    ExpiredTokensRepository,
    IsUniqueEmailConstraint,
    IsNewLoginConstraint,
    EmailIsNotConfirmedConstraint,
    EmailConfirmationCodeIsCorrectConstraint,
  ],
})
export class AppModule {}
