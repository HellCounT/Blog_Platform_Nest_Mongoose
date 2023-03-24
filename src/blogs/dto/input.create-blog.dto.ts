import { IsUrl, Length, MaxLength } from 'class-validator';

export class InputBlogCreateDto {
  @Length(1, 15, { message: 'Incorrect name length' })
  name: string;
  @Length(1, 500, { message: 'Incorrect description length' })
  description: string;
  @IsUrl({}, { message: 'Value is not an URL' })
  @MaxLength(100, { message: 'Max URL length exceeded' })
  websiteUrl: string;
}
