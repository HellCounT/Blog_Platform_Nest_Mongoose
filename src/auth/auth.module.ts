import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersService } from '../users/users.service';
import { JwtAdapter } from './jwt.adapter';
import { UsersRepository } from '../users/users.repository';
import { EmailManager } from '../email/email-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/users.schema';
import { ConfigService } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { EmailService } from '../email/email.service';
import { UsersQuery } from '../users/users.query';
import { Device, DeviceSchema } from '../security/devices/devices.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    BasicStrategy,
    UsersService,
    JwtAdapter,
    UsersRepository,
    UsersQuery,
    EmailManager,
    EmailService,
    ConfigService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
