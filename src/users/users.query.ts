import { Injectable } from '@nestjs/common';
import { UserQueryParser } from '../application/query.parser';
import { UserDb, UserPaginatorType, UserViewModelType } from './users.types';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import mongoose, { Model } from 'mongoose';
import { Device, DeviceDocument } from '../security/devices/devices.schema';
import { OutputDeviceDto } from '../security/devices/dto/output.device.dto';

@Injectable()
export class UsersQuery {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
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
  async getAllSessionsForCurrentUser(
    userId: mongoose.Types.ObjectId,
  ): Promise<Array<OutputDeviceDto>> {
    const sessions: Array<DeviceDocument> = await this.deviceModel
      .find({ userId: { $eq: userId } })
      .lean();
    return sessions.map((e) => this._mapDevicesToViewType(e));
  }
  async findSessionByDeviceId(
    deviceId: mongoose.Types.ObjectId,
  ): Promise<DeviceDocument> {
    return this.deviceModel.findOne({ _id: deviceId });
  }
  private _mapUserToViewType(user: UserDocument): UserViewModelType {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  }
  private _mapDevicesToViewType(device: DeviceDocument): OutputDeviceDto {
    return {
      deviceId: device._id.toString(),
      ip: device.ip,
      title: device.deviceName,
      lastActiveDate: device.issuedAt.toISOString(),
    };
  }
}
