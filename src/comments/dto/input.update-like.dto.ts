import { IsNotEmpty, IsString } from 'class-validator';
import { Trim } from '../../auth/decorators/validation-decorators/trim.decorator';
import { IsLike } from '../../likes/decorators/is-like.decorator';
import { LikeStatus } from '../../likes/likes.types';

export class InputUpdateLikeDto {
  @IsLike()
  @IsString()
  @IsNotEmpty()
  @Trim()
  likeStatus: LikeStatus;
}
