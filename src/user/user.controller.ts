import { Controller, Get, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { AuthUser } from 'src/interfaces/user';

@Controller('user')
export class UserController {
    @Get('me')
    @UseGuards(JwtGuard)
    async getMe(@GetUser() user: AuthUser) {
        return user;
    }
}
