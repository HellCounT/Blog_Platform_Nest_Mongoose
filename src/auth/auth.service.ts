import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDb } from '../users/users.types';
import bcrypt from 'bcrypt';
import { settings } from '../settings';
import mongoose from 'mongoose';
import { RefreshTokenResult, TokenPairType } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDb | null> {
    const foundUser = await this.usersService.findByLoginOrEmail(loginOrEmail);
    if (!foundUser) return null;
    if (!foundUser.emailConfirmationData.isConfirmed) return null;
    else {
      if (await bcrypt.compare(password, foundUser.accountData.hash))
        return foundUser;
      else return null;
    }
  }
  login(user: UserDb): TokenPairType {
    return {
      accessToken: this.createJwt(user),
      refreshTokenMeta: this.createRefreshJwt(user),
    };
  }
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
}
