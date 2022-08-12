import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    Param,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PoolOwnerGuard implements CanActivate {
    constructor(private prisma: PrismaService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let { id } = request.params;
        const { user } = request;
        if (!id) {
            return false;
        }
        id = parseInt(id);
        try {
            console.log(id, user.id);
            const pool = await this.prisma.pool.findUnique({
                where: {
                    id,
                },
            });
            if (!pool) {
                throw new BadRequestException('Essa pool não existe');
            }
            if (
                ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) &&
                pool.closed
            ) {
                return false;
            }
            if (pool.ownerId !== user.id) {
                return false;
            }
            return true;
        } catch (err) {
            return false;
        }
    }
}
