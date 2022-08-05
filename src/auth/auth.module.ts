import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepo } from 'src/user/user.repo';

@Module({
    providers: [AuthService, UserRepo],
    controllers: [AuthController],
})
export class AuthModule {}
