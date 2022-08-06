import { Injectable } from '@nestjs/common';
import { PoolData } from 'src/interfaces/pool';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class PoolRepo {
    constructor(private prisma: PrismaService) {}

    async create(data: PoolData) {
        return await this.prisma.pool.create({
            data: {
                ...data,
                Participants: {
                    create: {
                        userId: data.ownerId,
                    },
                },
            },
        });
    }

    async getByNameAndOwner(ownerId: number, poolName: string) {
        return await this.prisma.pool.findFirst({
            where: {
                name: poolName,
                ownerId,
            },
        });
    }
}
