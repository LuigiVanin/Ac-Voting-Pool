import { Module } from '@nestjs/common';
import { PoolService } from './pool.service';
import { PoolController } from './pool.controller';
import { PoolRepo } from './pool.repo';
import { UserRepo } from 'src/user/user.repo';
import { VoteRepo } from 'src/vote/vote.repo';

@Module({
    providers: [PoolService, PoolRepo, UserRepo, VoteRepo],
    controllers: [PoolController],
})
export class PoolModule {}
