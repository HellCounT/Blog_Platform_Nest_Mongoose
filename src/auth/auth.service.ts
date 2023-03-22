import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UserDb } from '../users/users.types';
import bcrypt from 'bcrypt';
import { TokenPairType } from './auth.types';
import { JwtAdapter } from './jwt.adapter';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtAdapter: JwtAdapter,
  ) {}
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDb | null> {
    const foundUser = await this.usersService.findByLoginOrEmail(loginOrEmail);
    if (!foundUser) return null;
    if (!foundUser.emailConfirmationData.isConfirmed) return null;
    else {
      if (await bcrypt.compare(password, foundUser.accountData.hash))
        return foundUser;
      else return null;
    }
  }
  login(user: UserDb): TokenPairType {
    return {
      accessToken: this.jwtAdapter.createJwt(user),
      refreshTokenMeta: this.jwtAdapter.createRefreshJwt(user),
    };
  }
}
