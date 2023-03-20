import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ExpiredToken, ExpiredTokenDocument } from './expiredTokenSchema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class ExpiredTokensRepository {
  constructor(
    @InjectModel(ExpiredToken.name)
    private expiredTokenModel: Model<ExpiredTokenDocument>,
  ) {}
  async addTokenToDb(token: string, userId: mongoose.Types.ObjectId) {
    const expiredToken: ExpiredToken = {
      userId: userId,
      refreshToken: token,
    };
    const expiredTokenInstance = new this.expiredTokenModel(expiredToken);
    await expiredTokenInstance.save();
    return;
  }
  async findToken(token: string): Promise<ExpiredToken | null> {
    return this.expiredTokenModel.findOne({ refreshToken: token });
  }
}
