import { Body, Controller, Post } from '@nestjs/common';
import { SignUpDto } from './dto';

@Controller('auth')
export class AuthController {
    constructor() {}

    @Post('signup')
    signUp(@Body() userData: SignUpDto) {
        return userData;
    }
}
