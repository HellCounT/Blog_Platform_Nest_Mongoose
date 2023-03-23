import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Trim } from '../../auth/decorators/validation-decorators/trim.decorator';

export class InputCommentDto {
  @Length(20, 300)
  @IsString()
  @IsNotEmpty()
  @Trim()
  content: string;
}
