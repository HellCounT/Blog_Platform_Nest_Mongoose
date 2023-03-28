import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDb } from '../users/users.types';
import { RefreshTokenResult, TokenPayloadType } from './auth.types';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ConfigurationType } from '../configuration/configuration';

@Injectable()
export class JwtAdapter {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<ConfigurationType>,
  ) {}
  createJwt(user: UserDb): string {
    return this.jwtService.sign(
      { userId: user._id },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_LIFETIME') + 's',
      },
    );
  }
  createRefreshJwt(user: UserDb): RefreshTokenResult {
    const deviceId = new mongoose.Types.ObjectId();
    const issueDate = new Date();
    const expDateSec =
      Math.floor(issueDate.getTime() / 1000) +
      this.configService.get('JWT_REFRESH_LIFETIME');
    const expDate = new Date(expDateSec * 1000);
    const refreshToken = this.jwtService.sign(
      {
        userId: user._id,
        deviceId: deviceId.toString(),
        exp: expDateSec,
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
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
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      return true;
    } catch {
      return false;
    }
  }
  parseTokenPayload(token: string): TokenPayloadType {
    return this.jwtService.decode(token) as TokenPayloadType;
  }
}
