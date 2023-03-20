import mongoose from 'mongoose';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserInputModelType {
  @Length(3, 10, { message: 'Incorrect login length' })
  @Matches(/^[a-zA-Z0-9_-]*$/, { message: 'Incorrect login pattern' })
  login: string;
  @Length(6, 20, { message: 'Incorrect password length' })
  password: string;
  @IsEmail({}, { message: 'Value is not a Email' })
  email: string;
}

export class UserLoginInputModelType {
  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'login or email has not been provided' })
  loginOrEmail: string;
  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'password has not been provided' })
  password: string;
}

export class UserNewPasswordInputModelType {
  @IsString({ message: 'invalid format' })
  @IsNotEmpty({ message: 'recovery code has not been provided' })
  recoveryCode: string;
  @Length(6, 20, { message: 'Incorrect password length' })
  newPassword: string;
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
