import { CanActivate, ExecutionContext } from '@nestjs/common';
import { DevicesRepository } from '../../security/devices/devices.repository';
import { JwtAdapter } from '../jwt.adapter';
import { TokenPayloadType } from '../auth.types';
import mongoose from 'mongoose';

export class GuestGuard implements CanActivate {
  constructor(
    private readonly devicesRepo: DevicesRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken) return true;
    request.payload = await this._authCheckerPayloadParser(refreshToken);
    return true;
  }
  private async _authCheckerPayloadParser(
    refreshToken: string,
  ): Promise<TokenPayloadType> {
    if (!this.jwtAdapter.checkRefreshTokenExpiration(refreshToken)) return null;
    const payload = this.jwtAdapter.parseTokenPayload(refreshToken);
    if (
      !(await this.devicesRepo.findSessionByDeviceId(
        new mongoose.Types.ObjectId(payload.deviceId),
      ))
    )
      return null;
    return payload;
  }
}
