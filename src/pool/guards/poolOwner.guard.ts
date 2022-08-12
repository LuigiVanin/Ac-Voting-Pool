import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { VoteRepo } from 'src/vote/vote.repo';

@Injectable()
export class PoolOwnerGuard implements CanActivate {
    constructor(private prisma: PrismaService, private repo: VoteRepo) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let { id } = request.params;
        const { user } = request;
        if (!id) {
            return false;
        }
        id = parseInt(id);
        if (isNaN(id)) {
            throw new BadRequestException('Mal formatado');
        }
        try {
            console.log(id, user.id);
            const [pool, participant] = await Promise.all([
                this.prisma.pool.findUnique({
                    where: {
                        id,
                    },
                }),
                this.repo.getParticipantByUserIdAndPoolId(id, user.id),
            ]);
            if (!participant) {
                throw new ForbiddenException(
                    'Você não pertence a essa pool ou pool não existe',
                );
            }
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
            request.participant = participant;
            return true;
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                return false;
            }
            throw err;
        }
    }
}
