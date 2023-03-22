import {
  Body,
  Controller,
  Ip,
  Post,
  Headers,
  Res,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  CreateUserInputModelType,
  UserLoginInputModelType,
  UserNewPasswordInputModelType,
} from '../users/users.types';
import { Response } from 'express';
import { DevicesService } from '../security/devices/devices.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
};

@Controller('auth')
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected devicesService: DevicesService,
    protected authService: AuthService,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(
    @Body() userLoginDto: UserLoginInputModelType,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    // const checkResult = await this.authService.validateUser(userLoginDto);
    // if (!checkResult) throw new UnauthorizedException();
    const tokenPair = this.authService.login(checkResult);
    await this.devicesService.startNewSession(
      tokenPair.refreshTokenMeta.refreshToken,
      tokenPair.refreshTokenMeta.userId,
      tokenPair.refreshTokenMeta.deviceId,
      deviceName,
      ip,
      tokenPair.refreshTokenMeta.issueDate,
      tokenPair.refreshTokenMeta.expDate,
    );
    response.cookie(
      'refreshToken',
      tokenPair.refreshTokenMeta.refreshToken,
      refreshTokenCookieOptions,
    );
    return { accessToken: tokenPair.accessToken };
  }
  @Post('/logout')
  async logout() {
    return;
  }
  @Post('/refresh-token')
  async updateRefreshToken() {
    return;
  }
  @Post('/registration')
  async registerUser(@Body() userCreateDto: CreateUserInputModelType) {
    return await this.usersService.registerUser(userCreateDto);
  }
  @Post('/registration-confirmation')
  @HttpCode(204)
  async confirmUserEmail(@Body('code') code: string) {
    return await this.usersService.confirmUserEmail(code);
  }
  @Post('/registration-email-resending')
  @HttpCode(204)
  async resendActivationCode(@Body('email') email: string) {
    return await this.usersService.resendActivationCode(email);
  }
  @Post('/password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body('email') email: string) {
    return await this.usersService.sendPasswordRecoveryCode(email);
  }
  @Post('/new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: UserNewPasswordInputModelType) {
    return await this.usersService.updatePasswordByRecoveryCode(newPasswordDto);
  }
}
