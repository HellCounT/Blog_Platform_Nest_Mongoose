import {
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { InputBanUserForBlogDto } from './dto/input.ban-user-for-blog.dto';
import { BanUserForBlogCommand } from './use-cases/ban.user.for.blog.use-case';
import { BloggerUsersQuery } from './blogger.users.query';

@UseGuards(JwtAuthGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    protected readonly bloggerUsersQueryRepo: BloggerUsersQuery,
    protected commandBus: CommandBus,
  ) {}
  @Put(':id/ban')
  @HttpCode(204)
  async banUser(
    @Param('id') userId: string,
    @Body() banUserForBlogDto: InputBanUserForBlogDto,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new BanUserForBlogCommand(banUserForBlogDto, userId, req.user.userId),
    );
    return;
  }
}
