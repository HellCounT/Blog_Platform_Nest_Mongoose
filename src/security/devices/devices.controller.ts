import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { UsersQuery } from '../../users/users.query';
import { RefreshJwtGuard } from '../../auth/guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from '../../auth/decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from '../../auth/auth.types';
import { OutputDeviceDto } from './dto/output.device.dto';

@Controller('security/devices')
export class DevicesController {
  constructor(
    protected devicesService: DevicesService,
    protected usersQueryRepo: UsersQuery,
  ) {}
  @UseGuards(RefreshJwtGuard)
  @Get()
  @HttpCode(200)
  async getAllSessions(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ): Promise<Array<OutputDeviceDto>> {
    console.log(payload);
    return await this.usersQueryRepo.getAllSessionsForCurrentUser(
      payload.userId,
    );
  }
  @UseGuards(RefreshJwtGuard)
  @Delete()
  @HttpCode(204)
  async deleteAllOtherSessions(
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    return await this.devicesService.deleteAllOtherSessions(
      payload.userId,
      payload.deviceId,
    );
  }
  @UseGuards(RefreshJwtGuard)
  @Delete(':deviceId')
  @HttpCode(204)
  async deleteSession(
    @Param('deviceId') deviceId: string,
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    return await this.devicesService.deleteSession(payload.userId, deviceId);
  }
}
