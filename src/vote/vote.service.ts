import {
    ConflictException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { VoteRepo } from './vote.repo';

@Injectable()
export class VoteService {
    constructor(private prisma: PrismaService, private repo: VoteRepo) {}

    async vote(idParticipantToVote: number, poolId: number, userId: number) {
        console.log(idParticipantToVote);
        const [votedParticipant, voteOwner] = await Promise.all([
            this.repo.getParticipantById(idParticipantToVote),
            this.repo.getParticipantByUserIdAndPoolId(poolId, userId),
        ]);
        console.log(votedParticipant, voteOwner);
        if (voteOwner.alreadyVoted) {
            throw new ForbiddenException('Você já votou');
        }
        if (!voteOwner) {
            throw new ForbiddenException('Você Não faz parte dessa pool');
        }
        if (!votedParticipant || poolId !== votedParticipant.poolId) {
            throw new ForbiddenException('Participante não pertece a pool');
        }
        if (voteOwner.id === votedParticipant.id) {
            throw new ConflictException('Não se pode votar em si mesmo');
        }

        return await Promise.all([
            this.repo.createVote(poolId, voteOwner.id, votedParticipant.id),
            this.repo.toggleVoteOnParticipant(voteOwner.id),
        ]);
    }

    async result(poolId: number) {
        const { closed } = await this.prisma.pool.findFirst({
            where: {
                id: poolId,
            },
        });

        if (!closed) {
            throw new ForbiddenException(
                'A votação ainda não acabou ainda não possui resutado',
            );
        }

        return await this.repo.getVotesResult(poolId);
    }

    async votesCount(poolId: number) {
        return await this.prisma.votes.findMany({
            where: {
                poolId,
            },
        });
    }
}
