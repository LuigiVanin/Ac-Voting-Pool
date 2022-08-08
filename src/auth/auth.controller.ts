import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    async signUp(@Body() userData: SignUpDto) {
        return await this.authService.signUp(userData);
    }

    @Post('signin')
    async signIn(@Body() login: SignInDto) {
        return await this.authService.signIn(login);
    }
}
