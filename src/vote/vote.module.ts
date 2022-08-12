import { Module } from '@nestjs/common';
import { UserRepo } from 'src/user/user.repo';
import { VoteController } from './vote.controller';
import { VoteRepo } from './vote.repo';
import { VoteService } from './vote.service';

@Module({
    controllers: [VoteController],
    providers: [VoteService, UserRepo, VoteRepo],
})
export class VoteModule {}
