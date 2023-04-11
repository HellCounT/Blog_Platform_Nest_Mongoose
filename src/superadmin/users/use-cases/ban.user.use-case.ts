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
import { PostDocument } from '../../../posts/posts.schema';
import { CommentDocument } from '../../../comments/comments.schema';
import { ExpiredTokensRepository } from '../../../security/tokens/expired.tokens.repository';
import mongoose from 'mongoose';

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
    protected expiredTokensRepo: ExpiredTokensRepository,
  ) {}
  async execute(command: BanUserCommand): Promise<boolean> {
    const user = await this.usersRepo.getUserById(command.id);
    if (!user) throw new NotFoundException();
    if (user.globalBanInfo.isBanned === command.banUserDto.isBanned) return;
    const posts = await this.postsRepo.getByUserId(command.id);
    const comments = await this.commentsRepo.getByUserId(command.id);
    await this._banEntitiesOnUserBan(
      command.id,
      command.banUserDto.isBanned,
      command.banUserDto.banReason,
    );
    await this._recalculateLikesCountersOnEntities(posts, comments);
    if (command.banUserDto.isBanned === true)
      await this._killAllSessions(command.id);
    return;
  }
  private async _banEntitiesOnUserBan(
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<void> {
    await this.usersRepo.banUserById(userId, isBanned, banReason);
    await this.blogsRepo.banByUserId(userId, isBanned);
    await this.postsRepo.banByUserId(userId, isBanned);
    await this.commentsRepo.banByUserId(userId, isBanned);
    await this.likesForPostsRepo.banByUserId(userId, isBanned);
    await this.likesForCommentsRepo.banByUserId(userId, isBanned);
    return;
  }
  private async _recalculateLikesCountersOnEntities(
    posts: PostDocument[],
    comments: CommentDocument[],
  ): Promise<void> {
    for (let i = 0; i < posts.length - 1; i++) {
      const likesCounter = await this.likesForPostsRepo.getNewLikesCounter(
        posts[i]._id.toString(),
      );
      const dislikesCounter =
        await this.likesForPostsRepo.getNewDislikesCounter(
          posts[i]._id.toString(),
        );
      await this.postsRepo.updateLikesCounters(
        likesCounter,
        dislikesCounter,
        posts[i]._id.toString(),
      );
    }
    for (let i = 0; i < comments.length - 1; i++) {
      const likesCounter = await this.likesForCommentsRepo.getNewLikesCounter(
        comments[i]._id.toString(),
      );
      const dislikesCounter =
        await this.likesForCommentsRepo.getNewDislikesCounter(
          comments[i]._id.toString(),
        );
      await this.commentsRepo.updateLikesCounters(
        likesCounter,
        dislikesCounter,
        comments[i]._id.toString(),
      );
    }
    return;
  }
  private async _killAllSessions(userId: string): Promise<void> {
    const sessions = await this.devicesRepo.getAllSessionsForUser(userId);
    for (let i = 0; i < sessions.length - 1; i++) {
      await this.expiredTokensRepo.addTokenToDb(
        sessions[i].refreshTokenMeta,
        new mongoose.Types.ObjectId(userId),
      );
    }
    await this.devicesRepo.killAllSessionsForUser(userId);
    return;
  }
}
