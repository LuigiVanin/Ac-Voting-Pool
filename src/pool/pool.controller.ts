import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtGuard } from 'src/auth/guards';
import { AuthUser } from 'src/interfaces/user';
import { CreatePoolDto } from './dto/createPool.dto';
import { PoolService } from './pool.service';

@Controller('pool')
export class PoolController {
    constructor(private poolService: PoolService) {}

    @UseGuards(JwtGuard)
    @Post('')
    async createPool(
        @GetUser() user: AuthUser,
        @Body() poolData: CreatePoolDto,
    ) {
        console.log(poolData);
        return this.poolService.create(user, poolData);
    }
}
