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
export class EmailIsNotConfirmedConstraint
  implements ValidatorConstraintInterface
{
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(email: string) {
    const user = await this.usersRepo.findByLoginOrEmail(email);
    if (!user) {
      throw new BadRequestException();
    }
    if (user.emailConfirmationData.isConfirmed) {
      throw new BadRequestException();
    }
    return true;
  }
}

export function EmailIsNotConfirmed(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: EmailIsNotConfirmedConstraint,
    });
  };
}
