import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PoolData } from 'src/interfaces/pool';
import { AuthUser } from 'src/interfaces/user';
import { CreatePoolDto } from './dto/createPool.dto';
import { ParticipantsList } from './dto/participantsList.dto';
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

    async getFromUser(user: AuthUser) {
        return await this.repo.getByUserId(user.id);
    }

    async getPool(id: number) {
        const pool = await this.repo.getById(id);
        if (!pool) {
            throw new NotFoundException('Pool não eccontrada');
        }

        return pool;
    }

    async addParticipants(poolId: number, usersList: ParticipantsList) {
        try {
            let { Participants: participants } = await this.repo.getById(
                poolId,
            );
            const idMap = new Map();
            participants.forEach((item) => {
                idMap.set(item.user.id, true);
            });
            console.log(participants);
            const usersIdToAdd = usersList.users.filter((id) => {
                return !idMap.get(id) ? true : false;
            });

            if (usersIdToAdd.length === 0) {
                throw new BadRequestException('Nenhum usuário adicionável');
            }
            await this.repo.addParticipants(poolId, usersIdToAdd);
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                throw new BadRequestException();
            }
            throw err;
        }
    }
}
