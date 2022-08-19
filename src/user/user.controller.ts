import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { AuthUser } from 'src/interfaces/user';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Get('me')
    async getMe(@GetUser() user: AuthUser) {
        return user;
    }

    @Get('')
    async getAll() {
        return await this.userService.getAllUsers();
    }
}
