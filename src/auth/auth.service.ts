import {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    Injectable,
    ConflictException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { UserRepo } from 'src/user/user.repo';
import { generateRandomUserAvatar } from '../helpers/utils';
import { SignInDto, SignUpDto } from './dto';

@Injectable({})
export class AuthService {
    constructor(private repo: UserRepo, private config: ConfigService) {}
    async signUp(userData: SignUpDto) {
        userData.imageUrl = !userData.imageUrl
            ? generateRandomUserAvatar()
            : userData.imageUrl;
        try {
            const users = await this.repo.getUserByEmailOrName({
                email: userData.email,
                name: userData.name,
            });
            if (users) {
                throw new ConflictException(
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
        const { error } = Joi.string().email().required().validate(login.email);
        let queryBody = {};
        if (!error) {
            queryBody = {
                email: login.email,
            };
        } else {
            queryBody = {
                name: login.email,
            };
        }
        try {
            const user = await this.repo.getUserByEmailOrName(queryBody);
            if (!user) {
                throw new NotFoundException('Email ou username não existe');
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
