import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDb } from '../users/users.types';
import { settings } from '../settings';
import { RefreshTokenResult } from './auth.types';
import mongoose from 'mongoose';

@Injectable()
export class JwtAdapter {
  constructor(private readonly jwtService: JwtService) {}
  createJwt(user: UserDb): string {
    return this.jwtService.sign(
      { userId: user._id },
      {
        secret: settings.JWT_SECRET,
        expiresIn: settings.JWT_LIFETIME * 60000,
      },
    );
  }
  createRefreshJwt(user: UserDb): RefreshTokenResult {
    const deviceId = new mongoose.Types.ObjectId();
    const issueDate = new Date();
    const expDateSec =
      Math.floor(issueDate.getTime() / 1000) +
      settings.JWT_REFRESH_LIFETIME * 60;
    const expDate = new Date(expDateSec * 1000);
    const refreshToken = this.jwtService.sign(
      {
        userId: user._id,
        deviceId: deviceId.toString(),
        exp: expDateSec,
      },
      {
        secret: settings.JWT_REFRESH_SECRET,
      },
    );
    return {
      refreshToken: refreshToken,
      userId: user._id,
      deviceId: deviceId,
      issueDate: issueDate,
      expDate: expDate,
    };
  }
  checkRefreshTokenExpiration(token: string): boolean {
    try {
      this.jwtService.verify(token, {
        secret: settings.JWT_REFRESH_SECRET,
      });
      return true;
    } catch {
      return false;
    }
  }
  parseTokenPayload(token: string): any {
    return this.jwtService.decode(token);
  }
}
