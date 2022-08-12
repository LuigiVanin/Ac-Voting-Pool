import { faker } from '@faker-js/faker';
import { CreatePoolDto } from 'src/pool/dto/createPool.dto';
import { PrismaService } from 'src/prisma/prisma.service';

export class PoolFactory {
    constructor(private db: PrismaService) {}

    generatePoolData(data?: { name?: string; desc?: string }): CreatePoolDto {
        return {
            name: data?.name || faker.music.songName(),
            desc: data?.desc || faker.lorem.words(5),
        };
    }

    async createPool(ownerId: number) {
        const poolData = await this.db.pool.create({
            data: {
                ownerId,
                ...this.generatePoolData(),
            },
        });

        await this.addParticipant(poolData.id, ownerId);
        return poolData;
    }

    async inspectPool(poolName: string, userId: number) {
        return await this.db.pool.findFirst({
            where: {
                name: poolName,
                ownerId: userId,
            },
        });
    }

    async inspectParticipant(poolName: string, userId: number) {
        return await this.db.participants.findMany({
            where: {
                pool: {
                    name: poolName,
                },
                userId,
            },
        });
    }

    async addParticipant(poolId: number, userId: number) {
        return await this.db.participants.create({
            data: {
                poolId,
                userId,
            },
        });
    }
}
