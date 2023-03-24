import { IsOptional, IsUrl, Length, MaxLength } from 'class-validator';

export class InputUpdateBlogDto {
  @IsOptional()
  @Length(1, 15, { message: 'Incorrect name length' })
  name: string;
  @IsOptional()
  @Length(1, 500, { message: 'Incorrect description length' })
  description: string;
  @IsOptional()
  @IsUrl({}, { message: 'Value is not an URL' })
  @MaxLength(100, { message: 'Max URL length exceeded' })
  websiteUrl: string;
}
