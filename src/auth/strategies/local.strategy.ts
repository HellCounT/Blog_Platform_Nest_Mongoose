import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { Strategy } from 'passport-local';
import { UserDb } from '../../users/users.types';

export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserDb> {
    const user = await this.authService.validateUser(loginOrEmail, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
