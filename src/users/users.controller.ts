import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  parseUserQueryPagination,
  UserQueryParser,
} from '../application/query.parser';
import { CreateUserInputModelType } from './users.types';
import { UsersQuery } from './users.query';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected readonly usersQueryRepo: UsersQuery,
  ) {}
  @Get()
  async getAllUsers(@Query() query: UserQueryParser) {
    const queryParams: UserQueryParser = parseUserQueryPagination(query);
    return this.usersQueryRepo.viewAllUsers(queryParams);
  }
  @Post()
  async createUser(@Body() input: CreateUserInputModelType) {
    return await this.usersService.createUser(
      input.login,
      input.password,
      input.email,
    );
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
