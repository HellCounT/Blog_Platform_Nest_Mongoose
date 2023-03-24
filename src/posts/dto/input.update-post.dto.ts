import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { BlogExists } from '../../blogs/decorators/validation-decorators/blog-exists.decorator';
import { Trim } from '../../auth/decorators/validation-decorators/trim.decorator';

export class InputUpdatePostDto {
  @IsOptional()
  @IsString({ message: 'Invalid format' })
  @Trim()
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @IsOptional()
  @IsString({ message: 'Invalid format' })
  @Trim()
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @IsOptional()
  @IsString({ message: 'Invalid format' })
  @Trim()
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
  @IsMongoId({ message: 'Invalid id pattern' })
  @BlogExists({ message: 'Blog does not exist' })
  @IsString({ message: 'Invalid format' })
  @IsNotEmpty({ message: 'Field is not provided' })
  @Trim()
  blogId: string;
}
