import { DevicesRepository } from './devices.repository';
import mongoose from 'mongoose';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceDb } from './devices.types';

@Injectable()
export class DevicesService {
  constructor(protected devicesRepo: DevicesRepository) {}
  async startNewSession(
    refreshToken: string,
    userId: mongoose.Types.ObjectId,
    deviceId: mongoose.Types.ObjectId,
    deviceName: string,
    ip: string,
    issueDate: Date,
    expDate: Date,
  ): Promise<void> {
    const refreshTokenMeta = this._createMeta(refreshToken);
    const newSession = new DeviceDb(
      deviceId,
      userId,
      ip,
      deviceName,
      issueDate,
      expDate,
      refreshTokenMeta,
    );
    await this.devicesRepo.addSessionToDb(newSession);
  }
  async logoutSession(deviceId: string): Promise<void> {
    await this.devicesRepo.deleteSessionById(
      new mongoose.Types.ObjectId(deviceId),
    );
    return;
  }
  async updateSessionWithDeviceId(
    newRefreshToken: string,
    deviceId: string,
    issueDate: Date,
    expDate: Date,
  ) {
    const newRefreshTokenMeta = this._createMeta(newRefreshToken);
    return await this.devicesRepo.updateSessionWithDeviceId(
      newRefreshTokenMeta,
      deviceId,
      issueDate,
      expDate,
    );
  }
  async deleteSession(
    refreshToken: string,
    userId: mongoose.Types.ObjectId,
    deviceId: string,
  ): Promise<boolean> {
    const foundSession = await this.devicesRepo.findSessionByDeviceId(
      new mongoose.Types.ObjectId(deviceId),
    );
    if (!foundSession) throw new NotFoundException();
    if (foundSession.userId.toString() === userId.toString()) {
      await this.devicesRepo.deleteSessionById(
        new mongoose.Types.ObjectId(deviceId),
      );
      return true;
    } else {
      throw new ForbiddenException();
    }
  }
  async deleteAllOtherSessions(
    userId: mongoose.Types.ObjectId,
    deviceId: string,
  ): Promise<boolean> {
    if (deviceId) {
      await this.devicesRepo.deleteAllOtherSessions(
        userId,
        new mongoose.Types.ObjectId(deviceId),
      );
      return true;
    } else throw new UnauthorizedException();
  }
  _createMeta(refreshToken: string): string {
    const header = refreshToken.split('.')[0];
    const payload = refreshToken.split('.')[1];
    return header + '.' + payload;
  }
}
