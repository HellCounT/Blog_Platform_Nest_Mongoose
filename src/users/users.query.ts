import { Injectable } from '@nestjs/common';
import { UserQueryParser } from '../application/query.parser';
import { UserDb, UserPaginatorType, UserViewModelType } from './users.types';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class UsersQuery {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async viewAllUsers(q: UserQueryParser): Promise<UserPaginatorType> {
    let loginFilter = '';
    let emailFilter = '';
    if (q.searchLoginTerm) loginFilter = '.*' + q.searchLoginTerm + '.*';
    if (q.searchEmailTerm) emailFilter = '.*' + q.searchEmailTerm + '.*';
    const allUsersCount = await this.userModel.countDocuments({
      $or: [
        { 'accountData.login': { $regex: loginFilter, $options: 'i' } },
        { 'accountData.email': { $regex: emailFilter, $options: 'i' } },
      ],
    });
    const reqPageDbUsers = await this.userModel
      .find({
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
  async findUserById(userId: string): Promise<UserDb> {
    return this.userModel.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    });
  }
  _mapUserToViewType(user: UserDocument): UserViewModelType {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
}
