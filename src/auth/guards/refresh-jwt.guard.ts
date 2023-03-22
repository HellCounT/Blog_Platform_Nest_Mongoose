import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DevicesRepository } from '../../security/devices/devices.repository';
import mongoose from 'mongoose';
import { JwtAdapter } from '../jwt.adapter';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private readonly devicesRepo: DevicesRepository,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    const payload = await this._authCheckerPayloadParser(refreshToken);
    if (!payload) throw new UnauthorizedException();
    request.payload = payload;
    return true;
  }
  private async _authCheckerPayloadParser(refreshToken: string): Promise<any> {
    if (!this.jwtAdapter.checkRefreshTokenExpiration(refreshToken)) return null;
    const payload = this.jwtAdapter.parseTokenPayload(refreshToken);
    if (!(await this._isActiveSession(payload.deviceId))) return null;
    return payload;
  }
  private async _isActiveSession(deviceId: string): Promise<boolean> {
    return !!(await this.devicesRepo.findSessionByDeviceId(
      new mongoose.Types.ObjectId(deviceId),
    ));
  }
}
