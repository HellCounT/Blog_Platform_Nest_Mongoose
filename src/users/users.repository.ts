import { Injectable } from '@nestjs/common';
import { UserDb, UserViewModelType } from './users.types';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  async createUser(newUser: UserDb): Promise<UserViewModelType> {
    const userInstance = new this.userModel(newUser);
    const result = await userInstance.save();
    return {
      id: result._id.toString(),
      login: result.accountData.login,
      email: result.accountData.email,
      createdAt: result.accountData.createdAt,
    };
  }
  async deleteUser(id: string): Promise<boolean> {
    const deleteResult = await this.userModel.deleteOne({
      _id: new mongoose.Types.ObjectId(id),
    });
    return deleteResult.deletedCount === 1;
  }
}
