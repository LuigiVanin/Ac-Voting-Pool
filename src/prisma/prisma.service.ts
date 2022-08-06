import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        console.log(config.get('DATABASE_URL'));
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL'),
                },
            },
        });
    }

    async cleanDb() {
        await this.$transaction([
            this.$executeRaw`TRUNCATE TABLE votes CASCADE`,
            this.$executeRaw`TRUNCATE TABLE partipants CASCADE`,
            this.$executeRaw`TRUNCATE TABLE pools CASCADE`,
            this.$executeRaw`TRUNCATE TABLE users CASCADE`,
        ]);
    }
}
