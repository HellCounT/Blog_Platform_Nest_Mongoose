import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import bcrypt from 'bcrypt';
import {
  CreateUserInputModelType,
  UserDb,
  UserViewModelType,
} from './users.types';
import { emailManager } from '../email/email-manager';

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

  async registerUser(
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
        confirmationCode: uuidv4(),
        expirationDate: add(currentDate, { hours: 1 }).toISOString(),
        isConfirmed: false,
      },
      {
        recoveryCode: undefined,
        expirationDate: undefined,
      },
    );
    const createUserResult = await this.usersRepo.createUser(newUser);
    try {
      await emailManager.sendEmailRegistrationCode(
        newUser.accountData.email,
        newUser.emailConfirmationData.confirmationCode,
      );
    } catch (error) {
      console.error(error);
      await this.usersRepo.deleteUser(createUserResult.id);
      return null;
    }
    return createUserResult;
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDb | null> {
    const foundUser = await this.usersRepo.findByLoginOrEmail(loginOrEmail);
    if (!foundUser) return null;
    if (!foundUser.emailConfirmationData.isConfirmed) return null;
    else {
      if (await bcrypt.compare(password, foundUser.accountData.hash))
        return foundUser;
      else return null;
    }
  }

  async confirmUserEmail(code: string): Promise<boolean> {
    const foundUser = await this.usersRepo.findByConfirmationCode(code);
    if (!foundUser) return false;
    if (foundUser.emailConfirmationData.isConfirmed) return false;
    if (foundUser.emailConfirmationData.confirmationCode !== code) return false;
    if (new Date(foundUser.emailConfirmationData.expirationDate) < new Date())
      return false;
    return await this.usersRepo.confirmationSetUser(foundUser._id.toString());
  }

  async resendActivationCode(email: string): Promise<boolean> {
    const foundUser = await this.usersRepo.findByLoginOrEmail(email);
    if (!foundUser) return false;
    if (foundUser.emailConfirmationData.isConfirmed) return false;
    const newCode = uuidv4();
    await this.usersRepo.updateConfirmationCode(foundUser._id, newCode);
    try {
      await emailManager.resendEmailRegistrationCode(
        foundUser.accountData.email,
        newCode,
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async sendPasswordRecoveryCode(email: string) {
    const newCode = uuidv4();
    const foundUser = await this.usersRepo.findByLoginOrEmail(email);
    if (foundUser) {
      await this.usersRepo.updateRecoveryCode(foundUser._id, newCode);
    }
    try {
      await emailManager.sendRecoveryCode(email, newCode);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async updatePasswordByRecoveryCode(
    recoveryCode: string,
    newPassword: string,
  ) {
    const foundUser = await this.usersRepo.findByRecoveryCode(recoveryCode);
    if (!foundUser) return false;
    else {
      const newPasswordHash = await this._generateHash(newPassword);
      await this.usersRepo.updateHashByRecoveryCode(
        foundUser._id,
        newPasswordHash,
      );
      return true;
    }
  }

  async _generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}
