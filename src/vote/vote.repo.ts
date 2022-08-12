import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class VoteRepo {
    constructor(private db: PrismaService) {}

    async getParticipantById(idParticipant: number) {
        return await this.db.participants.findFirst({
            where: {
                id: idParticipant,
            },
        });
    }

    async getParticipantByUserIdAndPoolId(poolId: number, userId: number) {
        return await this.db.participants.findFirst({
            where: {
                userId,
                poolId,
            },
        });
    }

    async createVote(
        poolId: number,
        voteOwnerId: number,
        votedParticipantId: number,
    ) {
        return await this.db.votes.create({
            data: {
                poolId,
                ownerId: voteOwnerId,
                votedId: votedParticipantId,
            },
        });
    }

    async toggleVoteOnParticipant(participantId: number) {
        return await this.db.participants.update({
            where: {
                id: participantId,
            },
            data: {
                alreadyVoted: true,
            },
        });
    }

    async getVotesResult(poolId: number) {
        return await this.db.participants.findMany({
            where: {
                poolId,
            },
            include: {
                user: true,
                _count: {
                    select: {
                        voted: true,
                    },
                },
            },
        });
    }
}
