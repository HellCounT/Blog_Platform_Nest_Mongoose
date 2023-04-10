import { InputCreateUserDto } from '../dto/input.create-user.dto';
import { UsersRepository } from '../../../users/users.repository';
import { UserDb, UserViewModelType } from '../../../users/users.types';
import mongoose from 'mongoose';
import { UsersService } from '../../../users/users.service';
import { CommandHandler } from '@nestjs/cqrs';

export class CreateUserCommand {
  constructor(public userCreateDto: InputCreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    protected usersRepo: UsersRepository,
    protected usersService: UsersService,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewModelType | null> {
    const passwordHash = await this.usersService._generateHash(
      command.userCreateDto.password,
    );
    const currentDate = new Date();
    const newUser = new UserDb(
      new mongoose.Types.ObjectId(),
      {
        login: command.userCreateDto.login,
        email: command.userCreateDto.email,
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
}
