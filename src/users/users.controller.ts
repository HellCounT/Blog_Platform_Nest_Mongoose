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
import { UsersQuery } from './users.query';
import { InputCreateUserDto } from './dto/input.create-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    protected usersService: UsersService,
    protected readonly usersQueryRepo: UsersQuery,
  ) {}
  @Get()
  async getAllUsers(@Query() query: UserQueryParser) {
    const queryParams: UserQueryParser = parseUserQueryPagination(query);
    console.log(queryParams);
    return this.usersQueryRepo.viewAllUsers(queryParams);
  }
  @Post()
  async createUser(@Body() userCreateDto: InputCreateUserDto) {
    return await this.usersService.createUser(userCreateDto);
  }
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
}
