import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users/entity/users.schema';
import { Model } from 'mongoose';
import {
  UserBannedByBlogger,
  UserBannedByBloggerDocument,
} from './users-banned-by-blogger/entity/user-banned-by-blogger.schema';
import { Blog, BlogDocument } from '../../blogs/entity/blogs.schema';

@Injectable()
export class BloggerUsersQuery {
  constructor(
    @InjectModel(User.name) private readonly usersModel: Model<UserDocument>,
    @InjectModel(UserBannedByBlogger.name)
    private userBannedByBloggerModel: Model<UserBannedByBloggerDocument>,
    @InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>,
  ) {}
}
