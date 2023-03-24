import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import bcrypt from 'bcrypt';
import { UserDb, UserViewModelType } from './users.types';
import { emailManager } from '../email/email-manager';
import { InputNewPasswordDto } from '../auth/dto/input.newpassword.dto';
import { InputCreateUserDto } from './dto/input.create-user.dto';

@Injectable()
export class UsersService {
  constructor(protected usersRepo: UsersRepository) {}
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDb> {
    return await this.usersRepo.findByLoginOrEmail(loginOrEmail);
  }
  async createUser(
    userCreateDto: InputCreateUserDto,
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
    userCreateDto: InputCreateUserDto,
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
      throw new ServiceUnavailableException();
    }
    return createUserResult;
  }

  async confirmUserEmail(code: string): Promise<boolean> {
    const foundUser = await this.usersRepo.findByConfirmationCode(code);
    if (!foundUser) new BadRequestException();
    if (
      foundUser.emailConfirmationData.isConfirmed ||
      foundUser.emailConfirmationData.confirmationCode !== code ||
      new Date(foundUser.emailConfirmationData.expirationDate) < new Date()
    )
      throw new BadRequestException();
    return await this.usersRepo.confirmationSetUser(foundUser._id.toString());
  }

  async resendActivationCode(email: string): Promise<boolean> {
    const foundUser = await this.usersRepo.findByLoginOrEmail(email);
    if (!foundUser || foundUser.emailConfirmationData.isConfirmed)
      throw new BadRequestException();
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
      throw new ServiceUnavailableException();
    }
  }

  async sendPasswordRecoveryCode(email: string) {
    const newCode = uuidv4();
    const foundUser = await this.usersRepo.findByLoginOrEmail(email);
    if (!foundUser) throw new BadRequestException();
    await this.usersRepo.updateRecoveryCode(foundUser._id, newCode);
    try {
      await emailManager.sendRecoveryCode(email, newCode);
      return true;
    } catch (error) {
      console.error(error);
      throw new ServiceUnavailableException();
    }
  }

  async updatePasswordByRecoveryCode(newPasswordDto: InputNewPasswordDto) {
    const foundUser = await this.usersRepo.findByRecoveryCode(
      newPasswordDto.recoveryCode,
    );
    if (!foundUser)
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Incorrect recovery code',
            field: 'recoveryCode',
          },
        ],
      });
    else {
      const newPasswordHash = await this._generateHash(
        newPasswordDto.newPassword,
      );
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
