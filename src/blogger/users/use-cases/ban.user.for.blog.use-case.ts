import { InputBanUserForBlogDto } from '../dto/input.ban-user-for-blog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { UsersBannedByBloggerRepository } from '../users-banned-by-blogger/users-banned-by-blogger.repository';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserBannedByBloggerDb } from '../users-banned-by-blogger/types/user-banned-by-blogger.types';

export class BanUserForBlogCommand {
  constructor(
    public banUserForBlogDto: InputBanUserForBlogDto,
    public userIdToBan: string,
    public blogOwnerId: string,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
    protected usersBannedByBloggerRepo: UsersBannedByBloggerRepository,
  ) {}
  async execute(command: BanUserForBlogCommand): Promise<boolean> {
    const userToBan = await this.usersRepo.getUserById(command.userIdToBan);
    const foundBlog = await this.blogsRepo.getBlogById(command.blogOwnerId);
    if (command.blogOwnerId !== foundBlog.blogOwnerInfo.userId)
      throw new UnauthorizedException();
    if (!userToBan || !foundBlog) throw new BadRequestException();
    const foundBan = this.usersBannedByBloggerRepo.findUserBan(
      command.banUserForBlogDto.blogId,
      command.userIdToBan,
    );
    if (command.banUserForBlogDto.isBanned === true) {
      if (foundBan) return true;
      else {
        const banUserByBloggerInfo = new UserBannedByBloggerDb(
          command.banUserForBlogDto.blogId,
          command.blogOwnerId,
          command.userIdToBan,
          userToBan.accountData.login,
          command.banUserForBlogDto.banReason,
          new Date(),
        );
        await this.usersBannedByBloggerRepo.banUser(banUserByBloggerInfo);
        return true;
      }
    }
    if (command.banUserForBlogDto.isBanned === false) {
      if (!foundBan) return true;
      else {
        await this.usersBannedByBloggerRepo.unbanUser(
          command.banUserForBlogDto.blogId,
          command.userIdToBan,
        );
        return true;
      }
    }
  }
}
