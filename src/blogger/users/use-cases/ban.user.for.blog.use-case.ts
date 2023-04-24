import { InputBanUserForBlogDto } from '../dto/input.ban-user-for-blog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';

export class BanUserForBlogCommand {
  constructor(
    public banUserForBlogDto: InputBanUserForBlogDto,
    public userId: string,
  ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
  ) {}
  async execute(command: BanUserForBlogCommand): Promise<boolean> {}
}
