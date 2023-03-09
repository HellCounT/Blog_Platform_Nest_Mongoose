import { Injectable } from '@nestjs/common';
import { UserQueryParser } from '../application/query.parser';
import { UserDb, UserPaginatorType, UserViewModelType } from './users.types';

@Injectable()
export class UsersQuery {
  async viewAllUsers(q: UserQueryParser): Promise<UserPaginatorType> {
    let loginFilter = '';
    let emailFilter = '';
    if (q.searchLoginTerm) loginFilter = '.*' + q.searchLoginTerm + '.*';
    if (q.searchEmailTerm) emailFilter = '.*' + q.searchEmailTerm + '.*';
    const allUsersCount = await UserModel.countDocuments({
      $or: [
        { login: { $regex: loginFilter, $options: 'i' } },
        { email: { $regex: emailFilter, $options: 'i' } },
      ],
    });
    const reqPageDbUsers = await UserModel.find({
      $or: [
        { 'accountData.login': { $regex: loginFilter, $options: 'i' } },
        { 'accountData.email': { $regex: emailFilter, $options: 'i' } },
      ],
    })
      .sort({ [q.sortBy]: q.sortDirection })
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
  _mapUserToViewType(user: UserDb): UserViewModelType {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
}
