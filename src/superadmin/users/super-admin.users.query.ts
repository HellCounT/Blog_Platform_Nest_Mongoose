import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../users/entity/users.schema';
import { Model } from 'mongoose';
import { BanStatus, UserQueryParser } from '../../application/query.parser';
import { UserPaginatorType } from '../../users/types/users.types';
import { OutputSuperAdminUserDto } from './dto/output.super-admin.user.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SuperAdminUsersQuery {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async viewAllUsers(q: UserQueryParser): Promise<UserPaginatorType> {
    let loginFilter = '';
    let emailFilter = '';
    if (q.searchLoginTerm) loginFilter = '.*' + q.searchLoginTerm + '.*';
    if (q.searchEmailTerm) emailFilter = '.*' + q.searchEmailTerm + '.*';
    let banFilter: any = '';
    if (q.banStatus === BanStatus.all) banFilter = {};
    if (q.banStatus === BanStatus.notBanned)
      banFilter = { 'banInfo.isBanned': false };
    if (q.banStatus === BanStatus.banned)
      banFilter = { 'banInfo.isBanned': true };
    const allUsersCount = await this.userModel.countDocuments({
      ...banFilter,
      $or: [
        { 'accountData.login': { $regex: loginFilter, $options: 'i' } },
        { 'accountData.email': { $regex: emailFilter, $options: 'i' } },
      ],
    });
    const reqPageDbUsers = await this.userModel
      .find({
        ...banFilter,
        $or: [
          { 'accountData.login': { $regex: loginFilter, $options: 'i' } },
          { 'accountData.email': { $regex: emailFilter, $options: 'i' } },
        ],
      })
      .sort({ ['accountData.' + q.sortBy]: q.sortDirection })
      .skip((q.pageNumber - 1) * q.pageSize)
      .limit(q.pageSize)
      .lean();
    const pageUsers = reqPageDbUsers.map((u) => this._mapUserToViewType(u));
    return {
      pagesCount: Math.ceil(allUsersCount / q.pageSize),
      page: q.pageNumber,
      pageSize: q.pageSize,
      totalCount: allUsersCount,
      items: pageUsers,
    };
  }
  private _mapUserToViewType(user: UserDocument): OutputSuperAdminUserDto {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        isBanned: user.globalBanInfo.isBanned,
        banDate: user.globalBanInfo.banDate.toISOString(),
        banReason: user.globalBanInfo.banReason,
      },
    };
  }
}
