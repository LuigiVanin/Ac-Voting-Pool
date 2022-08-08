import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserRepo } from 'src/user/user.repo';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private repo: UserRepo, private config: ConfigService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { authorization } = request.headers;
        if (!authorization) {
            throw new BadRequestException('É Necessário token de autenticação');
        }
        if (!/^Bearer /.test(authorization)) {
            throw new BadRequestException('Token mal formatado');
        }
        const token = authorization.replace('Bearer', '').trim() as string;
        try {
            const jwtData = jwt.verify(
                token,
                this.config.get('JWT_SECRET'),
            ) as any;
            const user = await this.repo.getbyId(jwtData.id);
            if (!user) {
                throw new UnauthorizedException('not found');
            }
            if (user.email !== jwtData.email) {
                throw new UnauthorizedException('wrong email');
            }
            request.user = user;
            return true;
        } catch (err) {
            if (
                err instanceof jwt.JsonWebTokenError ||
                err instanceof SyntaxError
            ) {
                throw new UnauthorizedException('Token mal formatado');
            }
            return false;
        }
    }
}
