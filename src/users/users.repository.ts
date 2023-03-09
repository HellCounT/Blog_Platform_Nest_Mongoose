import { Injectable } from '@nestjs/common';
import { UserDb, UserViewModelType } from './users.types';
import mongoose from 'mongoose';

@Injectable()
export class UsersRepository {
  async createUser(newUser: UserDb): Promise<UserViewModelType> {
    const userInstance = new UserModel(newUser);
    const result = await userInstance.save();
    return {
      id: result._id.toString(),
      login: result.accountData.login,
      email: result.accountData.email,
      createdAt: result.accountData.createdAt,
    };
  }
  async deleteUser(id: string): Promise<boolean | null> {
    const userInstance = await UserModel.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    if (!userInstance) return false;
    await userInstance.deleteOne();
    return true;
  }
}
