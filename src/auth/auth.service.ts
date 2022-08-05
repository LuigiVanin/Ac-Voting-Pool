import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as bcrypt from 'bcrypt';
import { UserRepo } from 'src/user/user.repo';
import { SignInDto, SignUpDto } from './dto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
    constructor(private repo: UserRepo, private config: ConfigService) {}
    async signUp(userData: SignUpDto) {
        try {
            const users = await this.repo.getUserByEmailOrName({
                email: userData.email,
                name: userData.name,
            });
            console.log(users);
            if (users) {
                throw new BadRequestException(
                    'Já existentem usuários com esse nome ou email',
                );
            }
            userData.password = await bcrypt.hash(userData.password, 10);
            return await this.repo.createUser(userData);
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new BadRequestException();
            } else {
                throw err;
            }
        }
    }

    async signIn(login: SignInDto) {
        try {
            const user = await this.repo.getUserByEmailOrName({
                email: login.email,
            });
            console.log(user);
            if (!user) {
                throw new NotFoundException('Email não existe');
            }
            if (!(await bcrypt.compare(login.password, user.password))) {
                throw new ForbiddenException('Senha incorreta');
            }
            const payload = {
                email: user.email,
                name: user.name,
                id: user.id,
            };
            return { token: jwt.sign(payload, this.config.get('JWT_SECRET')) };
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new BadRequestException();
            } else {
                throw err;
            }
        }
    }
}
