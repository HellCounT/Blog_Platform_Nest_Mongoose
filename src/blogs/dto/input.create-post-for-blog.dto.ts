import { Length } from 'class-validator';

export class InputCreatePostForBlogDto {
  @Length(1, 30, { message: 'Incorrect title length' })
  title: string;
  @Length(1, 100, { message: 'Incorrect short description length' })
  shortDescription: string;
  @Length(1, 1000, { message: 'Incorrect content length' })
  content: string;
}
