import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserFactory } from './factory/user.factory';
import * as pactum from 'pactum';
import { User } from '@prisma/client';
import { PoolFactory } from './factory/pool.factory';

describe('Pool (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let userFactory: UserFactory;
    let poolFactory: PoolFactory;
    let user: User;
    const SIGNIN = '/auth/signin';
    const CREATEPOOL = '/pool';

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
                forbidNonWhitelisted: true,
            }),
        );

        await app.init();
        await app.listen(3000);

        prisma = app.get(PrismaService);
        userFactory = new UserFactory(prisma);
        poolFactory = new PoolFactory(prisma);
        pactum.request.setBaseUrl('http://localhost:3000');

        const { email, name, password, imageUrl } =
            userFactory.generateUserData();
        user = await userFactory.createUser({
            email,
            name,
            password,
            imageUrl,
        });
        user.password = password;
        await pactum
            .spec()
            .post(SIGNIN)
            .withBody({ email, password })
            .stores('userToken', 'token');
    });

    afterAll(async () => {
        app.close();
        await prisma.cleanDb();
    });

    describe('Test Create pool', () => {
        it('Testing the creation of a pool with sucess - 201', async () => {
            const body = poolFactory.generatePoolData();
            await pactum
                .spec()
                .post('/pool')
                .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                .withBody(body)
                .expectStatus(201);

            const pool = await poolFactory.inspectPool(body.name, user.id);
            const owner = await poolFactory.inspectParticipant(
                body.name,
                user.id,
            );
            expect(pool).not.toBeNull();
            expect(owner).not.toBeNull();
        });

        it('Testing creating a pool with the same name - should fail - 409', async () => {
            const { name } = await poolFactory.createPool(user.id);
            await pactum
                .spec()
                .post(CREATEPOOL)
                .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                .withBody({ name })
                .expectStatus(409);
        });
    });

    describe('Test getting pools', () => {
        it('Testing getting pools from user', async () => {
            await poolFactory.createPool(user.id);
            return pactum
                .spec()
                .get('/pool')
                .withHeaders({ Authorization: 'Bearer $S{userToken}' })
                .expectStatus(200);
        });
    });
});
