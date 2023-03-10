import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import mongoose from 'mongoose';
import {
  CreateUserInputModelType,
  UserDb,
  UserViewModelType,
} from './users.types';

@Injectable()
export class UsersService {
  constructor(protected usersRepo: UsersRepository) {}
  async createUser(
    userCreateDto: CreateUserInputModelType,
  ): Promise<UserViewModelType | null> {
    const passwordHash = await this._generateHash(userCreateDto.password);
    const currentDate = new Date();
    const newUser = new UserDb(
      new mongoose.Types.ObjectId(),
      {
        login: userCreateDto.login,
        email: userCreateDto.email,
        hash: passwordHash,
        createdAt: currentDate.toISOString(),
      },
      {
        confirmationCode: 'User Created by SuperAdmin',
        expirationDate: 'User Created by SuperAdmin',
        isConfirmed: true,
      },
      {
        recoveryCode: undefined,
        expirationDate: undefined,
      },
    );
    return await this.usersRepo.createUser(newUser);
  }
  async deleteUser(id: string) {
    const deleteResult = await this.usersRepo.deleteUser(id);
    if (!deleteResult) {
      throw new NotFoundException();
    } else return;
  }
  async _generateHash(password: string): Promise<string> {
    //const salt = await bcrypt.genSalt(10);
    //return await bcrypt.hash(password, salt);
    return `test hash for ${password}`;
  }
}
