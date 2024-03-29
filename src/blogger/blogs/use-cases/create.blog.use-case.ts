import { CommandHandler } from '@nestjs/cqrs';
import { InputBlogCreateDto } from '../dto/input.create-blog.dto';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { BlogDb, BlogViewModelType } from '../../../blogs/types/blogs.types';
import mongoose from 'mongoose';
import { UsersRepository } from '../../../users/users.repository';
import { UnauthorizedException } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(
    public blogCreateDto: InputBlogCreateDto,
    public userId: string,
  ) {}
}
@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase {
  constructor(
    protected blogsRepo: BlogsRepository,
    protected usersRepo: UsersRepository,
  ) {}
  async execute(command: CreateBlogCommand): Promise<BlogViewModelType> {
    const user = await this.usersRepo.getUserById(command.userId);
    if (!user) throw new UnauthorizedException(['wrong user id']);
    const newBlog = new BlogDb(
      new mongoose.Types.ObjectId(),
      command.blogCreateDto.name,
      command.blogCreateDto.description,
      command.blogCreateDto.websiteUrl,
      new Date().toISOString(),
      false,
      {
        userId: command.userId,
        userLogin: user.accountData.login,
        isBanned: false,
      },
      false,
      null,
    );
    const result = await this.blogsRepo.createBlog(newBlog);
    return {
      id: result._id.toString(),
      name: result.name,
      description: result.description,
      websiteUrl: result.websiteUrl,
      createdAt: result.createdAt,
      isMembership: result.isMembership,
    };
  }
}
