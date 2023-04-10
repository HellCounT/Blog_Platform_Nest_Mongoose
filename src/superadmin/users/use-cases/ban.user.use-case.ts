import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/users.repository';
import { BlogsRepository } from '../../../blogs/blogs.repository';
import { PostsRepository } from '../../../posts/posts.repository';
import { CommentsRepository } from '../../../comments/comments.repository';
import { LikesForPostsRepository } from '../../../likes/likes-for-posts.repository';
import { LikesForCommentsRepository } from '../../../likes/likes-for-comments.repository';
import { DevicesRepository } from '../../../security/devices/devices.repository';
import { InputBanUserDto } from '../dto/input.ban-user.dto';
import { NotFoundException } from '@nestjs/common';

export class BanUserCommand {
  constructor(public banUserDto: InputBanUserDto, public id: string) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected blogsRepo: BlogsRepository,
    protected postsRepo: PostsRepository,
    protected commentsRepo: CommentsRepository,
    protected likesForPostsRepo: LikesForPostsRepository,
    protected likesForCommentsRepo: LikesForCommentsRepository,
    protected devicesRepo: DevicesRepository,
  ) {}
  async execute(command: BanUserCommand): Promise<boolean> {
    const user = this.usersRepo.getUserById(command.id);
    if (!user) throw new NotFoundException();
  }
}
