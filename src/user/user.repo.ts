import { Injectable } from '@nestjs/common';
import { SignUpDto } from 'src/auth/dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class UserRepo {
    constructor(private prisma: PrismaService) {}

    async getUserByEmailOrName(data: { email?: string; name?: string }) {
        return await this.prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { name: data.name }],
            },
        });
    }

    async getbyId(id: number) {
        return await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async createUser(user: SignUpDto) {
        return await this.prisma.user.create({
            data: {
                ...user,
            },
        });
    }
}
