import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { DevicesRepository } from '../../security/devices/devices.repository';
import mongoose from 'mongoose';
import { JwtAdapter } from '../jwt.adapter';
import { TokenPayloadType } from '../auth.types';
import { ExpiredTokensRepository } from '../../security/tokens/expired.tokens.repository';

@Injectable()
export class RefreshJwtGuard implements CanActivate {
  constructor(
    private readonly devicesRepo: DevicesRepository,
    private readonly jwtAdapter: JwtAdapter,
    private readonly expiredTokensRepo: ExpiredTokensRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    const payload: TokenPayloadType = await this._authCheckerPayloadParser(
      refreshToken,
    );
    if (!payload) throw new UnauthorizedException();
    if (await this.expiredTokensRepo.findToken(refreshToken))
      throw new UnauthorizedException();
    request.payload = payload;
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
