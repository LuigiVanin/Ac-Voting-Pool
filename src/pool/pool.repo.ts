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

    async getByUserId(userId: number) {
        return await this.prisma.pool.findMany({
            where: {
                Participants: {
                    some: { userId },
                },
            },
            include: {
                Participants: {
                    select: {
                        user: {
                            select: {
                                email: true,
                                id: true,
                                name: true,
                                imageUrl: true,
                                isInvited: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async getById(id: number) {
        return await this.prisma.pool.findUnique({
            where: {
                id,
            },
            include: {
                Participants: {
                    select: {
                        user: {
                            select: {
                                email: true,
                                id: true,
                                name: true,
                                imageUrl: true,
                                isInvited: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async addParticipants(poolId: number, usersIdArray: number[]) {
        return await this.prisma.participants.createMany({
            data: [...usersIdArray.map((id) => ({ poolId, userId: id }))],
        });
    }
}
