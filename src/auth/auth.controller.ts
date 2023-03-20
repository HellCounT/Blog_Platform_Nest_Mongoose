import { Controller } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
  constructor(protected usersService: UsersService) {}
}
