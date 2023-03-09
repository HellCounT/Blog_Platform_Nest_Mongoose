import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import mongoose from 'mongoose';
import { UserDb, UserViewModelType } from './users.types';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(protected usersRepo: UsersRepository) {}
  async createUser(
    login: string,
    password: string,
    email: string,
  ): Promise<UserViewModelType | null> {
    const passwordHash = await this._generateHash(password);
    const currentDate = new Date();
    const newUser = new UserDb(
      new mongoose.Types.ObjectId(),
      {
        login: login,
        email: email,
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
    return await this.usersRepo.deleteUser(id);
  }
  async _generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
