import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { Participants } from '@prisma/client';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { AuthUser } from 'src/interfaces/user';
import { GetParticipant } from './decorators';
import { CreatePoolDto } from './dto/createPool.dto';
import { ParticipantsList } from './dto/participantsList.dto';
import { PoolOwnerGuard, PoolParticipantGuard } from './guards';
import { PoolService } from './pool.service';

@UseGuards(JwtGuard)
@Controller('pool')
export class PoolController {
    constructor(private poolService: PoolService) {}
    @Post('')
    async createPool(
        @GetUser() user: AuthUser,
        @Body() poolData: CreatePoolDto,
    ) {
        return this.poolService.create(user, poolData);
    }

    @Get('')
    async getPoolFromUser(@GetUser() user: AuthUser) {
        return await this.poolService.getFromUser(user);
    }

    @Get(':id')
    @UseGuards(JwtGuard, PoolParticipantGuard)
    async getPoolById(@Param('id') id: number) {
        return this.poolService.getPool(id);
    }

    @Post(':id')
    @UseGuards(JwtGuard, PoolOwnerGuard)
    async addParticipants(
        @Param('id') id: number,
        @Body() listIds: ParticipantsList,
    ) {
        return await this.poolService.addParticipants(id, listIds);
    }

    @Patch(':id/close')
    @UseGuards(JwtGuard, PoolOwnerGuard)
    async closePool(@Param('id') id: number) {
        return await this.poolService.closePool(id);
    }
}
