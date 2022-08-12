import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { VoteRepo } from 'src/vote/vote.repo';

@Injectable()
export class PoolParticipantGuard implements CanActivate {
    constructor(private repo: VoteRepo) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        let { id } = request.params;
        const { user } = request;
        if (!id) {
            return false;
        }
        id = parseInt(id);
        try {
            const participant = await this.repo.getParticipantByUserIdAndPoolId(
                id,
                user.id,
            );
            console.log(participant);
            if (!participant) {
                throw new ForbiddenException(
                    'Você não pertence a essa pool ou pool não existe',
                );
            }
            request.participant = participant;
            return true;
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new BadRequestException();
            }
            throw err;
        }
    }
}
