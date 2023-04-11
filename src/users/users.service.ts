import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserDocument } from './entity/users.schema';

@Injectable()
export class UsersService {
  constructor(protected usersRepo: UsersRepository) {}
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDocument> {
    return await this.usersRepo.findByLoginOrEmail(loginOrEmail);
  }
}
