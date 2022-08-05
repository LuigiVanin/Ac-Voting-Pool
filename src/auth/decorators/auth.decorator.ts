import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import { AuthUser } from 'src/interfaces/user';

export const GetUser = createParamDecorator(
    (_: unknown, request: ExecutionContext): AuthUser => {
        const { user } = request.switchToHttp().getRequest();
        if (!user) {
            throw new BadRequestException();
        }
        delete user.password;
        return user as AuthUser;
    },
);
