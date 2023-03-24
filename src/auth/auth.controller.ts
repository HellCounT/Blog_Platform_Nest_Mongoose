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
  Req,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Request, Response } from 'express';
import { DevicesService } from '../security/devices/devices.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/get-decorators/current-user-id.param.decorator';
import { UsersQuery } from '../users/users.query';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from './decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from './auth.types';
import { ThrottlerGuard } from '@nestjs/throttler';
import { InputLoginUserDto } from './dto/input.login.dto';
import { InputNewPasswordDto } from './dto/input.newpassword.dto';
import { InputRegistrationUserDto } from './dto/input.registration.user.dto';
import { InputEmailPasswordRecoveryDto } from './dto/input.email.passwordrecovery.dto';
import { InputConfirmationCodeDto } from './dto/input.confirmationcode.dto';
import { InputEmailDto } from './dto/input.email.dto';
import { OutputUserMeDto } from './dto/output.user.me.dto';
import { OutputAccessTokenDto } from './dto/output.token.dto';

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
  //@UseGuards(ThrottlerGuard)
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() userLoginDto: InputLoginUserDto,
    @Ip() ip: string,
    @Headers('user-agent') deviceName: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<OutputAccessTokenDto> {
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
    @Req() request: Request,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<OutputAccessTokenDto> {
    const user = await this.usersQueryRepo.findUserById(
      payload.userId.toString(),
    );
    if (!user) throw new UnauthorizedException();
    await this.devicesService.banRefreshToken(
      request.cookies.refreshToken,
      user._id,
    );
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
  //@UseGuards(ThrottlerGuard)
  @Post('registration')
  @HttpCode(204)
  async registerUser(@Body() userCreateDto: InputRegistrationUserDto) {
    return await this.usersService.registerUser(userCreateDto);
  }
  //@UseGuards(ThrottlerGuard)
  @Post('registration-confirmation')
  @HttpCode(204)
  async confirmUserEmail(
    @Body() confirmationCodeDto: InputConfirmationCodeDto,
  ) {
    return await this.usersService.confirmUserEmail(confirmationCodeDto.code);
  }
  //@UseGuards(ThrottlerGuard)
  @Post('registration-email-resending')
  @HttpCode(204)
  async resendActivationCode(@Body() emailDto: InputEmailDto) {
    return await this.usersService.resendActivationCode(emailDto.email);
  }
  //@UseGuards(ThrottlerGuard)
  @Post('password-recovery')
  @HttpCode(204)
  async passwordRecovery(
    @Body() passwordRecoveryDto: InputEmailPasswordRecoveryDto,
  ) {
    return await this.usersService.sendPasswordRecoveryCode(
      passwordRecoveryDto.email,
    );
  }
  //@UseGuards(ThrottlerGuard)
  @Post('new-password')
  @HttpCode(204)
  async setNewPassword(@Body() newPasswordDto: InputNewPasswordDto) {
    return await this.usersService.updatePasswordByRecoveryCode(newPasswordDto);
  }
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('me')
  async me(@Req() req): Promise<OutputUserMeDto> {
    const user = await this.usersQueryRepo.findUserById(req.user.userId);
    if (!user) throw new UnauthorizedException();
    return {
      email: user.accountData.email,
      login: user.accountData.login,
      userId: user._id.toString(),
    };
  }
}
