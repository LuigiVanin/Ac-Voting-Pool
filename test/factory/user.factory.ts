import { SignUpDto } from 'src/auth/dto';
import { faker } from '@faker-js/faker';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export class UserFactory {
    constructor(private db: PrismaService) {}

    generateUserData(data?: {
        email?: string;
        name?: string;
        imageUrl?: string;
        password?: string;
    }): SignUpDto {
        return {
            email: data?.email || faker.internet.email(),
            name: data?.name || faker.internet.userName(),
            imageUrl: data?.imageUrl || faker.image.people(),
            password: data?.password || faker.internet.password(7),
        };
    }

    async createUser(userData?: SignUpDto) {
        if (!userData) {
            userData = this.generateUserData();
        }
        const data: SignUpDto = {
            ...userData,
            password: await bcrypt.hash(userData.password, 10),
        };
        return await this.db.user.create({
            data: {
                ...data,
            },
        });
    }

    async inspectUser(data: { name?: string; email?: string; id?: number }) {
        return await this.db.user.findUnique({
            where: {
                ...data,
            },
        });
    }
}
