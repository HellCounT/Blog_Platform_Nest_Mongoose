import { InjectModel } from '@nestjs/mongoose';
import { Device, DeviceDocument } from './devices.schema';
import mongoose, { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DevicesRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async findSessionByDeviceId(
    deviceId: mongoose.Types.ObjectId,
  ): Promise<DeviceDocument> {
    return this.deviceModel.findOne({ _id: deviceId });
  }
  async addSessionToDb(newSession: DeviceDocument): Promise<void> {
    const newSessionInstance = new this.deviceModel(newSession);
    await newSessionInstance.save();
  }
  async updateSessionWithDeviceId(
    newRefreshTokenMeta: string,
    deviceId: string,
    issueDate: Date,
    expDate: Date,
  ): Promise<boolean> {
    const activeSessionInstance = await this.deviceModel.findOne({
      _id: new mongoose.Types.ObjectId(deviceId),
    });
    if (activeSessionInstance) {
      activeSessionInstance.issuedAt = issueDate;
      activeSessionInstance.expirationDate = expDate;
      activeSessionInstance.refreshTokenMeta = newRefreshTokenMeta;
      await activeSessionInstance.save();
      return true;
    } else return false;
  }
  async deleteSessionById(deviceId: mongoose.Types.ObjectId): Promise<boolean> {
    const activeSessionInstance = await this.deviceModel.findOne({
      _id: new mongoose.Types.ObjectId(deviceId),
    });
    if (!activeSessionInstance) return false;
    await activeSessionInstance.deleteOne();
    return true;
  }
  async deleteAllOtherSessions(
    userId: mongoose.Types.ObjectId,
    deviceId: mongoose.Types.ObjectId,
  ): Promise<boolean> {
    const result = await this.deviceModel.deleteMany({
      userId: userId,
      _id: { $ne: deviceId },
    });
    return result.deletedCount >= 1;
  }
}
