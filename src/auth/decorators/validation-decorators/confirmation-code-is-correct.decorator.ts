import { BadRequestException, Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../../users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class EmailConfirmationCodeIsCorrectConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(emailConfirmationCode: string) {
    const foundUser = await this.usersRepo.findByConfirmationCode(
      emailConfirmationCode,
    );
    if (!foundUser) {
      throw new BadRequestException();
    }
    if (
      foundUser.emailConfirmationData.confirmationCode !== emailConfirmationCode
    ) {
      throw new BadRequestException();
    }
    if (foundUser.emailConfirmationData.isConfirmed) {
      throw new BadRequestException();
    }
    if (new Date(foundUser.emailConfirmationData.expirationDate) < new Date()) {
      throw new BadRequestException();
    }
    return true;
  }
}

export function EmailConfirmationCodeIsCorrect(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailConfirmationCodeIsCorrectConstraint,
    });
  };
}
