import {
    BadRequestException,
    ConflictException,
    Injectable,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PoolData } from 'src/interfaces/pool';
import { AuthUser } from 'src/interfaces/user';
import { CreatePoolDto } from './dto/createPool.dto';
import { PoolRepo } from './pool.repo';

@Injectable()
export class PoolService {
    constructor(private repo: PoolRepo) {}
    async create(user: AuthUser, poolData: CreatePoolDto) {
        try {
            const pool = await this.repo.getByNameAndOwner(
                user.id,
                poolData.name,
            );
            if (pool) {
                throw new ConflictException(
                    'Já Existe uma Pool com esse nome para esse usuário',
                );
            }
            const data: PoolData = {
                ownerId: user.id,
                ...poolData,
            };
            return await this.repo.create(data);
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new BadRequestException();
            }
            throw err;
        }
    }
}
