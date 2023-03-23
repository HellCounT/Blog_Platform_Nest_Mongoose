import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { UsersRepository } from '../../../users/users.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueEmailConstraint implements ValidatorConstraintInterface {
  constructor(private readonly usersRepo: UsersRepository) {}

  async validate(email: string) {
    return !(await this.usersRepo.findByLoginOrEmail(email));
  }
  defaultMessage() {
    return `email is already exist`;
  }
}

export function IsUniqueEmail(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUniqueEmailConstraint,
    });
  };
}
