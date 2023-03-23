import mongoose from 'mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Trim } from '../auth/decorators/validation-decorators/trim.decorator';
import { IsNewLogin } from '../auth/decorators/validation-decorators/is-new-login.decorator';
import { IsUniqueEmail } from '../auth/decorators/validation-decorators/is-unique-email.decorator';

export class CreateUserInputModelType {
  @IsNewLogin({ message: 'Login is not valid' })
  @Matches(/^[a-zA-Z0-9_-]*$/, { message: 'Incorrect login pattern' })
  @Length(3, 10, { message: 'Incorrect login length' })
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Login is not provided' })
  @Trim()
  login: string;

  @Length(6, 20)
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Password is not provided' })
  @Trim()
  password: string;

  @IsUniqueEmail({ message: 'Email is not valid' })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Email is not provided' })
  @Trim()
  email: string;
}

export type UserViewModelType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};

export type UserPaginatorType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserViewModelType[];
};

export class UserDb {
  constructor(
    public _id: mongoose.Types.ObjectId,
    public accountData: {
      login: string;
      email: string;
      hash: string;
      createdAt: string;
    },
    public emailConfirmationData: {
      confirmationCode: string;
      expirationDate: string;
      isConfirmed: boolean;
    },
    public recoveryCodeData: {
      recoveryCode?: string;
      expirationDate?: Date;
    },
  ) {}
}
