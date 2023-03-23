import {
  Body,
  Controller,
  Ip,
  Post,
  Headers,
  Res,
  HttpCode,
  UseGuards,
  UnauthorizedException,
  Get,
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
import { CurrentUser } from './decorators/current-user-id.param.decorator';
import { UsersQuery } from '../users/users.query';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from './decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from './auth.types';
import { ThrottlerGuard } from '@nestjs/throttler';

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
    protected usersQueryRepo: UsersQuery,
  ) {}
  @UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() userLoginDto: UserLoginInputModelType,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const checkResult = await this.authService.validateUser(
      userLoginDto.loginOrEmail,
      userLoginDto.password,
    );
    if (!checkResult) throw new UnauthorizedException();
    const tokenPair = this.authService.getTokenPair(checkResult);
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
  @UseGuards(RefreshJwtGuard)
  @Post('logout')
  @HttpCode(204)
  async logout(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.devicesService.logoutSession(payload.deviceId);
    response.clearCookie('refreshToken');
    return;
  }
  @UseGuards(RefreshJwtGuard)
  @Post('refresh-token')
  @HttpCode(200)
  async updateRefreshToken(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.usersQueryRepo.findUserById(
      payload.userId.toString(),
    );
    if (!user) throw new UnauthorizedException();
    const tokenPair = this.authService.getTokenPair(user);
    await this.devicesService.updateSessionWithDeviceId(
      tokenPair.refreshTokenMeta.refreshToken,
      payload.deviceId,
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
  @UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() userCreateDto: CreateUserInputModelType) {
    return await this.usersService.registerUser(userCreateDto);
  }
  @UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmUserEmail(@Body('code') code: string) {
    return await this.usersService.confirmUserEmail(code);
  }
  @UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendActivationCode(@Body('email') email: string) {
    return await this.usersService.resendActivationCode(email);
  }
  @UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(@Body('email') email: string) {
    return await this.usersService.sendPasswordRecoveryCode(email);
  }
  @UseGuards(ThrottlerGuard)
  @Post('new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: UserNewPasswordInputModelType) {
    return await this.usersService.updatePasswordByRecoveryCode(newPasswordDto);
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Get('me')
  async me(@CurrentUser() userId: string) {
    return await this.usersQueryRepo.findUserById(userId);
  }
}
