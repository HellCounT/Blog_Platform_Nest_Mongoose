import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LikeStatus } from '../likes.types';

@ValidatorConstraint()
export class IsLikeConstraint implements ValidatorConstraintInterface {
  validate(likeInput: LikeStatus) {
    return (
      likeInput === LikeStatus.like ||
      likeInput === LikeStatus.dislike ||
      likeInput === LikeStatus.none
    );
  }
  defaultMessage() {
    return `Incorrect LikeStatus format`;
  }
}

export function IsLike(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLikeConstraint,
    });
  };
}
