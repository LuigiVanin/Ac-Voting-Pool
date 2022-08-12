import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { AuthUser } from 'src/interfaces/user';
import { PoolParticipantGuard } from 'src/pool/guards';
import { VoteBody } from './dto';
import { VoteService } from './vote.service';

@Controller('pool')
export class VoteController {
    constructor(private voteService: VoteService) {}

    @UseGuards(JwtGuard, PoolParticipantGuard)
    @Post(':id/vote')
    async vote(
        @Body() vote: VoteBody,
        @GetUser() user: AuthUser,
        @Param('id') poolId: number,
    ) {
        return await this.voteService.vote(
            vote.votedParticipantId,
            poolId,
            user.id,
        );
    }

    @UseGuards(JwtGuard, PoolParticipantGuard)
    @Get(':id/result')
    async getResult(@Param('id') poolId: number) {
        return await this.voteService.result(poolId);
    }

    @UseGuards(JwtGuard, PoolParticipantGuard)
    @Get(':id/count')
    async getVotesCount(@Param('id') poolId: number) {
        return (await this.voteService.votesCount(poolId)).length;
    }
}
