import { PrismaService } from 'src/prisma/prisma.service';
import { PoolFactory } from './pool.factory';
import { UserFactory } from './user.factory';

export class Factory {
    user: UserFactory;
    pool: PoolFactory;
    constructor(db: PrismaService) {
        this.user = new UserFactory(db);
        this.pool = new PoolFactory(db);
    }
}
