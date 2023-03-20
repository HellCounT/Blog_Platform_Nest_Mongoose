import {
  Body,
  Controller,
  Ip,
  Post,
  Headers,
  UnauthorizedException,
  Res,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import {
  CreateUserInputModelType,
  UserLoginInputModelType,
  UserNewPasswordInputModelType,
} from '../users/users.types';
import { Response } from 'express';
import { DevicesService } from '../devices/devices.service';

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
};

@Controller('auth')
export class AuthController {
  constructor(
    protected usersService: UsersService,
    protected devicesService: DevicesService,
  ) {}
  @Post('/login')
  async login(
    @Body() userLoginDto: UserLoginInputModelType,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const checkResult = await this.usersService.checkCredentials;
    if (!checkResult) throw new UnauthorizedException();
    const accessToken = { accessToken: 'temporary token' }; // !!!!!!!!!!!!!
    const newRefreshToken = 'temporary token'; // !!!!!!!!!!!!!
    await this.devicesService.startNewSession(
      newRefreshToken.refreshToken,
      newRefreshToken.userId,
      newRefreshToken.deviceId,
      deviceName,
      ip,
      newRefreshToken.issueDate,
      newRefreshToken.expDate,
    );
    response.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);
    return accessToken;
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
