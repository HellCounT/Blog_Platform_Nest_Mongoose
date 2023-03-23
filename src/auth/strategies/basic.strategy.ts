import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { settings } from '../../settings';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (username, password): Promise<boolean> => {
    const adminLogin = settings.BASIC_AUTH_LOGIN;
    const adminPassword = settings.BASIC_AUTH_PASSWORD;
    if (adminLogin !== username && adminPassword !== password) {
      throw new UnauthorizedException();
    }
    return true;
  };
}
