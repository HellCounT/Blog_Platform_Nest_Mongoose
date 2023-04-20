import { IsMongoId, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Trim } from '../../../auth/decorators/validation-decorators/trim.decorator';

export class InputBanUserForBlogDto {
  @IsNotEmpty()
  isBanned: boolean;

  @MinLength(20)
  @IsString()
  @IsNotEmpty()
  @Trim()
  banReason: string;

  @IsString()
  @IsNotEmpty()
  @Trim()
  @IsMongoId()
  blogId: string;
}
